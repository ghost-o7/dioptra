"use strict";
// Dioptra - Hörakustik: Eigenanteil, Batterien, Hörgeräte-Datenbank. Einschaltbar unter Mehr.
Views.hoerEigenanteil = {
  title: "Eigenanteil Hörgeräte", group: "hoer", sub: "Kasse, Zuzahlung, Gesamt",
  render(main) {
    const out = el("div.results"); let text = "";
    const st = Object.assign({ ohren: 2, preisIstEigenanteil: true, hochgradig: false, otoplastik: "oto" }, Store.get("dioptra.hoer.opts", {}));
    const saveOpts = () => { Store.set("dioptra.hoer.opts", st); update(g.get()); };
    const g = fieldGroup("dioptra.hoer.eigen", [
      { name: "preis", label: "Preis je Gerät", unit: "€", step: 50, decimals: 2, min: 0, max: 10000, quick: [0, 210, 435, 785, 1085, 1610, 2305] },
      { name: "festbetrag", label: "Festbetrag Kasse je Ohr", unit: "€", step: 10, decimals: 2, min: 0, max: 2000, initial: HOER_FESTBETRAG.geraet, quick: [{ v: HOER_FESTBETRAG.geraet, label: "Standard" }, { v: HOER_FESTBETRAG.geraetHochgradig, label: "hochgradig" }] },
      { name: "ladestation", label: "Ladestation", unit: "€", step: 10, decimals: 2, min: 0, max: 1000, quick: [0, 150, 199] },
      { name: "sonstiges", label: "Sonstiges (Versicherung, Zubehör)", unit: "€", step: 10, decimals: 2, min: 0, max: 5000 }], update);
    function update(v) {
      out.replaceChildren(); text = "";
      if (v.preis == null) { out.append(note("Preis je Gerät eingeben. Bei KIND-Preisen ist das bereits der Eigenanteil nach Kassenzuschuss.")); return; }
      const oto = st.otoplastik === "oto" ? HOER_FESTBETRAG.otoplastik : (st.otoplastik === "schirm" ? HOER_FESTBETRAG.schirmchen : 0);
      const r = Calc.hoerEigenanteil({ preis: v.preis, preisIstEigenanteil: st.preisIstEigenanteil, ohren: st.ohren, festbetrag: num(v.festbetrag, HOER_FESTBETRAG.geraet), zweitesOhrFaktor: HOER_FESTBETRAG.zweitesOhrFaktor, zuzahlung: HOER_FESTBETRAG.zuzahlung, otoplastik: oto, ladestation: num(v.ladestation, 0), sonstiges: num(v.sonstiges, 0) });
      out.append(el("div.sum-total", el("span", { text: "Zu zahlen" }), el("span", { text: fmtEur(r.zuZahlen) })),
        resultRow("Eigenanteil Geräte", fmtEur(r.geraeteEigen), r.n + " Gerät" + (r.n > 1 ? "e" : "")),
        resultRow("Gesetzliche Zuzahlung", fmtEur(r.zuzahlung), "10 € je Gerät"),
        r.extras ? resultRow("Ladestation, Sonstiges", fmtEur(r.extras)) : null,
        el("h3", { text: "Kasse" }),
        resultRow("Festbetrag Geräte", fmtEur(r.kasseGeraete), r.n === 2 ? "zweites Ohr −20 %" : ""),
        oto ? resultRow("Ohrpassstücke", fmtEur(r.kasseOto), r.n + " Stück") : null,
        resultRow("Gesamtwert Geräte", fmtEur(r.geraeteGesamt), "Kasse plus Eigenanteil"),
        note("Festbeträge: " + HOER_FESTBETRAG.stand + ". Kassen können abweichen, bei KIND gelten die Preise für Ersatzkassen (vdek). Anspruch nur mit HNO-Verordnung."));
      text = "Hörgeräte " + (r.n === 2 ? "beidseitig" : "einseitig") + ": Eigenanteil " + fmtEur(r.geraeteEigen) + ", Zuzahlung " + fmtEur(r.zuzahlung) + (r.extras ? ", Zubehör " + fmtEur(r.extras) : "") + ", zu zahlen " + fmtEur(r.zuZahlen) + " (Kasse " + fmtEur(r.kasseGeraete + r.kasseOto) + ")";
    }
    main.append(section("Ergebnis", out).wide(),
      section("Versorgung", segmented([[1, "Ein Ohr"], [2, "Beide Ohren"]], st.ohren, v => { st.ohren = Number(v); saveOpts(); }, "Ohren"),
        toggleRow("Preis ist bereits Eigenanteil", st.preisIstEigenanteil, v => { st.preisIstEigenanteil = v; saveOpts(); }, "So stehen die Preise in der KIND-Liste. Aus: Preis ist der Gesamtpreis vor Kassenanteil."),
        segmented([["oto", "Otoplastik"], ["schirm", "Schirmchen"], ["keine", "Ohne"]], st.otoplastik, v => { st.otoplastik = v; saveOpts(); }, "Ohrpassstück"), g.node("preis"), g.node("festbetrag")),
      section("Zubehör", el("div.grid2", g.node("ladestation"), g.node("sonstiges"))), resetRow(g));
    update(g.get()); App.copy(() => text);
  }
};

Views.batterien = {
  title: "Batterien", group: "hoer", sub: "Größen, Laufzeit, Jahresbedarf",
  render(main) {
    const out = el("div.results"); let text = "";
    const st = Object.assign({ typ: "312" }, Store.get("dioptra.hoer.batt", {}));
    const g = fieldGroup("dioptra.hoer.battf", [
      { name: "tage", label: "Laufzeit je Zelle", unit: "Tage", step: 1, decimals: 0, min: 1, max: 30, initial: 6 },
      { name: "geraete", label: "Geräte", unit: "Stück", step: 1, decimals: 0, min: 1, max: 2, initial: 2, quick: [1, 2] },
      { name: "preis", label: "Preis je Zelle", unit: "€", step: 0.1, decimals: 2, min: 0, max: 5, initial: BATTERIE_PREIS.jeZelle, quick: [{ v: 1, label: "6er 6 €" }, { v: 0.8, label: "12er 9,60 €" }, { v: 0.5, label: "36er 18 €" }] }], update);
    function update(v) {
      out.replaceChildren();
      const r = Calc.batterieJahr(num(v.tage, 6), num(v.geraete, 2), num(v.preis, 0.5));
      out.append(el("div.sum-total", el("span", { text: "Je Jahr" }), el("span", { text: fmtEur(r.kosten) })), resultRow("Zellen je Jahr", String(r.zellen)), resultRow("Packungen à 36", String(Math.ceil(r.zellen / 36))), resultRow("Je Monat", fmtEur(r.kosten / 12)));
      text = "Batterien: " + r.zellen + " Zellen je Jahr, " + fmtEur(r.kosten) + " je Jahr";
    }
    const tb = el("tbody");
    for (const b of BATTERIEN) tb.append(el("tr" + (st.typ === b.typ ? ".mark" : ""), { on: { click: () => { st.typ = b.typ; Store.set("dioptra.hoer.batt", st); g.fields.tage.set(b.tageMittel); for (const r of tb.children) r.classList.toggle("mark", r === tb.children[BATTERIEN.indexOf(b)]); } } },
      el("td", { text: b.typ + " (" + b.farbe + ")" }), el("td", { text: b.mm + " mm" }), el("td", { text: b.tage }), el("td", { text: b.geraete })));
    main.append(section("Jahresbedarf", out).wide(), section("Rechnung", el("div.grid3", g.node("tage"), g.node("geraete"), g.node("preis")), note("Zeile in der Tabelle antippen übernimmt die mittlere Laufzeit. KIND-Preise: 6 Stück 6 €, 12 Stück 9,60 €, 36 Stück 18 €.")),
      section("Zink-Luft-Größen", el("div.table-wrap", el("table", el("thead", el("tr", el("th", { text: "Typ" }), el("th", { text: "Maß" }), el("th", { text: "Tage" }), el("th", { text: "Geräte" }))), tb))).wide());
    update(g.get()); App.copy(() => text);
  }
};

Views.hoergeraete = collectionView({ col: DB.hoer, title: "Hörgeräte", route: "hoergeraete", placeholder: "Suchen: Modell, Stufe, Bauform",
  sub: i => [i.hersteller, i.typ, i.bauform, i.bestellnr ? "Nr. " + i.bestellnr : ""].filter(Boolean).join(" · "),
  fields: [{ name: "name", label: "Name" }, { name: "hersteller", label: "Hersteller" }, { name: "typ", label: "Typ" }, { name: "bauform", label: "Bauform" }, { name: "preis", label: "Eigenanteil je Gerät (€)" }, { name: "bestellnr", label: "Bestellnummer" }, { name: "eigenschaften", label: "Eigenschaften (eine je Zeile)", area: true }, { name: "hinweis", label: "Hinweis" }, { name: "notizen", label: "Eigene Notizen", area: true }],
  note: "Eigenanteile je Gerät laut kind.com für Ersatzkassen-Versicherte, Stand Oktober 2026, zuzüglich 10 € Zuzahlung. Ohne Gewähr." });
Views.hoergeraete.group = "hoer"; Views.hoergeraete.sub = "KIND-Stufen und Modelle";
