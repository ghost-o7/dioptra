"use strict";
// Dioptra - Preisrechner: Grundglas, Optionen aus der Gläserdatenbank, Fassung, freie Positionen, Rabatt. Nichts wird
// über den aktuellen Entwurf hinaus gespeichert, keine Kundendaten.
Views.preis = {
  title: "Preisrechner", group: "preis", sub: "Brille mit Ausstattung kalkulieren",
  render(main) {
    DB.glaeser.load();
    const st = Object.assign({ typ: "Gleitsicht", glas: null, optionen: [], posten: [] }, Store.get("dioptra.preis", {}));
    for (const k of Object.keys(st)) if (!["typ", "glas", "optionen", "posten"].includes(k)) delete st[k];
    const save = () => { Store.set("dioptra.preis", st); update(); };
    const out = el("div.results"); let text = "";
    const typen = ["Einstärken", "Gleitsicht", "Raumkomfort"];
    const glasList = el("div"), optList = el("div"), postenList = el("div");
    const items = () => DB.glaeser.items;
    const basis = () => items().filter(i => i.typ === st.typ);
    const optionen = () => items().filter(i => (i.typ === "Option" || i.typ === "Tönung") && i.id !== "kind-opt-prisma");
    const price = i => typeof i.preis === "number" ? i.preis : 0;
    // Grundglas immer aus dem aktuellen Typ; fehlt die gespeicherte Wahl, das erste Glas des Typs, sonst keins.
    const currentGlas = () => { const list = basis(); return list.find(i => i.id === st.glas) || list[0] || null; };

    function drawGlas() {
      glasList.replaceChildren();
      const list = basis(), cur = currentGlas();
      if (!list.length) { glasList.append(note("Keine Gläser dieses Typs in der Datenbank.")); return; }
      for (const i of list) glasList.append(el("button.opt", { type: "button", "aria-pressed": String(cur && cur.id === i.id), on: { click: () => { st.glas = i.id; save(); drawGlas(); } } },
        el("span.opt-box"), el("span.opt-text", el("span", { text: i.name }), el("span.opt-sub", { text: i.verfuegbar || "" })), el("span.opt-price", { text: fmtEur(price(i)) })));
    }
    function drawOpts() {
      optList.replaceChildren();
      for (const i of optionen()) {
        const on = st.optionen.includes(i.id);
        const blocked = !on && i.gruppe && (i.gruppe === "index" || i.gruppe === "toenung") && st.optionen.some(id => { const o = DB.glaeser.byId(id); return o && o.gruppe === i.gruppe; });
        optList.append(el("button.opt", { type: "button", "aria-pressed": String(on), disabled: blocked ? "true" : null, on: { click: () => {
          st.optionen = on ? st.optionen.filter(x => x !== i.id) : st.optionen.concat(i.id); save(); drawOpts();
        } } }, el("span.opt-box"), el("span.opt-text", el("span", { text: i.name }), el("span.opt-sub", { text: (i.gruppe === "index" ? "Nur eine Glasstärke" : (i.gruppe === "toenung" ? "Nur eine Tönung" : (i.typ))) })), el("span.opt-price", { text: "+ " + fmtEur(price(i)) })));
      }
    }
    function drawPosten() {
      postenList.replaceChildren();
      st.posten.forEach((p, idx) => {
        const name = el("input.text", { type: "text", placeholder: "Bezeichnung", "aria-label": "Bezeichnung" }); name.value = p.name || "";
        const betrag = el("input.text", { type: "text", inputmode: "decimal", placeholder: "€", "aria-label": "Betrag" }); betrag.value = p.betrag == null ? "" : fmt(p.betrag, 2);
        name.addEventListener("input", () => { p.name = name.value; save(); });
        betrag.addEventListener("change", () => { const v = parseNum(betrag.value); p.betrag = Number.isNaN(v) ? null : v; betrag.value = p.betrag == null ? "" : fmt(p.betrag, 2); save(); });
        postenList.append(el("div.pos-row", name, betrag, el("button.icon-btn", { type: "button", "aria-label": "Position entfernen", text: "✕", on: { click: () => { st.posten.splice(idx, 1); save(); drawPosten(); } } })));
      });
    }
    const g = fieldGroup("dioptra.preis.felder", [
      { name: "prisma", label: "Gläser mit Prisma", unit: "Stück", step: 1, decimals: 0, min: 0, max: 2, initial: 0, quick: [0, 1, 2] },
      { name: "fassung", label: "Fassung", unit: "€", step: 10, decimals: 2, min: 0, max: 5000, quick: [0, 99, 149, 199, 249] },
      { name: "rabattProzent", label: "Rabatt", unit: "%", step: 5, decimals: 0, min: 0, max: 100, quick: [0, 10, 15, 20, 25] },
      { name: "rabattEuro", label: "Rabatt", unit: "€", step: 10, decimals: 2, min: 0, max: 5000 }], () => update());

    function calc() {
      const v = g.get(); const rows = []; let sum = 0;
      const glas = currentGlas();
      if (glas) { rows.push([glas.name + " (" + glas.typ + ", Paar)", price(glas)]); sum += price(glas); }
      for (const id of st.optionen) { const o = DB.glaeser.byId(id); if (o) { rows.push([o.name, price(o)]); sum += price(o); } }
      const pr = DB.glaeser.byId("kind-opt-prisma"); const n = num(v.prisma, 0);
      if (pr && n > 0) { const je = price(pr) / 2; rows.push(["Prisma, " + n + " Glas" + (n > 1 ? "er" : ""), je * n]); sum += je * n; }
      if (v.fassung != null && v.fassung > 0) { rows.push(["Fassung", v.fassung]); sum += v.fassung; }
      for (const p of st.posten) if (p.betrag != null) { rows.push([p.name || "Position", p.betrag]); sum += p.betrag; }
      let rabatt = 0;
      if (v.rabattProzent) rabatt += sum * v.rabattProzent / 100;
      if (v.rabattEuro) rabatt += v.rabattEuro;
      rabatt = Math.min(rabatt, sum);
      return { rows, sum, rabatt, total: sum - rabatt, v };
    }
    function update() {
      const c = calc(); out.replaceChildren();
      for (const [name, betrag] of c.rows) out.append(resultRow(name, fmtEur(betrag)));
      if (c.rabatt) out.append(resultRow("Rabatt", "− " + fmtEur(c.rabatt)));
      out.append(el("div.sum-total", el("span", { text: "Gesamt" }), el("span", { text: fmtEur(c.total) })), note("Preise je Glaspaar laut Datenbank, inkl. MwSt. Ohne Gewähr."));
      text = "Kalkulation Brille\n" + c.rows.map(([n, b]) => n + ": " + fmtEur(b)).join("\n") + (c.rabatt ? "\nRabatt: −" + fmtEur(c.rabatt) : "") + "\nGesamt: " + fmtEur(c.total);
    }
    main.append(section("Kalkulation", out).wide(),
      section("Grundglas", segmented(typen.map(t => [t, t]), st.typ, v => { st.typ = v; save(); drawGlas(); }, "Glastyp"), glasList),
      section("Ausstattung", optList, g.node("prisma")),
      section("Fassung und weitere Positionen", g.node("fassung"), postenList, el("button.btn.ghost.small", { type: "button", text: "+ Position", on: { click: () => { st.posten.push({ name: "", betrag: null }); save(); drawPosten(); postenList.lastChild.querySelector("input").focus(); } } })),
      section("Rabatt", el("div.grid2", g.node("rabattProzent"), g.node("rabattEuro"))),
      el("div.row.end.wide", el("button.btn.ghost.small", { type: "button", text: "Neue Kalkulation", on: { click: () => { st.optionen = []; st.posten = []; st.glas = null; save(); g.reset(); drawGlas(); drawOpts(); drawPosten(); } } })));
    drawGlas(); drawOpts(); drawPosten(); update();
    App.copy(() => text);
  }
};
