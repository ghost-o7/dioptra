"use strict";
// Dioptra - Datenbanken: Gläser und Hörgeräte als Sammlungen im localStorage, mit Startbestand, Suche,
// Bearbeiten, JSON-Sicherung und CSV-Einlesen. Neue Startbestandseinträge kommen bei höherer Seed-Version dazu,
// bearbeitete Einträge bleiben erhalten.
class Collection {
  constructor(key, seed, seedVersion, types) { this.key = key; this.seed = seed; this.seedVersion = seedVersion; this.types = types; this.items = []; this.version = 0; }
  load() {
    let db = Store.get(this.key, null);
    if (!db || !Array.isArray(db.items)) db = { version: 0, items: [] };
    if (db.version < this.seedVersion) {
      const have = new Set(db.items.map(i => i.id));
      for (const s of this.seed) if (!have.has(s.id)) db.items.push(Object.assign({}, s));
      db.version = this.seedVersion; Store.set(this.key, db);
    }
    this.items = db.items; this.version = db.version; return this.items;
  }
  save() { Store.set(this.key, { version: this.version, items: this.items }); }
  byId(id) { return this.items.find(i => i.id === id); }
  // Eintrag mit gleichem Namen (und Hersteller, falls angegeben) finden, Groß- und Kleinschreibung egal.
  // Gleiche Namen kommen vor (KIND Premium als Einstärken- und Gleitsichtglas), darum zählt der Typ mit, wenn er angegeben ist.
  byName(name, hersteller, typ) {
    const low = x => String(x || "").trim().toLowerCase();
    const n = low(name), h = low(hersteller), t = low(typ);
    return this.items.find(i => low(i.name) === n && (!h || low(i.hersteller) === h) && (!t || low(i.typ) === t));
  }
  // Felder in die erwartete Form bringen: Eigenschaften als Liste, Preis als Zahl, Texte als Text.
  normalize(raw) {
    const it = Object.assign({}, raw);
    if (typeof it.eigenschaften === "string") it.eigenschaften = it.eigenschaften.split(/\||\n/).map(x => x.trim()).filter(Boolean);
    else if (!Array.isArray(it.eigenschaften)) it.eigenschaften = [];
    else it.eigenschaften = it.eigenschaften.map(x => String(x));
    if (typeof it.preis === "string") { const p = parseNum(it.preis.replace(/[€\s]/g, "")); if (!Number.isNaN(p)) it.preis = p; }
    for (const k of ["name", "hersteller", "typ", "stufe", "index", "bestellnr", "verfuegbar", "lieferbereich", "hinweis", "notizen", "bauform"]) if (it[k] != null && typeof it[k] !== "string") it[k] = String(it[k]);
    it.id = String(it.id || "");
    return it;
  }
  put(item) { const i = this.items.findIndex(x => x.id === item.id); if (i >= 0) this.items[i] = item; else this.items.push(item); }
  upsert(item) { this.put(this.normalize(item)); this.save(); }
  remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); }
  resetSeed() { this.items = this.seed.map(s => Object.assign({}, s)); this.version = this.seedVersion; this.save(); }
  isSeed(item) { return this.seed.some(s => s.id === item.id); }
  exportJson() { return JSON.stringify({ app: "Dioptra", sammlung: this.key, version: this.version, exported: new Date().toISOString(), items: this.items }, null, 2); }
  importJson(text) {
    const o = JSON.parse(text);
    if (o && typeof o === "object" && !Array.isArray(o) && o.sammlung && o.sammlung !== this.key) throw new Error("Diese Sicherung gehört zu einer anderen Sammlung.");
    const items = Array.isArray(o) ? o : o.items;
    if (!Array.isArray(items)) throw new Error("Keine Liste in der Datei.");
    let n = 0;
    for (const raw of items) {
      if (!raw || typeof raw !== "object" || !raw.name) continue;
      const ex = (raw.id && this.byId(String(raw.id))) || this.byName(raw.name, raw.hersteller, raw.typ);
      const base = ex || { id: "imp-" + Math.random().toString(36).slice(2, 10), hersteller: "", typ: this.types[this.types.length - 1], eigenschaften: [] };
      const it = this.normalize(Object.assign({}, base, raw, { id: ex ? ex.id : (raw.id ? String(raw.id) : base.id) }));
      this.put(it); n++;
    }
    this.save();
    return n;
  }
  // CSV mit Kopfzeile. Trenner ; oder , oder Tab. Spalten nach Namen: id, name, hersteller, typ, stufe, preis, index,
  // bestellnr, verfuegbar, lieferbereich, eigenschaften (mit | getrennt), hinweis, notizen, bauform.
  importCsv(text) {
    const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error("CSV ohne Datenzeilen.");
    const sep = [";", "\t", ","].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0];
    const split = l => { const out = []; let cur = "", q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out.map(s => s.trim()); };
    const head = split(lines[0]).map(h => h.toLowerCase().replace(/[^a-zäöü]/g, ""));
    let n = 0;
    for (const line of lines.slice(1)) {
      const cells = split(line); const o = {};
      head.forEach((h, i) => { if (cells[i] != null && cells[i] !== "") o[h] = cells[i]; });
      if (!o.name) continue;
      if (!o.id) { const ex = this.byName(o.name, o.hersteller, o.typ); o.id = ex ? ex.id : "csv-" + Math.random().toString(36).slice(2, 10); }
      const base = this.byId(o.id) || { hersteller: "", typ: this.types[0], eigenschaften: [] };
      this.put(this.normalize(Object.assign({}, base, o))); n++;
    }
    this.save();
    return n;
  }
}
const DB = {
  glaeser: new Collection("dioptra.db.glaeser", KIND_SEED, SEED_VERSION, ["Einstärken", "Gleitsicht", "Raumkomfort", "Option", "Tönung", "Sonstiges"]),
  hoer: new Collection("dioptra.db.hoer", HOER_SEED, HOER_SEED_VERSION, ["Stufe", "Modell", "Zubehör", "Sonstiges"])
};

function priceText(i) {
  if (i.preis == null || i.preis === "") return "";
  const p = typeof i.preis === "number" ? fmt(i.preis, 2) + " €" : String(i.preis);
  const pre = (i.typ === "Option" || i.typ === "Tönung") ? "+ " : (i.hinweis === "ab" ? "ab " : "");
  return pre + p;
}

// Generische Listenansicht für eine Sammlung. cfg: {col, title, route, sub(item), fields:[...], note, placeholder}
function collectionView(cfg) {
  const col = cfg.col;
  const view = {
    title: cfg.title,
    render(main) {
      col.load();
      const ui = Store.get(col.key + ".ui", { typ: "", q: "" });
      const q = el("input.text", { type: "search", placeholder: cfg.placeholder || "Suchen", "aria-label": "Suchen", autocomplete: "off" });
      q.value = ui.q || "";
      const addBtn = el("button.btn", { type: "button", text: "Neu", on: { click: () => view.edit(main, null) } });
      const chips = el("div.chips", { role: "tablist" });
      const list = el("div.list");
      function chip(label, val) {
        const c = el("button.chip", { type: "button", role: "tab", text: label, "aria-selected": String(ui.typ === val),
          on: { click: () => { ui.typ = val; Store.set(col.key + ".ui", ui); for (const x of chips.children) x.setAttribute("aria-selected", "false"); c.setAttribute("aria-selected", "true"); draw(); } } });
        return c;
      }
      chips.append(chip("Alle", ""), ...col.types.map(t => chip(t, t)));
      function matches(i, s) {
        if (ui.typ && i.typ !== ui.typ) return false;
        if (!s) return true;
        const hay = [i.name, i.hersteller, i.stufe, i.bestellnr, i.hinweis, i.notizen, i.index, i.bauform, (i.eigenschaften || []).join(" ")].join(" ").toLowerCase();
        return s.split(/\s+/).every(w => hay.includes(w));
      }
      function draw() {
        const s = q.value.trim().toLowerCase();
        list.replaceChildren();
        const items = col.items.filter(i => matches(i, s));
        if (!items.length) { list.append(el("div.list-empty", { text: "Nichts gefunden." })); return; }
        for (const i of items) {
          list.append(el("button.lens", { type: "button", on: { click: () => view.detail(main, i.id) } },
            el("div.lens-top", el("span.lens-name", { text: i.name }), el("span.lens-price", { text: priceText(i) })),
            el("span.lens-sub", { text: cfg.sub(i) }),
            col.isSeed(i) ? null : el("div.pills", el("span.pill.custom", { text: "eigener Eintrag" }))));
        }
      }
      q.addEventListener("input", () => { ui.q = q.value; Store.set(col.key + ".ui", ui); draw(); });
      main.append(el("div.search", q, addBtn), chips, list, cfg.note ? el("p.note.wide", { text: cfg.note }) : null);
      draw();
    },
    detail(main, id) {
      const i = col.byId(id);
      if (!i) { App.show(cfg.route); return; }
      App.sub(cfg.title, () => App.show(cfg.route), { label: "Bearbeiten", onClick: () => view.edit(main, id) });
      main.replaceChildren();
      const dl = el("dl.kv");
      const kv = (k, v) => { if (v == null || v === "") return; dl.append(el("dt", { text: k }), el("dd", { text: v })); };
      for (const f of cfg.fields) if (!["name", "eigenschaften", "hinweis", "notizen"].includes(f.name)) kv(f.label, f.name === "preis" ? priceText(i) : i[f.name]);
      const props = (i.eigenschaften || []).length ? el("ul.plain", ...i.eigenschaften.map(p => el("li", { text: p }))) : null;
      main.append(...[el("section.card.wide", el("h2", { text: i.name }), dl),
        props ? section("Eigenschaften", props) : null,
        i.hinweis && i.hinweis !== "ab" ? section("Hinweis", el("p", { text: i.hinweis })) : null,
        i.notizen ? section("Eigene Notizen", el("p", { text: i.notizen })) : null].filter(Boolean));
    },
    edit(main, id) {
      const i = id ? Object.assign({}, col.byId(id)) : { id: "own-" + Date.now().toString(36), hersteller: "KIND", typ: col.types[0], eigenschaften: [] };
      App.sub(id ? "Bearbeiten" : "Neuer Eintrag", () => id ? view.detail(main, id) : App.show(cfg.route));
      main.replaceChildren();
      const f = {};
      function text(name, label, value, area) {
        const inp = el(area ? "textarea" : "input.text", Object.assign({ id: "ed_" + name, "aria-label": label }, area ? {} : { type: "text" }));
        inp.value = value == null ? "" : (Array.isArray(value) ? value.join("\n") : value); f[name] = inp;
        return el("div.field", el("label", { for: "ed_" + name, text: label }), inp);
      }
      const typ = el("select", { id: "ed_typ", "aria-label": "Typ" }, ...col.types.map(t => el("option", { value: t, text: t })));
      typ.value = col.types.includes(i.typ) ? i.typ : col.types[col.types.length - 1];
      const rows = cfg.fields.map(fd => fd.name === "typ" ? el("div.field", el("label", { for: "ed_typ", text: fd.label }), typ) : text(fd.name, fd.label, i[fd.name], fd.area));
      const save = el("button.btn", { type: "button", text: "Speichern", on: { click: () => {
        if (!f.name.value.trim()) { toast("Bitte einen Namen eingeben.", "err"); f.name.focus(); return; }
        const item = Object.assign({}, i, { typ: typ.value });
        for (const fd of cfg.fields) {
          if (fd.name === "typ") continue;
          const v = f[fd.name].value.trim();
          if (fd.name === "preis") { const p = parseNum(v.replace(/[€\s]/g, "")); item.preis = v === "" ? "" : (Number.isNaN(p) ? v : p); }
          else if (fd.area && fd.name === "eigenschaften") item.eigenschaften = v.split("\n").map(s => s.trim()).filter(Boolean);
          else item[fd.name] = v;
        }
        col.upsert(item); toast("Gespeichert."); view.detail(main, item.id);
      } } });
      const cancel = el("button.btn.ghost", { type: "button", text: "Abbrechen", on: { click: () => id ? view.detail(main, id) : App.show(cfg.route) } });
      const del = id ? el("button.btn.ghost.danger", { type: "button", text: "Löschen", on: { click: async () => {
        if (await confirmDlg("Eintrag löschen?", "„" + i.name + "“ wird entfernt.", "Löschen", true)) { col.remove(id); toast("Gelöscht."); App.show(cfg.route); }
      } } }) : null;
      main.append(el("section.card.wide", ...rows), el("div.row.end.wide", ...[del, cancel, save].filter(Boolean)));
      f.name.focus();
    }
  };
  return view;
}
