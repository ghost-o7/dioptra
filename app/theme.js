"use strict";
// Avina-Optik - Farbschema vor dem ersten Zeichnen setzen, damit die helle Variante ohne Flackern greift.
// localStorage "theme": system | dark | light. "system" entfernt das Attribut, dann gilt prefers-color-scheme.
(function () {
  let t = "system";
  try { t = localStorage.getItem("theme") || "system"; } catch (e) { /* privater Modus */ }
  if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
})();
