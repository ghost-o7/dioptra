"use strict";
// Dioptra - Weitere Rechner: Visus, Tönung, Kassenanteil für Brillengläser.
Views.visus = {
  title: "Visus", group: "refraktion", sub: "Dezimal, Snellen, LogMAR",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.visus", [
      { name: "dec", label: "Visus dezimal", step: 0.1, decimals: 2, min: 0.01, max: 2.5, quick: [0.1, 0.3, 0.5, 0.8, 1, 1.25] },
      { name: "logmar", label: "LogMAR", step: 0.1, decimals: 2, sign: true, min: -0.4, max: 2, quick: [0, 0.1, 0.3, 0.5, 1] }], update);
    let lock = false;
    function update(v, src) {
      if (lock) return; lock = true;
      let r = null;
      // Das zuletzt geänderte Feld führt; wird es geleert, wird auch das andere geleert.
      if (src === "logmar") { if (v.logmar != null) { r = Calc.visus(Calc.visusFromLogmar(v.logmar)); if (r) g.fields.dec.set(Calc.roundTo(r.dec, 0.01)); } else g.fields.dec.set(null); }
      else if (v.dec != null) { r = Calc.visus(v.dec); if (r) g.fields.logmar.set(Calc.roundTo(r.logmar, 0.01)); }
      else g.fields.logmar.set(null);
      lock = false;
      out.replaceChildren(); text = "";
      if (!r) { out.append(note(v.dec != null && v.dec <= 0 ? "Visus muss größer als 0 sein." : "Dezimalvisus oder LogMAR eingeben.")); return; }
      out.append(resultRow("Dezimal", fmt(r.dec, 2)), resultRow("Snellen (m)", "6/" + fmt(r.snellen6, 1)), resultRow("Snellen (ft)", "20/" + fmt(r.snellen20, 0)), resultRow("LogMAR", fmt(r.logmar, 2, { sign: true })));
      text = "Visus " + fmt(r.dec, 2) + " = 6/" + fmt(r.snellen6, 1) + " = 20/" + fmt(r.snellen20, 0) + ", LogMAR " + fmt(r.logmar, 2, { sign: true });
    }
    g.fields.dec.o.onChange = () => { g.save(); update(g.get(), "dec"); };
    g.fields.logmar.o.onChange = () => { g.save(); update(g.get(), "logmar"); };
    const tb = el("tbody");
    for (const d of [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.63, 0.8, 1.0, 1.25, 1.6, 2.0]) { const r = Calc.visus(d); tb.append(el("tr", el("td", { text: fmt(d, 2) }), el("td", { text: "6/" + fmt(r.snellen6, 1) }), el("td", { text: "20/" + fmt(r.snellen20, 0) }), el("td", { text: fmt(r.logmar, 2, { sign: true }) }))); }
    main.append(section("Umrechnung", out).wide(), section("Eingabe", el("div.grid2", g.node("dec"), g.node("logmar")), note("Fahrerlaubnis: beidäugig mindestens 0,7 (Gruppe 1) nach FeV Anlage 6. Erwerbsminderung und Blindheit haben eigene Grenzen.")),
      section("Tabelle", el("div.table-wrap", el("table", el("thead", el("tr", el("th", { text: "Dezimal" }), el("th", { text: "6/x" }), el("th", { text: "20/x" }), el("th", { text: "LogMAR" }))), tb))));
    update(g.get(), "dec"); App.copy(() => text);
  }
};

Views.toenung = {
  title: "Tönung", group: "fassung", sub: "Filterkategorien 0 bis 4",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.toenung", [{ name: "t", label: "Lichttransmission", unit: "%", step: 5, decimals: 0, min: 0, max: 100, quick: [85, 75, 50, 25, 15, 8] }], update);
    function update(v) {
      out.replaceChildren(); text = "";
      const c = Calc.tintCategory(v.t);
      if (!c) { out.append(note("Transmission in Prozent eingeben (Tönung 75 % = Transmission 25 %).")); return; }
      out.append(el("div.rx-box.big", el("span", { text: "Kategorie" }), el("span.rx-val", { text: String(c.cat) }), el("span.rx-sub", { text: c.use })),
        resultRow("Absorption (Tönungsgrad)", fmt(100 - v.t, 0) + " %"), resultRow("Straßenverkehr tags", c.cat <= 3 ? "geeignet" : "nicht geeignet"), resultRow("Straßenverkehr nachts", v.t >= 75 ? "geeignet" : "nicht geeignet (unter 75 %)"));
      text = "Transmission " + fmt(v.t, 0) + " % = Tönung " + fmt(100 - v.t, 0) + " %, Filterkategorie " + c.cat + " (" + c.use + ")";
    }
    const tb = el("tbody");
    for (const c of Calc.TINT_CATS) tb.append(el("tr", el("td", { text: String(c.cat) }), el("td", { text: fmt(c.min, 0) + " bis " + fmt(c.max, 0) + " %" }), el("td", { text: c.use })));
    main.append(section("Ergebnis", out).wide(), section("Eingabe", g.node("t")),
      section("Kategorien nach EN ISO 12312-1", el("div.table-wrap", el("table", el("thead", el("tr", el("th", { text: "Kat." }), el("th", { text: "Transmission" }), el("th", { text: "Einsatz" }))), tb))));
    update(g.get()); App.copy(() => text);
  }
};

Views.kasse = {
  title: "Kassenanteil Gläser", group: "preis", sub: "Festbetrag und Zuzahlung",
  render(main) {
    const out = el("div.results"); let text = "";
    const st = Store.get("dioptra.calc.kasse.opts", { typ: "Einstärken", unter18: true, lichtschutz: false, uv400: false });
    const g = fieldGroup("dioptra.calc.kasse", [
      { name: "R_sph", label: "Sphäre rechts", unit: "dpt", step: 0.25, sign: true, min: -30, max: 30 }, { name: "R_cyl", label: "Zylinder rechts", unit: "dpt", step: 0.25, sign: true, min: -10, max: 10 },
      { name: "L_sph", label: "Sphäre links", unit: "dpt", step: 0.25, sign: true, min: -30, max: 30 }, { name: "L_cyl", label: "Zylinder links", unit: "dpt", step: 0.25, sign: true, min: -10, max: 10 },
      { name: "prisma", label: "Prisma je Glas", unit: "cm/m", step: 0.5, min: 0, max: 10 }], update);
    const saveOpts = () => { Store.set("dioptra.calc.kasse.opts", st); update(g.get()); };
    function update(v) {
      out.replaceChildren(); text = "";
      if (v.R_sph == null && v.L_sph == null) { out.append(note("Glaswerte eingeben. Erwachsene haben nur bei schwerer Sehbeeinträchtigung Anspruch (Visus beidseits höchstens 0,3 oder über ±6 dpt bzw. cyl über 4 dpt).")); return; }
      let sum = 0, zuz = 0; const lines = [];
      for (const eye of ["R", "L"]) {
        if (v[eye + "_sph"] == null) continue;
        const r = Calc.festbetragGlas(FESTBETRAG, { typ: st.typ, sph: v[eye + "_sph"], cyl: num(v[eye + "_cyl"], 0), prisma: num(v.prisma, 0), lichtschutz: st.lichtschutz, uv400: st.uv400 });
        const z = Calc.zuzahlung(r.sum, st.unter18);
        out.append(el("h3", { text: eye === "R" ? "Rechtes Glas" : "Linkes Glas" }));
        if (!r.ok) { out.append(note(r.hinweis)); lines.push(eye + ": " + r.hinweis); continue; }
        for (const p of r.parts) out.append(resultRow(p.name, fmtEur(p.betrag)));
        out.append(resultRow("Kasse je Glas", fmtEur(r.sum), z ? "Zuzahlung " + fmtEur(z) : "keine Zuzahlung"));
        sum += r.sum; zuz += z; lines.push(eye + ": Kasse " + fmtEur(r.sum) + (z ? ", Zuzahlung " + fmtEur(z) : ""));
      }
      out.append(el("div.sum-total", el("span", { text: "Kasse für beide Gläser" }), el("span", { text: fmtEur(sum) })),
        resultRow("Gesetzliche Zuzahlung gesamt", fmtEur(zuz), st.unter18 ? "unter 18 keine" : "10 %, 5 bis 10 € je Glas"),
        resultRow("Refraktionsbestimmung", fmtEur(FESTBETRAG.refraktion), "einmal je Verordnung"),
        note("Richtwerte nach der Festbetragsbekanntmachung 2021 (inkl. MwSt.). Seit 1.3.2025 gelten bundesweit keine Festbeträge mehr; die Kassen erstatten über Versorgungsverträge in praktisch gleicher Höhe. Für die Abrechnung die Vertragsliste der Kasse prüfen."));
      text = "Kassenanteil " + st.typ + (st.unter18 ? " (unter 18)" : "") + ":\n" + lines.join("\n") + "\nGesamt Kasse " + fmtEur(sum) + ", Zuzahlung " + fmtEur(zuz);
    }
    main.append(section("Kassenanteil", out).wide(),
      section("Glasart", segmented([["Einstärken", "Einstärken"], ["Mehrstärken", "Mehrstärken"], ["Bifokal groß", "Bifokal groß"], ["Lentikular", "Lentikular"]], st.typ, v => { st.typ = v; saveOpts(); }, "Glasart"),
        toggleRow("Versicherte Person unter 18", st.unter18, v => { st.unter18 = v; saveOpts(); }, "Ohne gesetzliche Zuzahlung"),
        toggleRow("Lichtschutzglas", st.lichtschutz, v => { st.lichtschutz = v; saveOpts(); }), toggleRow("UV-Kantenfilter 400 nm", st.uv400, v => { st.uv400 = v; saveOpts(); })),
      section("Glaswerte", el("div.rx", el("div.field-col", eyeTitle("R"), g.node("R_sph"), g.node("R_cyl")), el("div.field-col", eyeTitle("L"), g.node("L_sph"), g.node("L_cyl"))), g.node("prisma")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};
