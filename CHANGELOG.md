# Changelog - Dioptra

Alle nennenswerten Änderungen dieses Produkts. Format angelehnt an „Keep a Changelog",
Versionierung: SemVer (Datei `VERSION`, `APP_VERSION` in `app/app.js`, `VERSION` in `app/sw.js`).

## [Unreleased]

## [0.2.0] - 2026-10-15

### Neu
- Installationspakete für Windows (Setup, MSI), Linux (deb, AppImage) und Android (APK), gebaut vom Workflow „Release"
  bei einem Tag. Die Web-App bleibt der Weg für iPhone und iPad.
- Sicherungen in den Hüllen nativ: Speichern-Dialog unter Windows und Linux, Teilen-Menü unter Android.
- Android: Zurück-Taste führt in der App zurück.
- Unter Mehr steht die Ausgabe (Web-App, Desktop, Android).

### Behoben
- Nach einem Update konnte die App mit neuem Service Worker, aber alten Dateien laufen (CDN-Zwischenspeicher). Die
  Installation holt jede Datei jetzt mit Frischestempel.

## [0.1.3] - 2026-10-15

Fehlerprüfung über die ganze App, 21 Punkte.

### Behoben
- Tastenfeld: ± auf leerem Feld und danach Ziffern ergibt jetzt einen negativen Wert; beim Überschreiben eines
  negativen Werts bleibt das Minus stehen; ± bei 0 wirkt sichtbar; die Minustaste einer Hardware-Tastatur kippt das
  Vorzeichen statt den Wert zu löschen; ein Tipp auf ein anderes Feld schließt das vorige Feld ab (Rundung, Grenzen).
- Preisrechner: Grundglas folgt immer dem gewählten Typ, auch wenn ein Typ keine Gläser mehr hat; Prismenzuschlag
  nimmt den bearbeitbaren Preis aus der Datenbank; Name einer freien Position wird sofort übernommen; „Weiter"
  folgt der Reihenfolge auf dem Bildschirm; verwaiste Schlüssel im gespeicherten Zustand entfernt.
- Visus: LogMAR-Feld lässt sich leeren, das andere Feld folgt.
- Datenbanken: Einlesen bringt Eigenschaften und Preise in die erwartete Form (keine leere Liste mehr nach einer
  Hand-JSON); Zuordnung nach Kennung oder Name, bei CSV auch ohne Herstellerspalte; eine Sicherung der anderen
  Sammlung wird abgewiesen; Import speichert einmal statt je Zeile; Zähler unter Mehr aktualisiert sich.
- Zahlen mit Tausenderpunkt (2.304,85) werden erkannt.
- Detailansicht und Formular der Datenbanken auf dem iPad in voller Breite.
- Adresse mit Prototyp-Namen (#toString) lässt die App nicht mehr abstürzen.
- Service Worker liefert die Startseite nur noch bei Seitenaufrufen, nicht für fehlende Dateien.
- Prüfskript zeichnet alle Ansichten, Detail, Formular und Tastenfeld; läuft in CI und vor jedem Deploy.

### Behoben
- Preisrechner: Nach dem Wechsel des Glastyps rechnete die Kalkulation noch mit dem alten Grundglas, bis man ein Glas antippte.
- Bei offenem Tastenfeld brauchte jeder Knopf außerhalb zwei Tipps (Glastyp im Preisrechner, Optionen, Schalter). Der erste Tipp schloss nur das Tastenfeld. Jetzt wirkt der Tipp sofort, das Tastenfeld schließt danach.

### Geändert
- „Weiter" im Tastenfeld bewegt die Seite nicht mehr. Gerollt wird nur beim Antippen eines Feldes bei geschlossenem Tastenfeld.

## [0.1.2] - 2026-10-13

### Geändert
- Die Kopfzeile des Tastenfelds zeigt den getippten Wert groß an, auch wenn das Feld außer Sicht ist.

## [0.1.1] - 2026-10-10

### Neu
- Ko-fi-Link unter Mehr und im README, Sponsor-Knopf auf GitHub. README nur noch auf Deutsch.
- Jeder Push auf main erzeugt ein Update auf dem iPhone: die Veröffentlichung schreibt den Commit in den Service
  Worker, der Cache-Name ändert sich damit auch ohne Versionssprung.

## [0.1.0] - 2026-10-07

Zweiter Anlauf nach Avina-Optik 0.1.0, neu aufgebaut für die Bedienung mit einer Hand. Avina-Optik bleibt unverändert
parallel erreichbar.

### Neu
- Eigenes Tastenfeld statt iOS-Tastatur: große Tasten, ±, Schritt kleiner und größer, Schnellwerte je Feld (Achse,
  HSA, Basislage, Addition), „Weiter" springt zum nächsten Feld. Kein Zoom bei Doppeltipp, keine Wischgeste, die die
  Seite wechselt, Tastenfeld und Reiter mit 44 px und mehr.
- Startseite mit Kacheln in drei Gruppen: Refraktion, Fassung und Glas, Preise und Kasse; Hörakustik als vierte Gruppe,
  abschaltbar unter Mehr. Ergebnis steht in jedem Rechner oben.
- Kopieren-Knopf in der Kopfzeile: Ergebnis jedes Rechners als Text für das Verwaltungsprogramm.
- Neue Rechner: Visus (Dezimal, Snellen, LogMAR), Tönung (Filterkategorien 0 bis 4, Verkehrstauglichkeit), Kassenanteil
  Brillengläser (Festbetragsgruppen, Zuschläge, Zuzahlung, unter 18).
- Preisrechner: Grundglas je Typ und Stufe, Optionen aus der Gläserdatenbank mit Ausschlussregeln (eine Glasstärke,
  eine Tönung), Prisma je Glas, Fassung, freie Positionen, Rabatt in Prozent oder Euro, Zusammenfassung zum Kopieren.
- Hörakustik: Eigenanteil (Festbetrag 704,37 € je Ohr, zweites Ohr −20 %, Zuzahlung, Otoplastik, Ladestation),
  Batterien (Größen, Laufzeiten, Jahresbedarf), Hörgeräte-Datenbank mit KIND-Stufen und Modellen.
- Gläser- und Hörgeräte-Datenbank mit JSON-Sicherung und CSV-Einlesen (Preisliste aus dem Geschäft).
- iPad: zwei Spalten ab 900 px Breite.
- Dunkel und hell, Service Worker für den Offline-Betrieb, Einzeldatei `dist/dioptra.html`.

### Übernommen aus Avina-Optik
- HSA-Rechner und Prismenrechner (gegen DER AUGENOPTIKER geprüft), Transposition, Nahwerte, Dezentration,
  Mindestdurchmesser, Glasdicke, KIND-Glassortiment.
