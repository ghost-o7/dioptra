"use strict";
// Dioptra - Rechenkern. Reine Funktionen ohne DOM, damit sie unter Node getestet werden können.
// Winkel: TABO-Schema, 0° rechts, 90° oben, gegen den Uhrzeigersinn, wie vom Betrachter (Augenoptiker) gesehen.
// Daraus folgt: rechtes Auge 0° = nasal (innen), linkes Auge 0° = temporal (außen).
(function (g) {
  const RAD = Math.PI / 180;

  function roundTo(v, step) { return Math.round(v / step) * step; }
  function norm360(a) { a = a % 360; if (a < 0) a += 360; return a; }
  function nearZero(v) { return Math.abs(v) < 1e-9; }

  // ---- HSA (Hornhautscheitelabstand) ------------------------------------------------------------
  // Wirkung eines Hauptschnitts in neuem Abstand: F' = F / (1 - d * F), d = (alt - neu) in Metern.
  // 0 mm steht für die Kontaktlinse. Ergebnis wie beim HSA-Rechner von DER AUGENOPTIKER.
  function hsaMeridian(F, hsaOld, hsaNew) {
    if (nearZero(F)) return 0;
    const d = (hsaOld - hsaNew) / 1000;
    return F / (1 - d * F);
  }
  function hsa(sph, cyl, axis, hsaOld, hsaNew) {
    const m1 = sph, m2 = sph + cyl;
    const n1 = hsaMeridian(m1, hsaOld, hsaNew);
    const n2 = hsaMeridian(m2, hsaOld, hsaNew);
    return { m1, m2, n1, n2, sph: n1, cyl: n2 - n1, axis };
  }

  // ---- Prismen ------------------------------------------------------------------------------------
  function dirH(eye, x) {
    if (nearZero(x)) return "";
    if (eye === "R") return x > 0 ? "innen" : "außen";
    return x > 0 ? "außen" : "innen";
  }
  function dirV(y) { if (nearZero(y)) return ""; return y > 0 ? "oben" : "unten"; }

  // Eingabe je Auge: Prisma (cm/m) und Basislage (°). Zusammenfassung bezogen auf das rechte Auge:
  // horizontal gilt innen = innen (Spiegelung), vertikal gilt oben links = unten rechts.
  function prism(rP, rB, lP, lB) {
    const r = { h: rP * Math.cos(rB * RAD), v: rP * Math.sin(rB * RAD) };
    const l = { h: lP * Math.cos(lB * RAD), v: lP * Math.sin(lB * RAD) };
    const total = { h: r.h - l.h, v: r.v - l.v };
    const p = Math.hypot(total.h, total.v);
    const base = nearZero(p) ? 0 : norm360(Math.atan2(total.v, total.h) / RAD);
    const half = p / 2;
    return {
      r: { h: r.h, v: r.v, hDir: dirH("R", r.h), vDir: dirV(r.v) },
      l: { h: l.h, v: l.v, hDir: dirH("L", l.h), vDir: dirV(l.v) },
      total: { h: total.h, v: total.v, hDir: dirH("R", total.h), vDir: dirV(total.v) },
      result: { p, base },
      split: { r: { p: half, base }, l: { p: half, base: nearZero(p) ? 0 : norm360(base + 180) } }
    };
  }

  // Ein Prisma in Basislage (°) in Komponenten eines Auges zerlegen, mit Richtungsworten.
  function prismComponents(eye, p, base) {
    const h = p * Math.cos(base * RAD), v = p * Math.sin(base * RAD);
    return { h, v, hDir: dirH(eye, h), vDir: dirV(v) };
  }

  // ---- Transposition / sphärisches Äquivalent --------------------------------------------------
  function transpose(sph, cyl, axis) {
    if (nearZero(cyl)) return { sph, cyl: 0, axis };
    let a = axis + 90; if (a > 180) a -= 180; if (a <= 0) a += 180;
    return { sph: sph + cyl, cyl: -cyl, axis: a };
  }
  function sphEq(sph, cyl) { return sph + cyl / 2; }

  // ---- Nahwerte -------------------------------------------------------------------------------------
  function near(sph, cyl, axis, add, factor) {
    const f = (factor == null) ? 1 : factor;
    return { sph: sph + add * f, cyl, axis };
  }

  // ---- Prentice: prismatische Nebenwirkung durch Dezentration ----------------------------------
  // Wirkungsmatrix des Glases im TABO-System: Fxx = S + C sin²a, Fyy = S + C cos²a, Fxy = -C sin a cos a.
  // Dezentrationsvektor d (mm) des optischen Mittelpunkts gegenüber der Pupille, Basisvektor P = F·d/10.
  // dxIn: Dezentration nach innen in mm (negativ = außen), dyUp: nach oben in mm (negativ = unten).
  function prentice(eye, sph, cyl, axis, dxIn, dyUp) {
    const a = axis * RAD, s = Math.sin(a), c = Math.cos(a);
    const Fxx = sph + cyl * s * s, Fyy = sph + cyl * c * c, Fxy = -cyl * s * c;
    const dx = (eye === "R") ? dxIn : -dxIn;  // in TABO-x umrechnen
    const dy = dyUp;
    const h = (Fxx * dx + Fxy * dy) / 10;
    const v = (Fxy * dx + Fyy * dy) / 10;
    const p = Math.hypot(h, v);
    const base = nearZero(p) ? 0 : norm360(Math.atan2(v, h) / RAD);
    return { h, v, hDir: dirH(eye, h), vDir: dirV(v), p, base };
  }

  // ---- Mindestdurchmesser ------------------------------------------------------------------------
  // Dezentration je Auge = (Scheibenlänge + Steg) / 2 - monokulare PD. Mindestdurchmesser = größte
  // Scheibendiagonale (ED) + 2 · Dezentration (horizontal und vertikal als Betrag) + Zugabe.
  function minDiameter(o) {
    const ed = o.ed > 0 ? o.ed : Math.hypot(o.a, o.b || 0);
    const blanks = [50, 55, 60, 65, 70, 75, 80, 85];
    function eye(pd, dv) {
      const dez = (o.a + o.steg) / 2 - pd;
      const dezV = dv || 0;
      const minD = ed + 2 * Math.abs(dez) + 2 * Math.abs(dezV) + (o.zugabe == null ? 2 : o.zugabe);
      const blank = blanks.find(b => b >= minD) || null;
      return { dez, dezV, minD, blank };
    }
    return { ed, r: eye(o.pdR, o.dvR), l: eye(o.pdL, o.dvL) };
  }

  // ---- Glasdicke (Näherung) ---------------------------------------------------------------------
  // Pfeilhöhe einer Fläche mit der Flächenwirkung F (dpt) bei Brechzahl n und Durchmesser d (mm):
  // r = (n - 1) / |F|, s = r - sqrt(r² - (d/2)²).
  // Basiskurve (Vorderfläche) nach Vogel: Plusglas F1 = F + 6, Minusglas F1 = F/2 + 6; Rückfläche F2 = F - F1.
  // Mitte minus Rand = s(F1) - s(F2). Dünne-Linsen-Näherung, Fertigungsdetails bleiben außen vor.
  function sag(F, n, d) {
    if (nearZero(F)) return 0;
    const r = (n - 1) / Math.abs(F) * 1000; // mm
    const h = d / 2;
    if (h >= r) return r; // Halbkugel, Grenzfall
    return r - Math.sqrt(r * r - h * h);
  }
  function baseCurve(F) { return F > 0 ? F + 6 : F / 2 + 6; }
  function thickness(F, n, d, tMin, F1) {
    if (F1 == null) F1 = baseCurve(F);
    const F2 = F - F1;
    const diff = sag(F1, n, d) - sag(F2, n, d); // Mitte minus Rand
    if (diff >= 0) return { center: tMin + diff, edge: tMin, sag: diff, F1, F2 };
    return { center: tMin, edge: tMin - diff, sag: -diff, F1, F2 };
  }
  // Für Sph/Zyl: ungünstigster Hauptschnitt bestimmt die größte Dicke.
  function worstMeridian(sph, cyl) {
    const m1 = sph, m2 = sph + cyl;
    return Math.abs(m1) >= Math.abs(m2) ? m1 : m2;
  }


  // ---- Visus ------------------------------------------------------------------------------------------
  // Dezimalvisus V, LogMAR = -log10(V), Snellen 6/x mit x = 6/V, 20/x mit x = 20/V.
  function visus(v) {
    if (!(v > 0)) return null;
    return { dec: v, logmar: -Math.log10(v), snellen6: 6 / v, snellen20: 20 / v };
  }
  function visusFromLogmar(l) { return Math.pow(10, -l); }

  // ---- Tönung: Filterkategorien nach EN ISO 12312-1 (Lichttransmission in %) ---------------------------
  const TINT_CATS = [
    { cat: 0, min: 80, max: 100, use: "Klar oder sehr hell, auch nachts im Straßenverkehr" },
    { cat: 1, min: 43, max: 80, use: "Hell, bedeckter Himmel" },
    { cat: 2, min: 18, max: 43, use: "Mittel, normaler Sonnenschein" },
    { cat: 3, min: 8, max: 18, use: "Dunkel, starke Sonne, Strand, Berge" },
    { cat: 4, min: 3, max: 8, use: "Sehr dunkel, Hochgebirge und Gletscher. Nicht zum Autofahren" }
  ];
  function tintCategory(t) {
    if (t == null || Number.isNaN(t)) return null;
    for (const c of TINT_CATS) if (t >= c.min && (t <= c.max)) return c;
    return t > 100 ? TINT_CATS[0] : (t < 3 ? { cat: 4, min: 0, max: 3, use: "Dunkler als Kategorie 4, keine Sonnenbrille nach Norm" } : null);
  }

  // ---- Kassenanteil Brillengläser (Festbetragstabelle, siehe data-extra.js) -------------------------
  // Liefert je Glas Grundbetrag und Zuschläge. table: {gruppen:[{typ, sphMax, cylMax, hb, betrag}], zuschlaege:{...}}.
  function festbetragGlas(table, o) {
    const sph = Math.abs(o.sph || 0), cyl = Math.abs(o.cyl || 0);
    const rows = table.gruppen.filter(g => g.typ === o.typ);
    const cylBase = Math.min(cyl, 4); // über 4 dpt kommt der Zuschlag auf die Gruppe „cyl bis 4"
    let base = null;
    for (const g of rows) if (sph <= g.sphMax + 1e-9 && cylBase <= g.cylMax + 1e-9) { base = g; break; }
    if (cyl > 8) base = null;
    const parts = [];
    if (base) parts.push({ name: base.name, betrag: base.betrag });
    const z = table.zuschlaege;
    if (cyl > 6) parts.push({ name: "Zuschlag cyl > 6 bis 8", betrag: z.cyl8 });
    else if (cyl > 4) parts.push({ name: "Zuschlag cyl > 4 bis 6", betrag: z.cyl6 });
    if (o.prisma > 3) parts.push({ name: "Zuschlag Prisma > 3 bis 6 cm/m", betrag: z.prisma6 });
    else if (o.prisma > 0) parts.push({ name: "Zuschlag Prisma bis 3 cm/m", betrag: z.prisma3 });
    if (o.lichtschutz) parts.push({ name: "Lichtschutz", betrag: z.lichtschutz });
    if (o.uv400) parts.push({ name: "UV-Kantenfilter 400 nm", betrag: z.uv400 });
    const sum = parts.reduce((a, p) => a + p.betrag, 0);
    return { base, parts, sum, ok: !!base, hinweis: base ? "" : (sph > 14 ? "Über ±14 dpt: kein Festbetrag, Einzelfall" : (cyl > 8 ? "Zylinder über 8 dpt: Einzelfall" : "Keine Gruppe gefunden")) };
  }
  // Gesetzliche Zuzahlung Hilfsmittel: 10 % des Betrags, mindestens 5, höchstens 10 € je Hilfsmittel; unter 18 keine.
  function zuzahlung(betrag, unter18) {
    if (unter18 || betrag <= 0) return 0;
    return Math.min(10, Math.max(5, betrag * 0.1));
  }

  // ---- Hörakustik: Eigenanteil -----------------------------------------------------------------------
  // o: {preis, preisIstEigenanteil, ohren(1|2), festbetrag, zweitesOhrFaktor, zuzahlung, otoplastik, ladestation, sonstiges}
  function hoerEigenanteil(o) {
    const n = o.ohren === 2 ? 2 : 1;
    const kasse1 = o.festbetrag, kasse2 = n === 2 ? o.festbetrag * (o.zweitesOhrFaktor == null ? 0.8 : o.zweitesOhrFaktor) : 0;
    const kasseGeraete = kasse1 + kasse2;
    const kasseOto = (o.otoplastik || 0) * n;
    let geraeteEigen, geraeteGesamt;
    if (o.preisIstEigenanteil) { geraeteEigen = o.preis * n; geraeteGesamt = geraeteEigen + kasseGeraete; }
    else { geraeteGesamt = o.preis * n; geraeteEigen = Math.max(0, geraeteGesamt - kasseGeraete); }
    const zuz = (o.zuzahlung == null ? 10 : o.zuzahlung) * n;
    const extras = (o.ladestation || 0) + (o.sonstiges || 0);
    return { n, kasseGeraete, kasseOto, geraeteGesamt, geraeteEigen, zuzahlung: zuz, extras, zuZahlen: geraeteEigen + zuz + extras };
  }
  // Batteriebedarf: Laufzeit in Tagen je Zelle, Geräte, Preis je Zelle → Zellen und Kosten je Jahr.
  function batterieJahr(laufzeitTage, geraete, preisJeZelle) {
    const zellen = Math.ceil(365 / laufzeitTage) * geraete;
    return { zellen, kosten: zellen * preisJeZelle };
  }

  g.Calc = { roundTo, norm360, hsa, hsaMeridian, prism, prismComponents, transpose, sphEq, near,
    prentice, minDiameter, sag, baseCurve, thickness, worstMeridian, dirH, dirV,
    visus, visusFromLogmar, TINT_CATS, tintCategory, festbetragGlas, zuzahlung, hoerEigenanteil, batterieJahr };
})(typeof window !== "undefined" ? window : globalThis);
