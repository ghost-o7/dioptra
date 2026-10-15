"use strict";
// Dioptra - Service Worker: alle Dateien der App beim Installieren laden, danach aus dem Cache liefern.
// Der Cache-Name trägt die Version. Eine neue Version räumt alte Caches weg und übernimmt sofort.
const VERSION = "0.1.3";
const BUILD = "dev"; // wird beim Veröffentlichen durch den Commit ersetzt
const CACHE = "dioptra-" + VERSION + "-" + BUILD;
const FILES = ["./", "./index.html", "./styles.css", "./theme.js", "./ui.js", "./core.js", "./data-kind.js",
  "./keypad.js", "./data-extra.js", "./db.js", "./views-rx.js", "./views-fit.js", "./views-extra.js", "./views-preis.js", "./views-hoer.js", "./app.js", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-512-maskable.png"];

// Beim Installieren jede Datei frisch holen: Die Build-Kennung an der Adresse umgeht den Zwischenspeicher des
// Pages-CDN (bis zu zehn Minuten alt), gespeichert wird unter der normalen Adresse.
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f + "?b=" + BUILD, { cache: "reload" })).then(res => { if (!res.ok) throw new Error(f + " " + res.status); return c.put(f, res); })
  ))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    if (res && res.ok && new URL(e.request.url).origin === location.origin) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => e.request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
