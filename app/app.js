"use strict";
// Dioptra - Rahmen: Startseite mit Kacheln, Reiter, Navigation ohne Browser-Historie (Wischgeste tut nichts),
// Kopfzeile mit Zurück und Kopieren, Ansicht „Mehr", Service Worker.
const APP_VERSION = "0.2.0";
const GROUPS = [
  { id: "refraktion", title: "Refraktion" }, { id: "fassung", title: "Fassung und Glas" }, { id: "preis", title: "Preise und Kasse" }, { id: "hoer", title: "Hörakustik", optional: true }
];
const ICONS = {
  hsa: '<path d="M4 12h16M4 8v8M20 8v8"/><circle cx="12" cy="12" r="3"/>', prismen: '<path d="M12 4l8 16H4z"/>', transposition: '<path d="M7 7h10l-3-3M17 17H7l3 3"/>',
  nah: '<circle cx="12" cy="12" r="8"/><path d="M8 14c2-2 6-2 8 0"/>', visus: '<path d="M4 20h4V9H4zM10 20h4V4h-4zM16 20h4v-7h-4z"/>',
  prentice: '<circle cx="12" cy="12" r="8"/><circle cx="14" cy="11" r="1.5"/><path d="M12 4v4M4 12h4"/>', durchmesser: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/>',
  dicke: '<path d="M8 4c-3 4-3 12 0 16M16 4c3 4 3 12 0 16"/>', toenung: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  preis: '<path d="M16 5H10a3.5 3.5 0 0 0 0 7h4a3.5 3.5 0 0 1 0 7H7M12 3v18"/>', kasse: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  hoerEigenanteil: '<path d="M6 10a6 6 0 0 1 12 0c0 4-4 4-4 8a2 2 0 0 1-4 0"/>', batterien: '<rect x="4" y="8" width="14" height="8" rx="2"/><path d="M18 11h2v2h-2M7 12h8"/>',
  hoergeraete: '<path d="M8 20c-3-3-3-8 0-11a5 5 0 0 1 9 2c0 3-3 4-3 7a2 2 0 0 1-4 0"/>'
};
const TILE_ORDER = ["hsa", "prismen", "transposition", "nah", "visus", "prentice", "durchmesser", "dicke", "toenung", "preis", "kasse", "hoerEigenanteil", "batterien", "hoergeraete"];
const Settings = {
  get() { return Object.assign({ hoer: true }, Store.get("dioptra.settings", {})); },
  set(o) { Store.set("dioptra.settings", Object.assign(this.get(), o)); }
};
function tileIcon(id) {
  const s = el("span"); s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[id] || "") + "</svg>";
  return s.firstChild;
}

Views.start = {
  title: "Dioptra",
  render(main) {
    const s = Settings.get();
    for (const grp of GROUPS) {
      if (grp.optional && !s.hoer) continue;
      const tiles = el("div.tiles");
      for (const id of TILE_ORDER) {
        const v = Views[id]; if (!v || v.group !== grp.id) continue;
        tiles.append(el("button.tile", { type: "button", on: { click: () => App.show(id) } }, tileIcon(id), el("span", el("span.tile-name", { text: v.title }), el("br"), el("span.tile-sub", { text: v.sub || "" }))));
      }
      main.append(el("div.group-title.wide", el("h3", { text: grp.title })), tiles);
    }
  }
};

Views.glaeser = collectionView({ col: DB.glaeser, title: "Gläser", route: "glaeser", placeholder: "Suchen: Name, Bestellnummer, Eigenschaft",
  sub: i => [i.hersteller, i.typ, i.index ? "Index " + i.index : "", i.bestellnr ? "Nr. " + i.bestellnr : ""].filter(Boolean).join(" · "),
  fields: [{ name: "name", label: "Name" }, { name: "hersteller", label: "Hersteller" }, { name: "typ", label: "Glastyp" }, { name: "stufe", label: "Stufe / Linie" }, { name: "preis", label: "Preis je Paar (€)" }, { name: "index", label: "Index" }, { name: "bestellnr", label: "Bestellnummer" }, { name: "verfuegbar", label: "Verfügbar" }, { name: "lieferbereich", label: "Lieferbereich" }, { name: "eigenschaften", label: "Eigenschaften (eine je Zeile)", area: true }, { name: "hinweis", label: "Hinweis" }, { name: "notizen", label: "Eigene Notizen", area: true }],
  note: "Preise je Glaspaar laut kind.com, Stand Oktober 2026, ohne Gewähr. Bestellnummern sind nicht öffentlich: im Eintrag unter „Bearbeiten“ nachtragen." });

Views.mehr = {
  title: "Mehr",
  render(main) {
    const s = Settings.get();
    const cur = (() => { try { return localStorage.getItem("theme") || "system"; } catch (e) { return "system"; } })();
    const theme = segmented([["system", "System"], ["dark", "Dunkel"], ["light", "Hell"]], cur, v => {
      try { localStorage.setItem("theme", v); } catch (e) { /* egal */ }
      if (v === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", v);
    }, "Farbschema");
    function backupCard(title, col, fileBase) {
      col.load();
      const file = el("input", { type: "file", accept: ".json,.csv,text/csv,application/json", class: "skip" });
      const exp = el("button.btn.ghost", { type: "button", text: "Sichern (JSON)", on: { click: async () => { if (await downloadText(fileBase + "-" + new Date().toISOString().slice(0, 10) + ".json", col.exportJson())) toast(Platform.capacitor ? "Sicherung zum Teilen bereit." : "Sicherung erstellt."); } } });
      const imp = el("button.btn.ghost", { type: "button", text: "Einlesen (JSON oder CSV)", on: { click: () => file.click() } });
      file.addEventListener("change", async () => {
        const f = file.files && file.files[0]; if (!f) return;
        try {
          const text = await f.text();
          const ok = await confirmDlg("Einlesen", "Einträge mit gleicher Kennung oder gleichem Namen werden ersetzt, alle anderen bleiben. Fortfahren?", "Einlesen");
          if (!ok) return;
          const n = /\.csv$/i.test(f.name) ? col.importCsv(text) : col.importJson(text);
          toast(n + " Einträge eingelesen.");
        } catch (e) { toast("Datei nicht lesbar: " + e.message, "err"); }
        file.value = "";
      });
      const count = el("p.note", { text: col.items.length + " Einträge, nur auf diesem Gerät." });
      const refresh = () => { count.textContent = col.items.length + " Einträge, nur auf diesem Gerät."; };
      file.addEventListener("change", () => setTimeout(refresh, 400));
      const reset = el("button.btn.ghost.danger", { type: "button", text: "Auf Startbestand zurücksetzen", on: { click: async () => {
        if (await confirmDlg("Zurücksetzen?", "Eigene Einträge, Bestellnummern und Notizen gehen verloren. Vorher sichern.", "Zurücksetzen", true)) { col.resetSeed(); refresh(); toast("Startbestand wiederhergestellt."); }
      } } });
      return section(title, count, el("div.row", exp, imp, file), reset);
    }
    const clearCalc = el("button.btn.ghost", { type: "button", text: "Alle Rechnerfelder leeren", on: { click: () => { for (const k of Store.keys("dioptra.calc.")) Store.remove(k); for (const k of Store.keys("dioptra.hoer.")) Store.remove(k); Store.remove("dioptra.preis"); Store.remove("dioptra.preis.felder"); toast("Rechnerfelder geleert."); } } });
    main.append(
      section("Farbschema", theme),
      section("Bereiche", toggleRow("Hörakustik", s.hoer, v => { Settings.set({ hoer: v }); toast(v ? "Hörakustik eingeschaltet." : "Hörakustik ausgeblendet."); }, "Eigenanteil, Batterien, Hörgeräte auf der Startseite")),
      backupCard("Gläserdatenbank", DB.glaeser, "dioptra-glaeser"), backupCard("Hörgeräte", DB.hoer, "dioptra-hoergeraete"),
      section("Rechner", clearCalc),
      section("CSV-Einlesen", note("Kopfzeile mit Spaltennamen: name, hersteller, typ, stufe, preis, index, bestellnr, verfuegbar, lieferbereich, eigenschaften (mit | getrennt), hinweis, notizen, bauform. Trenner Semikolon, Komma oder Tab. Gleicher Name aktualisiert den Eintrag; bei Namen, die es mehrfach gibt (KIND Premium), die Spalte typ mitgeben.")),
      Platform.name === "web" ? section("Als App auf dem Gerät", el("ul.plain",
        el("li", { text: "iPhone und iPad: https://ghost-o7.github.io/dioptra/ in Safari öffnen, Teilen-Knopf, „Zum Home-Bildschirm“. Danach läuft Dioptra ohne Netz." }),
        el("li", { text: "Windows, Linux und Android: Installationspakete unter github.com/ghost-o7/dioptra/releases." }),
        el("li", { text: "Alles bleibt auf dem Gerät. Keine Konten, keine Server, keine Kundendaten. Sicherungen landen als Datei in „Dateien“." }))) : null,
      section("Über", el("dl.kv", el("dt", { text: "Version" }), el("dd", { text: APP_VERSION }),
        el("dt", { text: "Ausgabe" }), el("dd", { text: Platform.name === "desktop" ? "Desktop (Windows, Linux)" : (Platform.name === "android" ? "Android" : "Web-App") }),
        el("dt", { text: "Projekt" }), el("dd", { text: "github.com/ghost-o7/dioptra, Freeware. Unabhängiges Werkzeug, keine Verbindung zu KIND oder Konradin; Produktnamen nur zur Beschreibung des Sortiments." }), el("dt", { text: "Rechner" }), el("dd", { text: "HSA und Prismen nach den Rechnern von DER AUGENOPTIKER (Konradin), gegen deren Referenzwerte geprüft. Übrige Rechner nach Lehrbuch." }),
        el("dt", { text: "Daten" }), el("dd", { text: "KIND-Sortiment nach kind.com (Oktober 2026), Festbeträge Sehhilfen nach Bekanntmachung 2021, Hörgeräte-Festbetrag GKV 2026." }), el("dt", { text: "Hinweis" }), el("dd", { text: "Alle Angaben ohne Gewähr. Bestellwerte und Abrechnung hängen vom Einzelfall ab." }))));
  }
};

const App = {
  main: null, title: null, back: null, action: null, tabs: null, current: null, copyFn: null, subBack: null,
  tabOf(view) { if (view === "glaeser") return "glaeser"; if (view === "preis") return "preis"; if (view === "mehr") return "mehr"; return "start"; },
  show(view, opts) {
    if (!Object.hasOwn(Views, view)) view = "start";
    Keypad.close(); Keypad.fields = [];
    this.current = view; this.copyFn = null; this.subBack = null;
    Store.set("dioptra.lastView", view);
    const tab = this.tabOf(view);
    for (const b of this.tabs.querySelectorAll(".tab")) b.setAttribute("aria-selected", String(b.dataset.tab === tab));
    this.title.textContent = Views[view].title;
    this.back.classList.toggle("placeholder", tab !== "start" || view === "start");
    this.action.classList.add("placeholder"); this.action.textContent = ""; this.action.append(this.copyIcon.cloneNode(true)); this.action.setAttribute("aria-label", "Kopieren");
    this.main.replaceChildren();
    const wrap = el("div.view"); this.main.append(wrap);
    Views[view].render(wrap);
    this.main.scrollTop = 0;
  },
  // Unteransicht (Detail, Bearbeiten): eigener Titel, Zurück-Ziel, optionaler Aktionsknopf mit Text.
  sub(title, back, action) {
    Keypad.close(); Keypad.fields = [];
    this.title.textContent = title; this.subBack = back; this.back.classList.remove("placeholder");
    this.action.textContent = ""; this.copyFn = null;
    if (action) { this.action.textContent = action.label; this.action.setAttribute("aria-label", action.label); this.action.classList.remove("placeholder"); this.action.onclick = action.onClick; }
    else this.action.classList.add("placeholder");
    this.main.scrollTop = 0;
  },
  copy(fn) { this.copyFn = fn; this.action.classList.remove("placeholder"); this.action.onclick = () => { const t = fn(); if (t) copyText(t, "Ergebnis kopiert."); else toast("Noch kein Ergebnis.", "err"); }; },
  goBack() { if (this.subBack) { const b = this.subBack; this.subBack = null; b(); } else this.show("start"); },
  boot() {
    this.main = $("main"); this.title = $("title"); this.back = $("back"); this.action = $("action"); this.tabs = $("tabs");
    this.copyIcon = this.action.firstElementChild.cloneNode(true);
    Keypad.mount();
    this.back.addEventListener("click", () => this.goBack());
    for (const b of this.tabs.querySelectorAll(".tab")) b.addEventListener("click", () => this.show(b.dataset.tab));
    // Hash nur beim Start auswerten (Deep-Link), danach keine Historie mehr anfassen.
    const h = (location.hash || "").replace(/^#/, "");
    if (h) history.replaceState(null, "", location.pathname + location.search);
    const last = Store.get("dioptra.lastView", "start");
    this.show(Object.hasOwn(Views, h) ? h : (Object.hasOwn(Views, last) ? last : "start"));
    this.sw();
    this.android();
  },
  // Android-Hülle: Zurück-Taste geht in der App zurück, auf der Startseite beendet sie die App.
  android() {
    if (!Platform.capacitor) return;
    try {
      const CapApp = window.Capacitor.registerPlugin("App");
      CapApp.addListener("backButton", () => {
        if (!Keypad.root.hidden) Keypad.close();
        else if (this.subBack || this.current !== "start") this.goBack();
        else CapApp.exitApp();
      });
    } catch (e) { /* ohne Plugin weiter */ }
  },
  sw() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol) || Platform.name !== "web") return;
    const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloaded || !hadController) return; reloaded = true; toast("Aktualisiert. Neue Version wird geladen."); setTimeout(() => location.reload(), 900); });
    navigator.serviceWorker.register("sw.js").catch(() => { /* ohne Offline-Cache weiter */ });
  }
};
document.addEventListener("DOMContentLoaded", () => App.boot());
