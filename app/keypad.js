"use strict";
// Dioptra - Zahlenfelder mit eigenem Tastenfeld. Kein iOS-Tastaturwechsel, kein Zoom, große Tasten.
// Ein Feld ist ein Knopf mit Bezeichnung, Wert und Einheit. Tippen öffnet das Tastenfeld unten.
// Felder einer Ansicht werden in Reihenfolge registriert, „Weiter" springt zum nächsten.
const Keypad = {
  root: null, field: null, fresh: true, fields: [],
  mount() {
    this.root = $("keypad");
    this.root.replaceChildren();
    const quick = el("div.kp-quick");
    const grid = el("div.kp-grid");
    const keys = [["7"], ["8"], ["9"], ["⌫", "del"], ["4"], ["5"], ["6"], ["−", "minus"], ["1"], ["2"], ["3"], ["+", "plus"], ["±", "sign"], ["0"], [",", "comma"], ["Weiter", "next"]];
    for (const [label, action] of keys) {
      grid.append(el("button.kp-key" + (action ? ".kp-" + action : ""), { type: "button", text: label, "aria-label": action === "del" ? "Löschen" : (action === "minus" ? "Schritt kleiner" : (action === "plus" ? "Schritt größer" : label)),
        on: { click: () => this.press(action || label) } }));
    }
    const head = el("div.kp-head", el("span.kp-label"), el("span.kp-value", { "aria-live": "polite" }), el("button.kp-close", { type: "button", text: "Fertig", on: { click: () => this.close() } }));
    this.root.append(head, quick, grid);
    this.quick = quick; this.label = head.firstChild; this.valueEl = head.children[1];
    // Tipp außerhalb schließt das Tastenfeld, aber erst nachdem der getippte Knopf seine Arbeit getan hat.
    // Beim Schließen verschiebt sich das Layout (Reiter kommen zurück); passiert das vor dem Klick, geht er verloren.
    document.addEventListener("click", e => {
      if (!this.field) return;
      if (this.root.contains(e.target) || (e.target.closest && e.target.closest(".fld"))) return;
      this.close();
    });
  },
  open(f) {
    if (this.field && this.field !== f) { this.field.el.classList.remove("active"); this.field.commit(); }
    const wasOpen = !this.root.hidden;
    this.field = f; this.fresh = true;
    f.el.classList.add("active");
    this.label.textContent = f.o.label + (f.o.unit ? " in " + f.o.unit : "");
    this.quick.replaceChildren();
    for (const q of (f.o.quick || [])) this.quick.append(el("button.kp-chip", { type: "button", text: q.label || f.format(q), on: { click: () => { f.set(typeof q === "object" ? q.v : q); this.fresh = true; } } }));
    this.quick.hidden = !(f.o.quick && f.o.quick.length);
    this.root.hidden = false; document.body.classList.add("kp-open");
    this.mirror();
    // Nur beim Öffnen aus geschlossenem Zustand zum Feld rollen. Bei „Weiter" bleibt die Seite, wo sie ist;
    // der Wert steht in der Kopfzeile des Tastenfelds.
    if (!wasOpen) setTimeout(() => f.el.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  },
  // Wert des aktiven Feldes in der Kopfzeile des Tastenfelds spiegeln.
  mirror() {
    const f = this.field; if (!f || !this.valueEl) return;
    const raw = this.fresh ? (f.value == null ? "" : f.format(f.value)) : f.text;
    this.valueEl.textContent = (raw === "" ? "–" : raw) + (f.o.unit ? " " + f.o.unit : "");
  },
  close() {
    if (this.field) { this.field.el.classList.remove("active"); this.field.commit(); }
    this.field = null; this.root.hidden = true; document.body.classList.remove("kp-open");
  },
  press(k) {
    const f = this.field; if (!f) return;
    if (k === "next") { const i = this.fields.indexOf(f); const n = this.fields[i + 1]; if (n) { f.commit(); this.open(n); n.el.focus({ preventScroll: true }); } else this.close(); return; }
    if (k === "plus" || k === "minus") { const v = num(f.value, 0); f.set(Calc.roundTo(v + (k === "plus" ? f.o.step : -f.o.step), f.o.step)); this.fresh = true; return; }
    if (k === "sign") {
      // Bei vorhandenem Wert kippt das Vorzeichen. Bei leerem Feld oder 0 wird ein Minus vorangestellt, das beim
      // Weitertippen stehen bleibt (erst ±, dann 6,5 ergibt −6,50).
      if (f.value != null && f.value !== 0 && this.fresh) { f.set(-f.value); this.fresh = true; return; }
      let t = this.fresh ? "" : f.text;
      t = t.startsWith("-") ? t.slice(1) : "-" + t;
      this.applyText(f, t); return;
    }
    // Ziffern und Komma. Beim Überschreiben eines negativen Werts bleibt das Minus stehen, weil bei Brillenwerten
    // das Vorzeichen zum Feld gehört; ± kippt es bei Bedarf.
    let t = this.fresh ? ((f.value != null && f.value < 0) ? "-" : "") : f.text;
    if (k === "del") t = this.fresh ? "" : t.slice(0, -1);
    else if (k === "comma") { if (!t.includes(",")) t = (t === "" || t === "-") ? t + "0," : t + ","; }
    else t = (t === "0" || t === "-0") ? t.slice(0, -1) + k : t + k; // führende Null ersetzen
    this.applyText(f, t);
  },
  applyText(f, t) {
    this.fresh = false;
    f.text = t;
    const v = (t === "" || t === "-") ? null : parseNum(t);
    f.value = (v == null || Number.isNaN(v)) ? null : v;
    f.render(true); f.changed();
  }
};

// field({id, label, unit, step, decimals, sign, min, max, quick:[...], value, onChange})
function field(o) {
  const f = { o, value: o.value == null ? null : o.value, text: "" };
  f.format = v => (v == null || Number.isNaN(v)) ? "" : fmt(v, o.decimals == null ? 2 : o.decimals, { sign: !!o.sign });
  f.render = raw => {
    f.valEl.textContent = raw ? (f.text || "") : (f.value == null ? "" : f.format(f.value));
    f.el.classList.toggle("empty", f.value == null && !(raw && f.text));
    if (Keypad.field === f) Keypad.mirror();
  };
  f.set = v => {
    if (v != null && !Number.isNaN(v)) {
      if (o.min != null && v < o.min) v = o.min;
      if (o.max != null && v > o.max) v = o.max;
    }
    f.value = (v == null || Number.isNaN(v)) ? null : v; f.text = f.value == null ? "" : f.format(f.value); f.render(); f.changed();
  };
  f.commit = () => { if (f.value != null) f.set(Calc.roundTo(f.value, o.decimals == null ? 0.01 : Math.pow(10, -o.decimals))); else f.render(); };
  f.changed = () => { if (o.onChange) o.onChange(f.value); };
  f.valEl = el("span.fld-val");
  f.el = el("button.fld", { type: "button", id: o.id, "aria-label": o.label + (o.unit ? " in " + o.unit : "") },
    el("span.fld-label", { text: o.label }), el("span.fld-row", f.valEl, o.unit ? el("span.fld-unit", { text: o.unit }) : null));
  f.el.addEventListener("click", () => Keypad.open(f));
  f.el.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { e.preventDefault(); f.set(Calc.roundTo(num(f.value, 0) + o.step, o.step)); }
    else if (e.key === "ArrowDown") { e.preventDefault(); f.set(Calc.roundTo(num(f.value, 0) - o.step, o.step)); }
    else if (e.key === "Backspace") { e.preventDefault(); f.set(null); }
    else if (/^[0-9]$/.test(e.key) || e.key === "," || e.key === "." || e.key === "-") { e.preventDefault(); if (Keypad.field !== f) Keypad.open(f); Keypad.press(e.key === "-" ? "sign" : ((e.key === "." || e.key === ",") ? "comma" : e.key)); }
  });
  f.render();
  Keypad.fields.push(f);
  return f;
}

// Gruppe von Feldern mit Speicherung: fields({key, defs:[{name, ...fieldopts}], onChange}) → {get, fields, node(name)}
function fieldGroup(key, defs, onChange) {
  const saved = Store.get(key, {});
  const g = { fields: {}, key };
  g.get = () => { const o = {}; for (const n of Object.keys(g.fields)) o[n] = g.fields[n].value; return o; };
  g.save = () => Store.set(key, g.get());
  g.reset = () => { for (const n of Object.keys(g.fields)) { const f = g.fields[n]; f.value = f.o.initial == null ? null : f.o.initial; f.text = ""; f.render(); } Store.remove(key); onChange(g.get()); };
  for (const d of defs) {
    const v = saved[d.name] != null ? saved[d.name] : (d.initial == null ? null : d.initial);
    g.fields[d.name] = field(Object.assign({}, d, { id: key.replace(/\W/g, "_") + "_" + d.name, value: v, onChange: () => { g.save(); onChange(g.get()); } }));
  }
  g.node = n => g.fields[n].el;
  return g;
}
const RX_QUICK = { axis: [0, 45, 90, 135, 180], hsa: [{ v: 0, label: "KL 0" }, 12, 13, 14, 15], base: [0, 90, 180, 270], add: [1, 1.5, 2, 2.5, 3] };
function rxDefs(prefix, eye, opts) {
  const d = [
    { name: eye + "_sph", label: "Sphäre", unit: "dpt", step: 0.25, sign: true, min: -30, max: 30 },
    { name: eye + "_cyl", label: "Zylinder", unit: "dpt", step: 0.25, sign: true, min: -10, max: 10 },
    { name: eye + "_axis", label: "Achse", unit: "°", step: 1, decimals: 0, min: 0, max: 180, quick: RX_QUICK.axis }];
  if (opts && opts.add) d.push({ name: eye + "_add", label: "Addition", unit: "dpt", step: 0.25, min: 0, max: 5, quick: RX_QUICK.add });
  return d;
}
function rxGrid(g, extraPerEye) {
  function col(eye) {
    const kids = [eyeTitle(eye, eye === "R" ? "Rechts (R)" : "Links (L)"), g.node(eye + "_sph"), g.node(eye + "_cyl"), g.node(eye + "_axis")];
    if (g.fields[eye + "_add"]) kids.push(g.node(eye + "_add"));
    if (extraPerEye) for (const n of extraPerEye) kids.push(g.node(eye + "_" + n));
    return el("div.field-col", kids);
  }
  return el("div.rx", col("R"), col("L"));
}
function eyeRx(v, eye) {
  const s = v[eye + "_sph"];
  if (s == null) return null;
  return { sph: s, cyl: num(v[eye + "_cyl"], 0), axis: num(v[eye + "_axis"], 0), add: v[eye + "_add"] };
}
function rxText(r) { return fmtDpt(r.sph) + (r.cyl ? " " + fmtDpt(r.cyl) + " A " + fmtAxis(r.axis) : ""); }
// Zweizeilig für die großen Ergebniskästen: Sphäre oben, Zylinder und Achse darunter.
function rxLines(r) { return r.cyl ? el("span", fmtDpt(r.sph), el("br"), fmtDpt(r.cyl) + " A " + fmtAxis(r.axis)) : el("span", fmtDpt(r.sph)); }
