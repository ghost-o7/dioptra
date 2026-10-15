"use strict";
// Baut aus app/ eine einzelne HTML-Datei (dist/dioptra.html): CSS und JS eingebettet, Icons als data-URI.
// Für den Weg ohne Webserver: Datei per AirDrop oder „Dateien" aufs iPhone, dort in Safari öffnen.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const app = p => path.join(root, "app", p);
let html = fs.readFileSync(app("index.html"), "utf8");
const css = fs.readFileSync(app("styles.css"), "utf8");
const scripts = ["ui.js", "core.js", "keypad.js", "data-kind.js", "data-extra.js", "db.js", "views-rx.js", "views-fit.js", "views-extra.js", "views-preis.js", "views-hoer.js", "app.js"];
const theme = fs.readFileSync(app("theme.js"), "utf8");
const icon = "data:image/png;base64," + fs.readFileSync(app("icons/icon-180.png")).toString("base64");
html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
  .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/png" href="${icon}">`)
  .replace(/<link rel="apple-touch-icon"[^>]*>/, `<link rel="apple-touch-icon" href="${icon}">`)
  .replace('<link rel="stylesheet" href="styles.css">', "<style>\n" + css + "\n</style>")
  .replace('<script src="theme.js"></script>', "<script>\n" + theme + "\n</script>");
const joined = scripts.map(s => "// ---- " + s + "\n" + fs.readFileSync(app(s), "utf8")).join("\n");
html = html.replace(/(\s*<script src="[^"]+"><\/script>)+\s*<\/body>/, "\n  <script>\n" + joined.replace(/<\/script>/g, "<\\/script>") + "\n  </script>\n</body>");
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "dioptra.html"), html);
console.log("dist/dioptra.html: " + (html.length / 1024).toFixed(0) + " KB");
