"use strict";
// Dioptra - UI-Helfer: Elemente bauen, Zahlen formatieren, Speicher, Toast, Rückfrage, Kopieren.
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// el("div.card", {text:"..."}, child, child) - Baufunktion ohne innerHTML. Arrays und null als Kinder sind erlaubt.
function el(spec, attrs, ...children) {
  const m = spec.match(/^([a-z0-9]+)((?:\.[\w-]+)*)$/i);
  const node = document.createElement(m ? m[1] : "div");
  if (m && m[2]) node.className = m[2].split(".").filter(Boolean).join(" ");
  if (attrs && typeof attrs === "object" && !(attrs instanceof Node) && !Array.isArray(attrs)) {
    for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v == null) continue;
      if (k === "text") node.textContent = v;
      else if (k === "on") for (const ev of Object.keys(v)) node.addEventListener(ev, v[ev]);
      else if (k === "data") for (const d of Object.keys(v)) node.dataset[d] = v[d];
      else node.setAttribute(k, v);
    }
  } else if (attrs != null) children.unshift(attrs);
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// ---- Zahlen -------------------------------------------------------------------------------------
function parseNum(s) {
  if (typeof s === "number") return s;
  if (s == null) return NaN;
  s = String(s).trim().replace(/−/g, "-").replace(/\s+/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "");                       // 2.304,85 → 2304,85
  else if (/^[-+]?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ""); // 2.304 → 2304
  s = s.replace(/,/g, ".");
  if (s === "" || s === "-" || s === "+" || s === ".") return NaN;
  return Number(s);
}
function fmt(v, decimals, opts) {
  if (v == null || Number.isNaN(v) || !Number.isFinite(v)) return "–";
  const d = decimals == null ? 2 : decimals;
  if (Math.abs(v) < Math.pow(10, -d) / 2) v = 0;
  let s = Math.abs(v).toFixed(d).replace(".", ",");
  if (v < 0) s = "-" + s;
  else if (opts && opts.sign && v > 0) s = "+" + s;
  return s;
}
function fmtDpt(v) { return fmt(v, 2, { sign: true }); }
function fmtAxis(v) { if (v == null || Number.isNaN(v)) return "–"; return String(Math.round(v)) + "°"; }
function fmtEur(v) { if (v == null || Number.isNaN(v)) return "–"; return v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
function num(v, fallback) { return (v == null || Number.isNaN(v)) ? fallback : v; }

// ---- Speicher -------------------------------------------------------------------------------------
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* egal */ } },
  keys(prefix) { try { return Object.keys(localStorage).filter(k => k.startsWith(prefix)); } catch (e) { return []; } }
};

// ---- Toast ------------------------------------------------------------------------------------------
function toast(msg, cls) {
  const root = $("toast-root");
  if (!root) return;
  const t = el("div.toast" + (cls ? "." + cls : ""), { role: cls === "err" ? "alert" : "status", text: msg });
  root.append(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 250); }, 3200);
}

// ---- Rückfrage ohne Browserdialog ----------------------------------------------------------------
function confirmDlg(title, msg, okLabel, danger) {
  return new Promise(resolve => {
    const root = $("modal-root");
    const opener = document.activeElement;
    const cancel = el("button.btn.ghost", { type: "button", text: "Abbrechen" });
    const ok = el("button.btn" + (danger ? ".danger" : ""), { type: "button", text: okLabel || "Bestätigen" });
    const box = el("div.modal", { role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title" },
      el("h2", { id: "modal-title", text: title }), el("p", { text: msg }), el("div.modal-actions", cancel, ok));
    const overlay = el("div.overlay", box);
    function done(v) { overlay.remove(); document.removeEventListener("keydown", onKey); if (opener && opener.focus) opener.focus(); resolve(v); }
    function onKey(e) { if (e.key === "Escape") done(false); }
    cancel.addEventListener("click", () => done(false));
    ok.addEventListener("click", () => done(true));
    overlay.addEventListener("click", e => { if (e.target === overlay) done(false); });
    document.addEventListener("keydown", onKey);
    root.append(overlay);
    ok.focus();
  });
}

// ---- Kopieren -------------------------------------------------------------------------------------------
async function copyText(text, okMsg) {
  try { await navigator.clipboard.writeText(text); toast(okMsg || "Kopiert."); return true; }
  catch (e) {
    const ta = el("textarea", { "aria-hidden": "true" }); ta.value = text; ta.className = "skip";
    document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* nichts */ }
    ta.remove(); toast(ok ? (okMsg || "Kopiert.") : "Kopieren nicht möglich.", ok ? "" : "err"); return ok;
  }
}
function copyButton(getText, label) {
  return el("button.btn.ghost.small", { type: "button", text: label || "Kopieren", on: { click: () => copyText(getText()) } });
}

// ---- Bausteine für Ergebnisse -------------------------------------------------------------------------
function resultRow(label, value, extra) {
  return el("div.res-row", el("span.res-label", { text: label }), el("span.res-value", { text: value }), extra ? el("span.res-extra", { text: extra }) : null);
}
function section(title, ...children) { const n = el("section.card", title ? el("h3", { text: title }) : null, ...children); n.wide = () => { n.classList.add("wide"); return n; }; return n; }
function note(text) { return el("p.note", { text }); }
function eyeTitle(eye, text) { return el("span.eye-" + eye, { text: text || (eye === "R" ? "Rechts" : "Links") }); }
function rxBox(eye, title, main, ...subs) {
  const val = main instanceof Node ? el("span.rx-val", main) : el("span.rx-val", { text: main == null ? "–" : main });
  return el("div.rx-box", eyeTitle(eye, title), val, ...subs.filter(Boolean).map(s => el("span.rx-sub", { text: s })));
}
function segmented(options, value, onChange, label) {
  const seg = el("div.seg", { role: "group", "aria-label": label || "" });
  for (const [v, text] of options) {
    seg.append(el("button", { type: "button", text, "aria-pressed": String(v === value), data: { v }, on: { click: () => {
      for (const b of seg.children) b.setAttribute("aria-pressed", String(b.dataset.v === String(v)));
      onChange(v);
    } } }));
  }
  seg.value = v => { for (const b of seg.children) b.setAttribute("aria-pressed", String(b.dataset.v === String(v))); };
  return seg;
}
function toggleRow(label, checked, onChange, sub) {
  const input = el("input", { type: "checkbox", role: "switch" }); input.checked = !!checked;
  input.addEventListener("change", () => onChange(input.checked));
  const lab = el("label.toggle", el("span.toggle-text", el("span", { text: label }), sub ? el("span.toggle-sub", { text: sub }) : null), input, el("span.toggle-ui", { "aria-hidden": "true" }));
  lab.input = input;
  return lab;
}
// Laufzeitumgebung: Browser oder Web-App, Desktop-Hülle (Tauri) oder Android-Hülle (Capacitor).
const Platform = {
  get tauri() { return !!(window.__TAURI__ && window.__TAURI__.dialog); },
  get capacitor() { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); },
  get name() { return this.tauri ? "desktop" : (this.capacitor ? "android" : "web"); }
};
// Textdatei sichern: Desktop über Speichern-Dialog, Android über das Teilen-Menü, sonst als Download.
async function downloadText(name, text, mime) {
  if (Platform.tauri) {
    try {
      const path = await window.__TAURI__.dialog.save({ defaultPath: name, filters: [{ name: "JSON", extensions: ["json"] }] });
      if (!path) return false;
      await window.__TAURI__.fs.writeTextFile(path, text);
      return true;
    } catch (e) { toast("Speichern nicht möglich: " + e.message, "err"); return false; }
  }
  if (Platform.capacitor) {
    try {
      const Filesystem = window.Capacitor.registerPlugin("Filesystem"), Share = window.Capacitor.registerPlugin("Share");
      const w = await Filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8" });
      await Share.share({ title: name, files: [w.uri] });
      return true;
    } catch (e) { if (!/cancel/i.test(String(e && e.message))) toast("Teilen nicht möglich: " + (e && e.message), "err"); return false; }
  }
  const blob = new Blob([text], { type: mime || "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
