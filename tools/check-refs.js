"use strict";
// Lädt app/index.html mit allen Skripten in jsdom und zeichnet jede Ansicht einmal, inklusive Detail- und
// Formularansicht der Datenbanken. Ohne jsdom bleibt die Syntaxprüfung. Freigabeprüfung vor jedem Push.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..", "app");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const s of srcs) new vm.Script(fs.readFileSync(path.join(root, s), "utf8"), { filename: s });
let JSDOM = null;
try { JSDOM = require("jsdom").JSDOM; } catch (e) { console.log("Syntax ok: " + srcs.join(", ") + " (jsdom fehlt, keine Render-Prüfung)"); process.exit(0); }
// Skripte als Inline-Skripte einsetzen, damit sie wie im Browser einen gemeinsamen Geltungsbereich teilen.
const inlined = html.replace(/<script src="([^"]+)"><\/script>/g, (m, s) => "<script>" + fs.readFileSync(path.join(root, s), "utf8").replace(/<\/script>/g, "<\\/script>") + "</script>");
const dom = new JSDOM(inlined, { runScripts: "dangerously", url: "https://dioptra.local/index.html", pretendToBeVisual: true });
const w = dom.window;
w.requestAnimationFrame = w.requestAnimationFrame || (cb => setTimeout(cb, 0));
w.Element.prototype.scrollIntoView = w.Element.prototype.scrollIntoView || function () {};
w.Element.prototype.scrollBy = w.Element.prototype.scrollBy || function () {};
const errors = [];
w.addEventListener("error", e => errors.push(e.message));
setTimeout(() => {
  const main = w.document.getElementById("main");
  // Oberste const-Bindungen liegen nicht am window, aber eval im Fenster sieht sie.
  const App = w.eval("App"), Views = w.eval("Views"), DB = w.eval("DB");
  const views = Object.keys(Views);
  let bad = 0;
  const check = (name, fn) => { try { fn(); if (!main.textContent.trim()) throw new Error("leer"); } catch (e) { bad++; console.error("Ansicht " + name + ": " + e.message); } };
  for (const v of views) check(v, () => App.show(v));
  check("glaeser-detail", () => { App.show("glaeser"); Views.glaeser.detail(main.firstChild, DB.glaeser.items[0].id); });
  check("glaeser-edit", () => { App.show("glaeser"); Views.glaeser.edit(main.firstChild, DB.glaeser.items[0].id); });
  check("hoer-detail", () => { App.show("hoergeraete"); Views.hoergeraete.detail(main.firstChild, DB.hoer.items[0].id); });
  check("tastenfeld", () => { App.show("hsa"); w.document.getElementById("dioptra_calc_hsa_R_sph").click(); for (const k of ["±", "6", ",", "5", "Weiter", "2", "Fertig"]) { const b = [...w.document.querySelectorAll("#keypad button")].find(x => x.textContent === k); if (!b) throw new Error("Taste " + k + " fehlt"); b.click(); } if (!main.textContent.includes("-6,50")) throw new Error("Tastenfeld liefert nicht -6,50"); });
  if (errors.length) { bad++; console.error("Fehler im Fenster: " + errors.join(" | ")); }
  console.log(bad ? bad + " Prüfungen fehlgeschlagen" : "Alle " + (views.length + 4) + " Prüfungen bestanden (" + views.length + " Ansichten, Detail, Formular, Tastenfeld).");
  process.exit(bad ? 1 : 0);
}, 50);
