"use strict";
// Dioptra - Rechner zur Brillenglasbestimmung: HSA, Prismen, Transposition, Nahwerte. Ergebnis oben, Eingabe darunter.
const Views = window.Views || (window.Views = {});
const RUNDUNG = "Rundungshinweise: junge Kunden eher Richtung Minus, Presbyope eher Richtung Plus (Vorsicht Nebelung bei Fern- und Gleitsichtbrille), hochgradig Presbyope ohne Auto Richtung Plus, Zylinder tendenziell schwächer.";
function resetRow(g) { return el("div.row.end.wide", el("button.btn.ghost.small", { type: "button", text: "Felder leeren", on: { click: () => g.reset() } })); }
function emptyBoxes(sub) { return el("div.rx", rxBox("R", null, null, sub), rxBox("L", null, null, sub)); }

// ---- HSA ---------------------------------------------------------------------------------------------
Views.hsa = {
  title: "HSA-Rechner", group: "refraktion", sub: "Scheitelabstand umrechnen",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.hsa", [...rxDefs("hsa", "R"), ...rxDefs("hsa", "L"),
      { name: "hsaOld", label: "bei HSA", unit: "mm", step: 1, decimals: 0, min: 0, max: 30, quick: RX_QUICK.hsa, initial: 12 },
      { name: "hsaNew", label: "neuer HSA", unit: "mm", step: 1, decimals: 0, min: 0, max: 30, quick: RX_QUICK.hsa }], update);
    function update(v) {
      out.replaceChildren(); text = "";
      if (v.hsaOld == null || v.hsaNew == null) { out.append(emptyBoxes("Abstände eingeben")); return; }
      const boxes = el("div.rx.big"); const lines = [];
      for (const eye of ["R", "L"]) {
        const r = eyeRx(v, eye);
        if (!r) { boxes.append(rxBox(eye, null, null, "Werte eingeben")); continue; }
        const h = Calc.hsa(r.sph, r.cyl, r.axis, v.hsaOld, v.hsaNew);
        const rounded = { sph: Calc.roundTo(h.sph, 0.25), cyl: Calc.roundTo(h.cyl, 0.25), axis: h.axis };
        boxes.append(rxBox(eye, (eye === "R" ? "Rechts" : "Links") + " bei " + fmt(v.hsaNew, 0) + " mm", rxLines(rounded),
          "genau " + fmt(h.sph, 3, { sign: true }) + (r.cyl ? " / " + fmt(h.cyl, 3, { sign: true }) : ""),
          "Hauptschnitte " + fmtDpt(h.m1) + " → " + fmt(h.n1, 3, { sign: true }) + (r.cyl ? ", " + fmtDpt(h.m2) + " → " + fmt(h.n2, 3, { sign: true }) : "")));
        lines.push(eye + ": " + rxText(r) + " bei " + fmt(v.hsaOld, 0) + " mm → " + rxText(rounded) + " bei " + fmt(v.hsaNew, 0) + " mm (genau " + fmt(h.sph, 3, { sign: true }) + (r.cyl ? " " + fmt(h.cyl, 3, { sign: true }) : "") + ")");
      }
      out.append(boxes, note("Gerundet auf 0,25 dpt. " + RUNDUNG));
      text = lines.join("\n");
    }
    main.append(section("Umgerechnete Werte", out).wide(),
      section("Hornhautscheitelabstand", el("div.grid2", g.node("hsaOld"), g.node("hsaNew")), note("Messbrille meist 12 mm, fertige Brille 10 bis 15 mm. Kontaktlinse = 0 mm.")),
      section("Werte aus Refraktion oder Brille", rxGrid(g)), resetRow(g));
    update(g.get());
    App.copy(() => text);
  }
};

// ---- Prismen ----------------------------------------------------------------------------------------
function taboSvg(r) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 440 236"); svg.setAttribute("class", "tabo"); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "TABO-Schema mit Prismenrichtungen");
  function n(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k of Object.keys(attrs)) e.setAttribute(k, attrs[k]); svg.append(e); return e; }
  const maxP = Math.max(r.in.r.p, r.in.l.p, r.split.r.p, r.split.l.p, 0.01);
  function lens(cx, cy, label) {
    n("circle", { cx, cy, r: 78, class: "ring" }); n("line", { x1: cx - 78, y1: cy, x2: cx + 78, y2: cy, class: "axis" }); n("line", { x1: cx, y1: cy - 78, x2: cx, y2: cy + 78, class: "axis" });
    const t = (x, y, s, anchor) => { const e = n("text", { x, y, "text-anchor": anchor || "middle" }); e.textContent = s; };
    t(cx + 83, cy + 4, "0°", "start"); t(cx, cy - 84, "90°"); t(cx - 83, cy + 4, "180°", "end"); t(cx, cy + 96, "270°"); t(cx - 55, cy - 62, label);
  }
  function arrow(cx, cy, p, base, cls) {
    if (p < 0.005) return;
    const len = 18 + 52 * (p / maxP), a = base * Math.PI / 180, x2 = cx + len * Math.cos(a), y2 = cy - len * Math.sin(a);
    n("line", { x1: cx, y1: cy, x2, y2, class: cls });
    const hx = Math.cos(a), hy = -Math.sin(a), s = 7;
    n("polygon", { points: `${x2},${y2} ${x2 - s * hx + s * 0.55 * hy},${y2 - s * hy - s * 0.55 * hx} ${x2 - s * hx - s * 0.55 * hy},${y2 - s * hy + s * 0.55 * hx}`, class: cls });
  }
  lens(104, 116, "R"); lens(336, 116, "L");
  arrow(104, 116, r.in.r.p, r.in.r.base, "arrow-in"); arrow(336, 116, r.in.l.p, r.in.l.base, "arrow-in");
  arrow(104, 116, r.split.r.p, r.split.r.base, "arrow-split"); arrow(336, 116, r.split.l.p, r.split.l.base, "arrow-split");
  return svg;
}
Views.prismen = {
  title: "Prismenrechner", group: "refraktion", sub: "Zusammenfassen und verteilen",
  render(main) {
    const out = el("div.results"), pic = el("div"); let text = "";
    const g = fieldGroup("dioptra.calc.prismen", [
      { name: "rP", label: "Prisma rechts", unit: "cm/m", step: 0.5, min: 0, max: 40 }, { name: "rB", label: "Basis rechts", unit: "°", step: 5, decimals: 0, min: 0, max: 359, quick: RX_QUICK.base },
      { name: "lP", label: "Prisma links", unit: "cm/m", step: 0.5, min: 0, max: 40 }, { name: "lB", label: "Basis links", unit: "°", step: 5, decimals: 0, min: 0, max: 359, quick: RX_QUICK.base }], update);
    function comp(eye, c) { return rxBox(eye, null, null, "horizontal " + fmt(Math.abs(c.h), 3) + " " + (c.hDir || ""), "vertikal " + fmt(Math.abs(c.v), 3) + " " + (c.vDir || "")); }
    function update(v) {
      out.replaceChildren(); pic.replaceChildren(); text = "";
      const rP = num(v.rP, 0), rB = num(v.rB, 0), lP = num(v.lP, 0), lB = num(v.lB, 0);
      if (!rP && !lP) { out.append(note("Prisma und Basislage je Auge aus Messbrille oder Phoropter eingeben. TABO: 0° rechts, 90° oben.")); return; }
      const r = Calc.prism(rP, rB, lP, lB);
      out.append(el("div.rx.big",
        rxBox("R", "Rechts", fmt(r.split.r.p, 2) + " cm/m", "Basis " + fmt(r.split.r.base, 1) + "°"),
        rxBox("L", "Links", fmt(r.split.l.p, 2) + " cm/m", "Basis " + fmt(r.split.l.base, 1) + "°")),
        note("Symmetrisch auf beide Augen verteilt."),
        el("h3", { text: "Gesamt, bezogen auf das rechte Auge" }),
        resultRow("Resultierendes Prisma", fmt(r.result.p, 3) + " cm/m", "Basis " + fmt(r.result.base, 2) + "°"),
        resultRow("Horizontal", fmt(Math.abs(r.total.h), 3) + " cm/m", r.total.hDir ? "Basis " + r.total.hDir : ""),
        resultRow("Vertikal", fmt(Math.abs(r.total.v), 3) + " cm/m", r.total.vDir ? "Basis rechts " + r.total.vDir : ""),
        el("h3", { text: "Komponenten je Auge" }), el("div.rx", comp("R", r.r), comp("L", r.l)));
      pic.append(taboSvg({ in: { r: { p: rP, base: rB }, l: { p: lP, base: lB } }, split: r.split }), el("div.legend", el("span.in", el("i"), "Eingabe"), el("span.split", el("i"), "symmetrisch verteilt")));
      text = `Prismen R ${fmt(rP, 2)} cm/m Basis ${fmt(rB, 0)}°, L ${fmt(lP, 2)} cm/m Basis ${fmt(lB, 0)}°\nGesamt (R-Auge): ${fmt(r.result.p, 3)} cm/m Basis ${fmt(r.result.base, 2)}° (horizontal ${fmt(Math.abs(r.total.h), 3)} ${r.total.hDir}, vertikal ${fmt(Math.abs(r.total.v), 3)} ${r.total.vDir ? "rechts " + r.total.vDir : ""})\nVerteilt: R ${fmt(r.split.r.p, 2)} cm/m Basis ${fmt(r.split.r.base, 1)}°, L ${fmt(r.split.l.p, 2)} cm/m Basis ${fmt(r.split.l.base, 1)}°`;
    }
    main.append(section("Ergebnis", out).wide(),
      section("Daten aus Messbrille / Phoropter", el("div.grid2", g.node("rP"), g.node("rB")), el("div.grid2", g.node("lP"), g.node("lB"))),
      section("TABO-Schema", pic, note("Blick auf die Kundin: rechtes Auge links im Bild. 0° liegt bei jedem Glas rechts, 90° oben. Vertikale Prismen wirken gegenläufig: Basis oben links entspricht Basis unten rechts.")), resetRow(g));
    update(g.get());
    App.copy(() => text);
  }
};

// ---- Transposition ----------------------------------------------------------------------------------
Views.transposition = {
  title: "Transposition", group: "refraktion", sub: "Plus- und Minuszylinder",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.transposition", [...rxDefs("tr", "R"), ...rxDefs("tr", "L")], update);
    function update(v) {
      out.replaceChildren(); const boxes = el("div.rx.big"); const lines = [];
      for (const eye of ["R", "L"]) {
        const r = eyeRx(v, eye);
        if (!r) { boxes.append(rxBox(eye, null, null, "Werte eingeben")); continue; }
        const t = Calc.transpose(r.sph, r.cyl, r.axis);
        const form = r.cyl > 0 ? "als Minuszylinder" : (r.cyl < 0 ? "als Pluszylinder" : "sphärisch");
        boxes.append(rxBox(eye, (eye === "R" ? "Rechts " : "Links ") + form, rxLines(t), "sphärisches Äquivalent " + fmtDpt(Calc.sphEq(r.sph, r.cyl)), "Hauptschnitte " + fmtDpt(r.sph) + " / " + fmtDpt(r.sph + r.cyl)));
        lines.push(eye + ": " + rxText(r) + " = " + rxText(t) + " (sph. Äq. " + fmtDpt(Calc.sphEq(r.sph, r.cyl)) + ")");
      }
      out.append(boxes); text = lines.join("\n");
    }
    main.append(section("Andere Zylinderschreibweise", out).wide(), section("Werte", rxGrid(g), note("Sphäre plus Zylinder, Zylinder mit umgekehrtem Vorzeichen, Achse um 90° gedreht.")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};

// ---- Nahwerte ----------------------------------------------------------------------------------------
Views.nah = {
  title: "Nahwerte", group: "refraktion", sub: "Addition und Zwischenbereich",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.nah", [...rxDefs("nah", "R", { add: true }), ...rxDefs("nah", "L", { add: true }),
      { name: "factor", label: "Anteil der Addition im Zwischenbereich", step: 0.1, decimals: 2, min: 0, max: 1, initial: 0.5, quick: [0.33, 0.5, 0.66, 0.75] }], update);
    function update(v) {
      out.replaceChildren(); const f = num(v.factor, 0.5); const lines = [];
      for (const eye of ["R", "L"]) {
        const r = eyeRx(v, eye);
        if (!r || r.add == null) { out.append(el("div.rx", rxBox(eye, null, null, "Fernwerte und Addition eingeben"))); continue; }
        const n = Calc.near(r.sph, r.cyl, r.axis, r.add), z = Calc.near(r.sph, r.cyl, r.axis, r.add, f);
        out.append(el("div.rx.big", rxBox(eye, (eye === "R" ? "Rechts" : "Links") + " Nähe", rxLines(n), "Add " + fmtDpt(r.add)), rxBox(eye, "Zwischenbereich", rxLines(z), "Add × " + fmt(f, 2) + " = " + fmtDpt(r.add * f))));
        lines.push(eye + ": Ferne " + rxText(r) + ", Add " + fmtDpt(r.add) + " → Nähe " + rxText(n) + ", Zwischen " + rxText(z));
      }
      text = lines.join("\n");
    }
    main.append(section("Ergebnis", out).wide(), section("Fernwerte und Addition", rxGrid(g)),
      section("Zwischenbereich", g.node("factor"), note("Für Bildschirm- und Raumkomfortgläser oft die halbe bis zwei Drittel Addition. Der Hersteller gibt die Degression vor.")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};
