<div align="center">

<img src="app/icons/icon-192.png" width="96" alt="Dioptra">

# Dioptra

**Rechner, Preiskalkulation und Gläserdatenbank für Augenoptik und Hörakustik.
Läuft ohne Installation und ohne Netz.**

Spendenfinanzierte Freeware, kostenlos für private und gewerbliche Nutzung ohne Limits.

[![Ko-fi](https://img.shields.io/badge/Unterst%C3%BCtzen%20auf-Ko--fi-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/ghost_o7)
[![Release](https://img.shields.io/badge/Release-v0.2.0-00bfff)](CHANGELOG.md)
[![Lizenz](https://img.shields.io/badge/Lizenz-Freeware-6eb7da)](LICENSE)

</div>

---

## Worum es geht

Es braucht immer dieselben Rechnungen: Werte auf einen anderen Hornhautscheitelabstand umrechnen, Prismen
zusammenfassen und verteilen, Zylinder transponieren, prüfen, welcher Glasdurchmesser passt, und die Frage, was die Brille
mit dieser Ausstattung kostet und was die Kasse übernimmt. Im Hybridladen kommen Hörkunden dazu. Dioptra packt das in eine
App, die auf dem Telefon, dem Tablet und dem Rechner läuft und keine Verbindung braucht.

## Was es kann

- **Einfache Eingaben.** Eigenes Tastenfeld statt iOS-Tastatur: große Tasten, ±, Schritt in 0,25 dpt, Schnellwerte je
  Feld, „Weiter" zum nächsten Feld. Kein Zoom bei Doppeltipp, keine Wischgeste, die die Seite wechselt.
- **Refraktion.** HSA-Rechner und Prismenrechner (beide gegen die Rechner von DER AUGENOPTIKER geprüft, TABO-Schema als
  Grafik), Transposition, Nahwerte mit Zwischenbereich, Visus in Dezimal, Snellen und LogMAR.
- **Fassung und Glas.** Dezentration nach Prentice, Mindestdurchmesser, Glasdicke im Vergleich 1,5 bis 1,74, Tönung mit
  Filterkategorien und Verkehrstauglichkeit.
- **Preise und Kasse.** Preisrechner mit Grundglas, Optionen aus der Datenbank, Fassung, freien Positionen und Rabatt.
  Kassenanteil für Brillengläser nach Festbetragsgruppen mit Zuschlägen und Zuzahlung.
- **Hörakustik.** Eigenanteil mit Festbetrag, zweitem Ohr, Zuzahlung, Otoplastik und Ladestation. Batterien mit Größen,
  Laufzeiten und Jahresbedarf. Hörgeräte-Datenbank mit den KIND-Stufen und -Modellen. Abschaltbar unter Mehr.
- **Datenbanken.** KIND-Glassortiment Deutschland (Einstärken, Gleitsicht, Raumkomfort, Optionen, Tönungen) mit Preisen,
  Eigenschaften, Bestellnummer und Notizen je Glas. Suche, Filter, Bearbeiten, eigene Einträge, JSON-Sicherung,
  CSV-Einlesen der Preisliste aus dem Geschäft.
- **Ergebnis kopieren.** Jeder Rechner liefert seinen Text per Knopf in der Kopfzeile für das Verwaltungsprogramm.
- **Dunkel und hell, Telefon, Tablet und Rechner.** Folgt dem System oder fester Wahl, zwei Spalten ab Tablet-Breite.

<div align="center">
<img src="docs/img/start-dark.png" width="230" alt="Startseite"> <img src="docs/img/keypad-dark.png" width="230" alt="Tastenfeld"> <img src="docs/img/preis-light.png" width="230" alt="Preisrechner">
</div>

## Herunterladen und installieren

| Gerät | Weg |
| --- | --- |
| **iPhone, iPad** | https://ghost-o7.github.io/dioptra/ in Safari öffnen, Teilen-Knopf, „Zum Home-Bildschirm", „Hinzufügen". Beim ersten Start einmal mit Netz, danach läuft Dioptra ohne Netz. Neue Versionen meldet die App beim nächsten Start mit Netz selbst. |
| **Android** | `dioptra-<version>-android.apk` aus den [Releases](../../releases) laden, Installation aus dieser Quelle erlauben, installieren. |
| **Windows** | `Dioptra_<version>_x64-setup.exe` (Setup für den Benutzer, keine Adminrechte) oder `.msi` aus den [Releases](../../releases). |
| **Linux** | `.deb` (Debian, Ubuntu) oder `.AppImage` (überall, ausführbar machen und starten) aus den [Releases](../../releases). |
| **Jeder Browser** | https://ghost-o7.github.io/dioptra/ direkt öffnen. `dist/dioptra.html` enthält alles in einer Datei. |

Alles bleibt auf dem Gerät, keine Konten, keine Server, keine Kundendaten. Sicherungen der Datenbanken landen als
JSON-Datei in „Dateien" (iPhone), im Teilen-Menü (Android) oder über den Speichern-Dialog (Windows, Linux).

Apple Watch: Für die Rechner gibt es Bauanleitungen als Kurzbefehle, die auch auf der Watch laufen:
[docs/KURZBEFEHL.md](docs/KURZBEFEHL.md).

## Repository

| Ordner | Inhalt |
| --- | --- |
| `app/` | Die App: Seite, Styles, Tastenfeld, Rechenkern, Startbestände, Datenbank, Ansichten, Service Worker, Icons |
| `dist/` | Einzeldatei `dioptra.html`, gebaut mit `node tools/build-single.js` |
| `src-tauri/` | Desktop-Hülle (Tauri) für Windows und Linux |
| `capacitor.config.json`, `resources/` | Android-Hülle (Capacitor), das Projekt entsteht beim Release-Lauf |
| `tools/` | `check-refs.js` (zeichnet alle Ansichten zur Prüfung), `build-single.js` (Einzeldatei) |
| `docs/` | [HANDBUCH.md](docs/HANDBUCH.md), [KURZBEFEHL.md](docs/KURZBEFEHL.md), Bilder |

`.github/workflows/ci.yml` prüft bei jedem Push, `pages.yml` veröffentlicht `app/` auf GitHub Pages, `release.yml` baut bei
einem Tag `v<version>` die Pakete für Windows, Linux und Android als Entwurfs-Release.

## Status

Version 0.2.0, siehe [CHANGELOG.md](CHANGELOG.md). Preise und Eigenschaften der KIND-Gläser und -Hörgeräte stammen von
kind.com, Stand 14. Oktober 2026. Festbeträge Sehhilfen nach der Bekanntmachung 2021 (seit März 2025 über
Versorgungsverträge in praktisch gleicher Höhe), Hörgeräte-Festbetrag GKV 2026. Herstellerbestellnummern sind nicht
öffentlich und werden im Geschäft nachgetragen. Alle Angaben ohne Gewähr.

Dioptra ist ein unabhängiges Werkzeug und steht in keiner Verbindung zur KIND Hörgeräte & Brillen GmbH oder zu Konradin
Medien. Produktnamen gehören ihren Inhabern und werden nur zur Beschreibung des Sortiments genannt.

## Lizenz und Unterstützung

Freeware (proprietär, kostenlos), siehe [LICENSE](LICENSE). Dioptra kostet nichts und bleibt kostenlos. Wer die Arbeit
daran unterstützen möchte, kann das freiwillig über [Ko-fi](https://ko-fi.com/ghost_o7) tun. Daraus entstehen keine
Ansprüche.
