# Dioptra-Rechner als Kurzbefehle (iPhone und Apple Watch)

watchOS hat keinen Browser und kennt keine Web-Apps. 
Ein auf dem iPhone gebauter Kurzbefehl mit „Auf der Apple Watch anzeigen" erscheint in der
Kurzbefehle-App der Watch, fragt Zahlen ab und zeigt das Ergebnis. Einmal gebaut, lässt sich jeder Kurzbefehl per
iCloud-Link an ein zweites iPhone weitergeben (Kurzbefehl teilen).

Was auf der Watch nicht geht: Grafiken (TABO-Schema), Listen zum Antippen aus einer Datenbank, Tabellen. Darum gibt es
hier die Rechner, die mit Zahlen auskommen. Die Gläser- und Hörgeräte-Datenbank sowie der Preisrechner mit Optionen
bleiben auf dem iPhone in Dioptra.

## Bausteine, die in jedem Kurzbefehl vorkommen

| Aktion (deutscher Name in Kurzbefehle) | Wofür |
| --- | --- |
| **Nach Eingabe fragen**, Eingabetyp **Zahl** | Zahl abfragen. Auf der Watch erscheint ein Ziffernblock mit Komma. |
| **Aus Menü auswählen** | Vorzeichen (Plus / Minus), Glasart, Brechzahl, Auge. Auf der Watch als Liste. |
| **Variable festlegen** | Wert unter einem Namen merken (`F`, `alt`, `neu` …). |
| **Berechnen** | Grundrechenarten mit zwei Werten. |
| **Ausdruck berechnen** | Eine ganze Formel in einem Schritt, mit Klammern und Funktionen wie `sqrt( )`, `sin( )`, `cos( )`, `atan( )`, `log( )`. Variablen werden per „Variable auswählen" in den Text eingefügt. Dezimaltrenner im Ausdruck ist der Punkt. |
| **Zahl runden** | Auf 2 oder 3 Nachkommastellen. |
| **Ergebnis anzeigen** | Text mit eingefügten Variablen. Auf der Watch als Bildschirm, mit „Fertig". |

**Vorzeichen:** Ob der Ziffernblock der Watch ein Minus kennt, ist nicht verlässlich. Darum fragen die Anleitungen den
Betrag ab und das Vorzeichen über ein Menü: **Aus Menü auswählen** mit den Punkten „Plus" und „Minus"; im Zweig „Minus"
**Berechnen**: Betrag × −1, dann **Variable festlegen**. Wer Sphäre und Zylinder nur als Minuswerte braucht (Minuszylinder,
Kurzsichtige), kann das Menü weglassen und direkt mit −1 multiplizieren.

**Winkel:** Die Winkelfunktionen rechnen in Bogenmaß. Grad werden mit `× 3.14159265 / 180` umgerechnet, zurück mit
`× 180 / 3.14159265`.

**Falls „Ausdruck berechnen" eine Funktion nicht annimmt:** Die Aktion versteht Grundrechenarten, Potenz `^` und die
üblichen Funktionen. Sollte eine Funktion auf einem Gerät fehlen, die Formel mit mehreren **Berechnen**-Schritten
nachbauen; Wurzel geht auch als `^ 0.5`.

Alle Formeln sind dieselben wie in Dioptra (`app/core.js`), die Ergebnisse stimmen also mit der App überein.

---

## 1. HSA (Sphäre und Zylinder in einem Lauf)

Eingaben: `sph` (mit Vorzeichen-Menü), `cyl` (mit Vorzeichen-Menü, 0 wenn kein Zylinder), `alt` (mm), `neu` (mm, 0 = Kontaktlinse).

1. `d` = **Ausdruck berechnen**: `( alt − neu ) / 1000`
2. `m2` = **Ausdruck berechnen**: `sph + cyl` (zweiter Hauptschnitt)
3. `n1` = **Ausdruck berechnen**: `sph / ( 1 − d × sph )`
4. `n2` = **Ausdruck berechnen**: `m2 / ( 1 − d × m2 )`
5. `cylNeu` = **Ausdruck berechnen**: `n2 − n1`
6. **Zahl runden** `n1` und `cylNeu` auf 3 Stellen, für die Bestellrundung zusätzlich **Ausdruck berechnen**:
   `round( n1 × 4 ) / 4` (0,25-Schritte; falls `round` fehlt, von Hand runden).
7. **Ergebnis anzeigen**: „Bei [neu] mm: sph [n1], cyl [cylNeu], Achse unverändert".

Probe: −6,00 / −2,00, 12 → 0 mm ergibt −5,597 / −1,702.

## 2. Transposition

Eingaben: `sph`, `cyl` (beide mit Vorzeichen), `achse`.

1. `sphNeu` = `sph + cyl`
2. `cylNeu` = `cyl × −1`
3. `achseNeu` = **Wenn** `achse` > 90: `achse − 90`, **Sonst**: `achse + 90`
4. Zusätzlich `aeq` = `sph + cyl / 2` (sphärisches Äquivalent).
5. **Ergebnis anzeigen**: „[sphNeu] [cylNeu] A [achseNeu]°, sph. Äq. [aeq]".

## 3. Nahwerte

Eingaben: `sph` (Vorzeichen), `add`, optional `anteil` (Zwischenbereich, z. B. 0.5).

1. `nah` = `sph + add`
2. `zwischen` = `sph + add × anteil`
3. **Ergebnis anzeigen**: „Nähe [nah], Zwischenbereich [zwischen]; Zylinder und Achse bleiben".

## 4. Visus

Eingabe: `v` (Dezimalvisus, z. B. 0.5).

1. `logmar` = **Ausdruck berechnen**: `log( 1 / v )` (log ist der Zehnerlogarithmus; liefert die Aktion den
   natürlichen Logarithmus, stattdessen `ln( 1 / v ) / 2.302585`)
2. `s6` = `6 / v`, `s20` = `20 / v`
3. **Ergebnis anzeigen**: „Visus [v] = 6/[s6] = 20/[s20], LogMAR [logmar]".

## 5. Prismen (Gesamtprisma und symmetrische Verteilung)

Eingaben: `pR`, `bR` (Prisma und Basis rechts), `pL`, `bL` (links). Basis in Grad, TABO.

1. `k` = **Ausdruck berechnen**: `3.14159265 / 180`
2. `x` = **Ausdruck berechnen**: `pR × cos( bR × k ) − pL × cos( bL × k )`
3. `y` = **Ausdruck berechnen**: `pR × sin( bR × k ) − pL × sin( bL × k )`
4. `p` = **Ausdruck berechnen**: `sqrt( x × x + y × y )`
5. `w` = **Ausdruck berechnen**: `atan( y / x ) × 180 / 3.14159265` (bei `x` = 0 stattdessen 90 oder 270 je nach
   Vorzeichen von `y`)
6. Basislage in 0 bis 360 bringen: **Wenn** `x` < 0: `w = w + 180`; danach **Wenn** `w` < 0: `w = w + 360`.
7. Verteilung: `halb` = `p / 2`, rechts Basis `w`, links Basis `w + 180` (über 360 dann −360).
8. **Ergebnis anzeigen**: „Gesamt (R-Auge) [p] cm/m Basis [w]°. Verteilt: R [halb] cm/m Basis [w]°, L [halb] cm/m Basis [wL]°".

Probe: R 3 cm/m 0°, L 2 cm/m 90° ergibt 3,606 cm/m Basis 326,31°, verteilt je 1,803 cm/m (R 326,3°, L 146,3°).

## 6. Dezentration (Prentice), sphärisch

Eingaben: `F` (Glaswirkung mit Vorzeichen), `dez` (Verschiebung in mm, Betrag), Menü „Richtung" (innen / außen / oben / unten).

1. `prisma` = **Ausdruck berechnen**: `abs( F ) × dez / 10`
2. Basis: bei Plusglas in Richtung der Verschiebung, bei Minusglas entgegen. **Wenn** `F` > 0: Basis = gewählte Richtung,
   **Sonst**: Gegenrichtung (innen↔außen, oben↔unten) als Text setzen.
3. **Ergebnis anzeigen**: „[prisma] cm/m Basis [Richtung]".

Mit Zylinder: Wirkung im Hauptschnitt der Verschiebung einsetzen (horizontal: `sph + cyl × sin( achse × k )^2`,
vertikal: `sph + cyl × cos( achse × k )^2`), sonst wie oben. Die schräge Komponente lässt Dioptra auf dem iPhone rechnen.

## 7. Mindestdurchmesser

Eingaben: `a` (Scheibenlänge), `b` (Scheibenhöhe), `steg`, `pd` (monokular, je Auge einmal laufen lassen), optional `zugabe` (2).

1. `ed` = **Ausdruck berechnen**: `sqrt( a × a + b × b )` (oder die gemessene Diagonale direkt abfragen)
2. `dez` = **Ausdruck berechnen**: `( a + steg ) / 2 − pd`
3. `min` = **Ausdruck berechnen**: `ed + 2 × abs( dez ) + zugabe`
4. **Ergebnis anzeigen**: „Dezentration [dez] mm, Mindestdurchmesser [min] mm" (positiv = innen).

## 8. Glasdicke (eine Brechzahl)

Eingaben: `F` (stärkster Hauptschnitt mit Vorzeichen), `d` (Durchmesser mm), `t` (Mindestdicke mm), Menü Brechzahl
`n` = 1.5 / 1.6 / 1.67 / 1.74.

1. `F1` = **Wenn** `F` > 0: `F + 6`, **Sonst**: `F / 2 + 6` (Basiskurve nach Vogel)
2. `F2` = `F − F1`
3. `h` = `d / 2`
4. `s1` = **Ausdruck berechnen**: `r1 − sqrt( r1 × r1 − h × h )` mit `r1 = ( n − 1 ) / abs( F1 ) × 1000`
   (erst `r1` als eigene Variable berechnen)
5. `s2` = ebenso mit `r2 = ( n − 1 ) / abs( F2 ) × 1000`
6. `diff` = `s1 − s2` (Mitte minus Rand)
7. **Wenn** `diff` ≥ 0 (Plusglas): Mitte = `t + diff`, Rand = `t`. **Sonst**: Mitte = `t`, Rand = `t − diff`.
8. **Ergebnis anzeigen**: „Index [n]: Mitte [mitte] mm, Rand [rand] mm".

Probe: −6,00, 65 mm, 1,0 mm, n = 1,5 ergibt Rand 8,3 mm.

## 9. Tönung

Eingabe: `t` (Transmission in %).

**Wenn** `t` ≥ 80: Kategorie 0; **Sonst wenn** ≥ 43: 1; ≥ 18: 2; ≥ 8: 3; ≥ 3: 4. Dazu „Absorption [100 − t] %".
Tags fahren bis Kategorie 3, nachts nur ab 75 % Transmission.

## 10. Eigenanteil Hörgeräte

Eingaben: `preis` (je Gerät), Menü „Ohren" (1 / 2), Menü „Preis ist" (Eigenanteil / Gesamtpreis), optional `lade`.

1. `kasse` = **Ausdruck berechnen**: `704.37 × ( 1 + 0.8 × ( ohren − 1 ) )`
2. Bei „Eigenanteil": `eigen = preis × ohren`. Bei „Gesamtpreis": `eigen = max( 0 , preis × ohren − kasse )`
   (falls `max` fehlt: Wenn-Abfrage).
3. `zuz` = `10 × ohren`
4. `gesamt` = `eigen + zuz + lade`
5. **Ergebnis anzeigen**: „Eigenanteil [eigen] €, Zuzahlung [zuz] €, zu zahlen [gesamt] € (Kasse [kasse] €)".

## 11. Batterien

Eingaben: `tage` (Laufzeit je Zelle), `geraete` (1 / 2), `preis` (je Zelle, KIND 36er: 0.5).

1. `zellen` = **Ausdruck berechnen**: `ceil( 365 / tage ) × geraete` (ohne `ceil`: aufrunden per Zahl runden, Modus Aufrunden)
2. `kosten` = `zellen × preis`
3. **Ergebnis anzeigen**: „[zellen] Zellen je Jahr, [kosten] €".

---

## Auf die Watch bringen

1. Kurzbefehl auf dem iPhone öffnen, Details (ⓘ), **Auf der Apple Watch anzeigen** einschalten.
2. Auf der Watch die Kurzbefehle-App öffnen, Kurzbefehl antippen, Zahlen eingeben, Ergebnis lesen.
3. Teilen: Kurzbefehl auf dem iPhone, Teilen, „iCloud-Link kopieren", Link an das andere iPhone senden, dort öffnen und
   „Kurzbefehl hinzufügen".
