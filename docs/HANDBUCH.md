# Dioptra - Handbuch (Bedienung)

Stand: v0.2.0. Web-App für iPhone und iPad (Safari), läuft auch in jedem anderen Browser.

## 1. Installation und Start

| Gerät | Was passiert |
| --- | --- |
| iPhone, iPad | https://ghost-o7.github.io/dioptra/ in Safari öffnen, Teilen, „Zum Home-Bildschirm". Beim ersten Start werden alle Dateien geladen, danach läuft die App ohne Netz. Eine neue Version wird beim nächsten Start mit Netz geholt, die App meldet „Aktualisiert" und lädt neu. |
| Android | APK aus den Releases laden, Installation aus dieser Quelle erlauben, installieren. Updates durch Installieren der neuen APK über die alte (gleiche Signatur vorausgesetzt). Zurück-Taste führt in der App zurück. |
| Windows | Setup `.exe` (installiert für den Benutzer, keine Adminrechte) oder `.msi` für die Softwareverteilung. Programm unter Start, Dioptra. |
| Linux | `.deb` mit `sudo apt install ./Dioptra_<version>_amd64.deb` oder `.AppImage` ausführbar machen und starten. |
| Browser | Adresse direkt öffnen; `dist/dioptra.html` läuft auch als lokale Datei auf Mac, PC und Android. |

Sicherungen: iPhone legt die JSON-Datei in „Dateien" ab, Android öffnet das Teilen-Menü (zum Beispiel in Drive oder
Dateien speichern), Windows und Linux fragen über einen Speichern-Dialog nach dem Ort.

Release bauen (Herausgeber): Tag `v<version>` setzen und pushen, der Workflow „Release" baut Windows, Linux und Android
als Entwurfs-Release. Für gleichbleibende Android-Signaturen einmal einen Schlüssel erzeugen und als Secrets hinterlegen:

```
keytool -genkeypair -keystore dioptra.keystore -alias dioptra -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 dioptra.keystore   # Inhalt als Secret ANDROID_KEYSTORE_B64
```

Dazu `ANDROID_KEYSTORE_PASSWORD` und `ANDROID_KEY_ALIAS` (dioptra). Ohne diese Secrets signiert jeder Lauf mit einem
neuen Schlüssel; dann muss die alte App vor dem Update deinstalliert werden.

| Daten | Ort |
| --- | --- |
| Rechnereingaben | Browserspeicher, Schlüssel `dioptra.calc.<rechner>`, `dioptra.preis`, `dioptra.hoer.*` |
| Gläser, Hörgeräte | Browserspeicher, Schlüssel `dioptra.db.glaeser`, `dioptra.db.hoer` |
| Einstellungen | `dioptra.settings` (Hörakustik an/aus), `theme` (system, dark, light) |
| Sicherung | JSON-Datei über Mehr, landet in „Dateien" |

## 2. Aufbau und Bedienung

Unten vier Reiter: **Start** (Kacheln aller Rechner), **Gläser**, **Preis**, **Mehr**. Oben links „Zurück", oben rechts
„Kopieren", der das Ergebnis des aktuellen Rechners als Text in die Zwischenablage legt.

Zahlenfelder zeigen Bezeichnung, Wert und Einheit. Tippen öffnet unten das Tastenfeld:

| Taste | Wirkung |
| --- | --- |
| Ziffern, Komma | Neuen Wert tippen. Der erste Tipp ersetzt den alten Wert. |
| ⌫ | Letzte Stelle löschen |
| − und + | Schrittweite des Feldes abziehen oder dazu (0,25 dpt, 0,5 cm/m, 1°, 1 mm, 5 %, 10 €) |
| ± | Vorzeichen wechseln |
| Schnellwerte | Zeile über den Tasten, zum Beispiel 0/45/90/135/180 bei der Achse, KL 0/12/13/14/15 beim HSA |
| Weiter | Nächstes Feld |
| Fertig | Tastenfeld schließen (auch Tippen außerhalb) |

Ergebnisse erscheinen beim Tippen, ohne „Berechnen". Eingaben bleiben beim Wechsel erhalten, „Felder leeren" setzt den
Rechner zurück. Mit Tastatur (iPad, PC) gehen Ziffern, Pfeil hoch und runter, Rücktaste direkt im Feld.

## 3. Rechner

| Rechner | Eingabe | Ergebnis |
| --- | --- | --- |
| HSA | Sph, Zyl, Achse für R und L, „bei HSA", „neuer HSA" (0 = Kontaktlinse) | Je Auge gerundete Werte (0,25 dpt), genaue Werte, Hauptschnitte vorher und nachher, Rundungshinweise. |
| Prismen | Prisma und Basis je Auge (TABO) | Symmetrische Verteilung groß oben, Gesamtprisma bezogen auf das rechte Auge, Komponenten je Auge, TABO-Grafik. |
| Transposition | Sph, Zyl, Achse je Auge | Andere Zylinderschreibweise, sphärisches Äquivalent, Hauptschnitte. |
| Nahwerte | Fernwerte, Addition, Anteil Zwischenbereich | Nah- und Zwischenwerte je Auge. |
| Visus | Dezimal oder LogMAR | Snellen 6/x und 20/x, LogMAR, Tabelle. |
| Dezentration | Glaswerte, Verschiebung horizontal (+ innen) und vertikal (+ oben) in mm | Prismatische Nebenwirkung mit Basislage und Komponenten. |
| Mindestdurchmesser | Kastenmaß, Steg, PD, optional Diagonale und vertikale Dezentration, Zugabe | Je Auge Dezentration, Mindestdurchmesser, Rohglas. |
| Glasdicke | Sph, Zyl, Durchmesser, Mindestdicke | Mitten- und Randdicke für 1,5 / 1,6 / 1,67 / 1,74, Empfehlung nach KIND-Staffel. |
| Tönung | Lichttransmission in % | Filterkategorie 0 bis 4, Absorption, Verkehrstauglichkeit tags und nachts. |
| Kassenanteil Gläser | Glasart, unter 18, Lichtschutz, UV 400, Sph und Zyl je Auge, Prisma | Festbetragsgruppe und Zuschläge je Glas, Zuzahlung, Summe, Refraktionsbestimmung. |
| Preisrechner | Glastyp und Stufe, Optionen, Prisma je Glas, Fassung, freie Positionen, Rabatt | Kalkulation mit Summe und Text zum Kopieren. |

## 4. Preisrechner

Grundglas wählen (Einstärken, Gleitsicht, Raumkomfort, je Stufe aus der Datenbank). Optionen antippen: Glasstärke 1,6 /
1,67 / 1,74 (nur eine), Premium-Entspiegelung, Blaulichtfilter, Tönungen (nur eine von KIND_colour_, fashionColour,
polarisierend, selbsttönend), Verspiegelung. Prisma mit Anzahl der Gläser. Fassung, freie Positionen mit Name und Betrag,
Rabatt in Prozent oder Euro. Die Preise kommen aus der Gläserdatenbank, Änderungen dort gelten sofort. „Neue Kalkulation"
leert alles. Es werden keine Kundendaten gespeichert.

## 5. Datenbanken (Gläser, Hörgeräte)

| Funktion | Bedienung |
| --- | --- |
| Suchen | Suchfeld: Name, Hersteller, Stufe, Bestellnummer, Eigenschaft, Notiz, Bauform. Mehrere Wörter grenzen weiter ein. |
| Filtern | Chips nach Typ. |
| Ansehen, Bearbeiten | Eintrag antippen, dann „Bearbeiten" oben rechts. Bestellnummer, Lieferbereich und Notizen sind frei. |
| Neu, Löschen | „Neu" oben, „Löschen" im Bearbeiten-Formular mit Rückfrage. |
| Sichern, Einlesen | Mehr: Sichern (JSON), Einlesen (JSON oder CSV). Gleiche Kennung oder gleicher Name plus Hersteller aktualisiert den Eintrag. |
| CSV | Kopfzeile mit Spaltennamen: name, hersteller, typ, stufe, preis, index, bestellnr, verfuegbar, lieferbereich, eigenschaften (mit \| getrennt), hinweis, notizen, bauform. Trenner Semikolon, Komma oder Tab. |
| Zurücksetzen | Mehr: auf Startbestand zurücksetzen (eigene Einträge gehen verloren). |

## 6. Hörakustik

Unter Mehr ein- und ausschaltbar. Eigenanteil: Preis je Gerät (bei KIND-Preisen ist das bereits der Eigenanteil, Schalter
„Preis ist bereits Eigenanteil"; aus: Preis ist der Gesamtpreis vor Kassenanteil), ein oder beide Ohren (zweites Ohr mit
20 % Abschlag beim Festbetrag), Festbetrag je Ohr (704,37 €, hochgradig 734,81 €), Ohrpassstück (Otoplastik 45,07 €,
Schirmchen 11,61 €), Ladestation, Sonstiges. Batterien: Zeile antippen übernimmt die mittlere Laufzeit, Jahresbedarf und
Kosten. Hörgeräte: KIND-Stufen und -Modelle mit Eigenanteil je Gerät.

## 7. Grundlagen der Rechnungen

- HSA: F' = F / (1 − d·F) je Hauptschnitt, d = (alt − neu) in Metern.
- Prismen: Zerlegung je Auge in cos/sin der Basislage, Komponenten des linken Auges bezogen auf das rechte Auge mit
  umgekehrtem Vorzeichen, resultierendes Prisma als Betrag und Winkel, symmetrische Verteilung mit halbem Betrag.
- Prentice: P = F·d / 10 mit der Wirkungsmatrix des Glases.
- Mindestdurchmesser = Diagonale + 2·|Dezentration| + 2·|vertikale Dezentration| + Zugabe.
- Glasdicke: Pfeilhöhe je Fläche, Basiskurve nach Vogel.
- Visus: LogMAR = −log10(V), Snellen 6/(6/V).
- Tönung: Kategorien nach EN ISO 12312-1 (0: 80 bis 100 %, 1: 43 bis 80 %, 2: 18 bis 43 %, 3: 8 bis 18 %, 4: 3 bis 8 %).
- Kassenanteil: Festbetragsgruppe nach Glasart, Sphäre und Zylinder, Zuschläge für Zylinder über 4, Prisma, Lichtschutz,
  UV 400. Zuzahlung 10 %, mindestens 5, höchstens 10 € je Glas, unter 18 keine.
- Hörgeräte: Kasse = Festbetrag (zweites Ohr × 0,8) plus Ohrpassstücke; Eigenanteil = Gesamtpreis − Kasse oder direkt
  der Listenpreis; Zuzahlung 10 € je Gerät.
