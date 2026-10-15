"use strict";
// Dioptra - Rechner zu Fassung und Glas: Dezentration (Prentice), Mindestdurchmesser, Glasdicke.
Views.prentice = {
  title: "Dezentration", group: "fassung", sub: "Prismatische Nebenwirkung",
  render(main) {
    const out = el("div.results"); let text = "";
    const dz = eye => [{ name: eye + "_dx", label: "horizontal (+ innen / − außen)", unit: "mm", step: 0.5, decimals: 1, sign: true, min: -15, max: 15 }, { name: eye + "_dy", label: "vertikal (+ oben / − unten)", unit: "mm", step: 0.5, decimals: 1, sign: true, min: -15, max: 15 }];
    const g = fieldGroup("dioptra.calc.prentice", [...rxDefs("pz", "R"), ...rxDefs("pz", "L"), ...dz("R"), ...dz("L")], update);
    function update(v) {
      out.replaceChildren(); const boxes = el("div.rx.big"); const lines = [];
      for (const eye of ["R", "L"]) {
        const r = eyeRx(v, eye); const dx = num(v[eye + "_dx"], 0), dy = num(v[eye + "_dy"], 0);
        if (!r || (!dx && !dy)) { boxes.append(rxBox(eye, null, null, "Glaswerte und Dezentration eingeben")); continue; }
        const p = Calc.prentice(eye, r.sph, r.cyl, r.axis, dx, dy);
        boxes.append(rxBox(eye, null, fmt(p.p, 2) + " cm/m", "Basis " + fmt(p.base, 1) + "°", "horizontal " + fmt(Math.abs(p.h), 2) + " " + (p.hDir || "") + ", vertikal " + fmt(Math.abs(p.v), 2) + " " + (p.vDir || "")));
        lines.push(eye + ": " + rxText(r) + ", Dezentration " + fmt(dx, 1) + " / " + fmt(dy, 1) + " mm → " + fmt(p.p, 2) + " cm/m Basis " + fmt(p.base, 1) + "°");
      }
      out.append(boxes); text = lines.join("\n");
    }
    main.append(section("Prismatische Nebenwirkung", out).wide(), section("Glaswerte", rxGrid(g)),
      section("Verschiebung des optischen Mittelpunkts", el("div.rx", el("div.field-col", eyeTitle("R"), g.node("R_dx"), g.node("R_dy")), el("div.field-col", eyeTitle("L"), g.node("L_dx"), g.node("L_dy"))),
        note("Plusgläser wirken mit Basis in Richtung der Verschiebung, Minusgläser entgegen. Der Zylinder wird über seine Achse berücksichtigt.")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};

Views.durchmesser = {
  title: "Mindestdurchmesser", group: "fassung", sub: "Passt das Glas in die Fassung?",
  render(main) {
    const out = el("div.results"); let text = "";
    const g = fieldGroup("dioptra.calc.durchmesser", [
      { name: "a", label: "Scheibenlänge a", unit: "mm", step: 1, decimals: 1, min: 20, max: 80 }, { name: "b", label: "Scheibenhöhe b", unit: "mm", step: 1, decimals: 1, min: 10, max: 70 },
      { name: "steg", label: "Steg", unit: "mm", step: 1, decimals: 1, min: 8, max: 30, quick: [14, 16, 17, 18, 19, 20] },
      { name: "ed", label: "gemessene Diagonale (leer: aus a und b)", unit: "mm", step: 1, decimals: 1, min: 20, max: 90 },
      { name: "pdR", label: "PD rechts", unit: "mm", step: 0.5, decimals: 1, min: 20, max: 45, quick: [30, 31, 32, 33, 34] }, { name: "pdL", label: "PD links", unit: "mm", step: 0.5, decimals: 1, min: 20, max: 45, quick: [30, 31, 32, 33, 34] },
      { name: "dvR", label: "vertikal rechts (+ oben)", unit: "mm", step: 0.5, decimals: 1, sign: true, min: -15, max: 15 }, { name: "dvL", label: "vertikal links (+ oben)", unit: "mm", step: 0.5, decimals: 1, sign: true, min: -15, max: 15 },
      { name: "zugabe", label: "Zugabe", unit: "mm", step: 1, decimals: 0, min: 0, max: 6, initial: 2 }], update);
    function update(v) {
      out.replaceChildren(); text = "";
      if ([v.a, v.steg, v.pdR, v.pdL].some(x => x == null)) { out.append(note("Scheibenlänge, Steg und monokulare PD eingeben. Scheibenhöhe oder gemessene Diagonale bestimmt die Glasgröße.")); return; }
      const r = Calc.minDiameter({ a: v.a, b: num(v.b, 0), ed: num(v.ed, 0), steg: v.steg, pdR: v.pdR, pdL: v.pdL, dvR: num(v.dvR, 0), dvL: num(v.dvL, 0), zugabe: num(v.zugabe, 2) });
      const boxes = el("div.rx.big"); const lines = [];
      for (const eye of ["R", "L"]) {
        const e = r[eye.toLowerCase()];
        const dez = fmt(Math.abs(e.dez), 1) + " mm " + (e.dez > 0 ? "innen" : (e.dez < 0 ? "außen" : "")) + (e.dezV ? ", vertikal " + fmt(Math.abs(e.dezV), 1) + " mm" : "");
        boxes.append(rxBox(eye, null, "Ø " + fmt(e.minD, 1) + " mm", "Dezentration " + dez, e.blank ? "Rohglas ab Ø " + e.blank + " mm" : "größer als übliche Rohgläser"));
        lines.push(eye + ": Mindestdurchmesser " + fmt(e.minD, 1) + " mm (Dezentration " + dez + ", Rohglas " + (e.blank || "–") + ")");
      }
      out.append(boxes, resultRow("Verwendete Diagonale", fmt(r.ed, 1) + " mm", v.ed == null ? "aus a und b geschätzt" : "gemessen"), resultRow("Fassungs-PD", fmt(v.a + v.steg, 1) + " mm", "a + Steg"));
      text = "Fassung " + fmt(v.a, 1) + "/" + fmt(num(v.b, 0), 1) + " Steg " + fmt(v.steg, 1) + ", PD " + fmt(v.pdR, 1) + "/" + fmt(v.pdL, 1) + "\n" + lines.join("\n");
    }
    main.append(section("Ergebnis", out).wide(), section("Fassung (Kastenmaß)", el("div.grid3", g.node("a"), g.node("b"), g.node("steg")), g.node("ed")),
      section("Zentrierung", el("div.grid2", g.node("pdR"), g.node("pdL")), el("div.grid2", g.node("dvR"), g.node("dvL")), g.node("zugabe"), note("Mindestdurchmesser = Diagonale + 2 × Dezentration + Zugabe. Die Box-Diagonale aus a und b überschätzt die Scheibe meist etwas.")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};

Views.dicke = {
  title: "Glasdicke", group: "fassung", sub: "Brechzahlen im Vergleich",
  render(main) {
    const out = el("div"); let text = "";
    const INDICES = [{ n: 1.5, name: "1,5 Standard", from: 0 }, { n: 1.6, name: "1,6 dünn", from: 2 }, { n: 1.67, name: "1,67 extra dünn", from: 4 }, { n: 1.74, name: "1,74 maximal dünn", from: 6 }];
    const g = fieldGroup("dioptra.calc.dicke", [
      { name: "sph", label: "Sphäre", unit: "dpt", step: 0.25, sign: true, min: -30, max: 30 }, { name: "cyl", label: "Zylinder", unit: "dpt", step: 0.25, sign: true, min: -10, max: 10 },
      { name: "d", label: "Durchmesser", unit: "mm", step: 5, decimals: 0, min: 40, max: 85, initial: 65, quick: [55, 60, 65, 70, 75] }, { name: "tmin", label: "Mindestdicke", unit: "mm", step: 0.1, decimals: 1, min: 0.5, max: 3, initial: 1, quick: [0.8, 1, 1.2, 1.5] }], update);
    function update(v) {
      out.replaceChildren(); text = "";
      if (v.sph == null) { out.append(note("Sphäre eingeben. Bei Zylinder zählt der stärkere Hauptschnitt.")); return; }
      const F = Calc.worstMeridian(v.sph, num(v.cyl, 0)), d = num(v.d, 65), tmin = num(v.tmin, 1);
      const base = Calc.thickness(F, 1.5, d, tmin), baseMax = Math.max(base.center, base.edge);
      let rec = INDICES[0]; for (const i of INDICES) if (Math.abs(F) >= i.from) rec = i;
      const tb = el("tbody"); const lines = [];
      for (const i of INDICES) {
        const t = Calc.thickness(F, i.n, d, tmin), mx = Math.max(t.center, t.edge);
        tb.append(el("tr" + (i === rec ? ".mark" : ""), el("td", { text: i.name + (i === rec ? " ●" : "") }), el("td", { text: fmt(t.center, 1) + " mm" }), el("td", { text: fmt(t.edge, 1) + " mm" }), el("td", { text: i.n === 1.5 ? "–" : "−" + fmt((1 - mx / baseMax) * 100, 0) + " %" })));
        lines.push(i.name + ": Mitte " + fmt(t.center, 1) + " mm, Rand " + fmt(t.edge, 1) + " mm");
      }
      out.append(el("div.table-wrap", el("table", el("thead", el("tr", el("th", { text: "Index" }), el("th", { text: "Mitte" }), el("th", { text: "Rand" }), el("th", { text: "dünner" }))), tb)),
        note("● Empfehlung nach KIND-Staffel: 1,6 ab ±2,00, 1,67 ab ±4,00, 1,74 ab ±6,00 dpt. Berechnet für " + fmtDpt(F) + " im stärksten Hauptschnitt, Ø " + fmt(d, 0) + " mm, Basiskurve nach Vogel. Näherung für das Beratungsgespräch."));
      text = "Glasdicke für " + fmtDpt(F) + ", Ø " + fmt(d, 0) + " mm:\n" + lines.join("\n");
    }
    main.append(section("Vergleich der Brechzahlen", out).wide(), section("Glas", el("div.grid2", g.node("sph"), g.node("cyl")), el("div.grid2", g.node("d"), g.node("tmin")), note("Mindestdicke: Mitte bei Minusgläsern, Rand bei Plusgläsern.")), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};
