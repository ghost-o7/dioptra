"use strict";
// Dioptra - Startbestand für Kassenanteil (Brillengläser), Hörakustik (KIND-Hörgeräte, Festbeträge, Batterien).

// Festbeträge Sehhilfen je Glas inkl. MwSt., Bekanntmachung GKV-Spitzenverband zum 1.10.2021.
// Seit 1.3.2025 gelten bundesweit keine Festbeträge mehr; die Kassen erstatten über Versorgungsverträge in
// praktisch gleicher Höhe. Beträge daher als Richtwert, bei der Abrechnung die Vertragsliste der Kasse prüfen.
const FESTBETRAG = {
  stand: "Bekanntmachung 2021, inkl. MwSt.",
  gruppen: [
    { typ: "Einstärken", name: "Einstärkenglas sph bis ±6, cyl bis 2", sphMax: 6, cylMax: 2, betrag: 19.31 },
    { typ: "Einstärken", name: "Einstärkenglas sph bis ±6, cyl über 2 bis 4", sphMax: 6, cylMax: 4, betrag: 36.22 },
    { typ: "Einstärken", name: "Einstärkenglas sph über ±6 bis unter 10, cyl bis 4", sphMax: 9.99, cylMax: 4, betrag: 34.68 },
    { typ: "Einstärken", name: "Einstärkenglas hochbrechend sph 10 bis 12, cyl bis 4", sphMax: 12, cylMax: 4, betrag: 73.26 },
    { typ: "Einstärken", name: "Einstärkenglas hochbrechend sph über 12 bis 14, cyl bis 4", sphMax: 14, cylMax: 4, betrag: 104.37 },
    { typ: "Mehrstärken", name: "Mehrstärkenglas Fernteil sph bis ±6, cyl bis 4", sphMax: 6, cylMax: 4, betrag: 96.49 },
    { typ: "Mehrstärken", name: "Mehrstärkenglas sph über ±6 bis unter 10, cyl bis 4", sphMax: 9.99, cylMax: 4, betrag: 121.00 },
    { typ: "Mehrstärken", name: "Mehrstärkenglas hochbrechend sph 10 bis 12, cyl bis 4", sphMax: 12, cylMax: 4, betrag: 167.56 },
    { typ: "Mehrstärken", name: "Mehrstärkenglas hochbrechend sph über 12 bis 14, cyl bis 4", sphMax: 14, cylMax: 4, betrag: 190.17 },
    { typ: "Lentikular", name: "Einstärken-Lentikularglas", sphMax: 99, cylMax: 8, betrag: 101.34 },
    { typ: "Bifokal groß", name: "Bifokalglas mit großem oder hoch angesetztem Nahteil, sph unter 10, cyl bis 4", sphMax: 9.99, cylMax: 4, betrag: 112.69 }
  ],
  zuschlaege: { cyl6: 29.70, cyl8: 41.84, prisma3: 16.66, prisma6: 41.65, lichtschutz: 11.78, uv400: 54.74 },
  refraktion: 15.99
};

// Hörgeräte: Festbetrag der gesetzlichen Kassen je Ohr (Stand 2026, seit 04/2024 unverändert), zweites Ohr mit 20 % Abschlag.
const HOER_FESTBETRAG = { geraet: 704.37, geraetHochgradig: 734.81, zweitesOhrFaktor: 0.8, zuzahlung: 10, otoplastik: 45.07, schirmchen: 11.61, stand: "GKV-Spitzenverband, Stand 2026" };

// Batterien: Zinc-Air-Größen mit Farbcode und typischer Laufzeit. Preise laut kind.com (6 Stück 6 €, 12 Stück 9,60 €, 36 Stück 18 €).
const BATTERIEN = [
  { typ: "10", farbe: "gelb", mm: "5,8 × 3,6", tage: "3 bis 7", tageMittel: 5, geraete: "Kleinste IdO (CIC, IIC), kleine RIC" },
  { typ: "312", farbe: "braun", mm: "7,9 × 3,6", tage: "3 bis 10", tageMittel: 6, geraete: "RIC, miniRITE, kleine HdO, ITC" },
  { typ: "13", farbe: "orange", mm: "7,9 × 5,4", tage: "6 bis 14", tageMittel: 10, geraete: "HdO, große IdO" },
  { typ: "675", farbe: "blau", mm: "11,6 × 5,4", tage: "9 bis 20", tageMittel: 14, geraete: "Power-HdO, Cochlea-Implantat-Prozessoren" }
];
const BATTERIE_PREIS = { packung6: 6, packung12: 9.6, packung36: 18, jeZelle: 0.5 };

// KIND-Hörgeräte: Komfortstufen und Modelle laut kind.com, Stand 14.10.2026. Preise = Eigenanteil je Gerät
// für Versicherte der Ersatzkassen (vdek) mit Verordnung, zuzüglich 10 € gesetzlicher Zuzahlung. Andere Kassen können abweichen.
const HOER_SEED_VERSION = 1;
const HOER_SEED = [
  { id: "kh-stufe-null", hersteller: "KIND", name: "KIND Nulltarif", typ: "Stufe", preis: 0, bauform: "", eigenschaften: ["Hörgeräte mit Bluetooth-Technologie", "Kein Eigenanteil für gesetzlich Versicherte mit Verordnung"], hinweis: "Nur gesetzliche Zuzahlung 10 € je Gerät. Reparaturen über die Reparaturpauschale der Kasse." },
  { id: "kh-stufe-eco", hersteller: "KIND", name: "KIND Economy", typ: "Stufe", preis: 210, bauform: "", eigenschaften: ["Klares Hören in minimaler Form"], hinweis: "" },
  { id: "kh-stufe-ecop", hersteller: "KIND", name: "KIND Economy Plus", typ: "Stufe", preis: 435, bauform: "", eigenschaften: ["Gezieltes Hören, mehr Hörkomfort"], hinweis: "ab" },
  { id: "kh-stufe-q", hersteller: "KIND", name: "KIND Qualität", typ: "Stufe", preis: 785, bauform: "", eigenschaften: ["Leichteres Verstehen in allen Richtungen"], hinweis: "ab" },
  { id: "kh-stufe-qp", hersteller: "KIND", name: "KIND Qualität Plus", typ: "Stufe", preis: 1085, bauform: "", eigenschaften: ["Deutlicheres Hören, bequeme Bedienung"], hinweis: "ab" },
  { id: "kh-stufe-p", hersteller: "KIND", name: "KIND Premium", typ: "Stufe", preis: 1610, bauform: "", eigenschaften: ["Ausgewogener Hörgenuss in schwierigen Hörsituationen"], hinweis: "ab" },
  { id: "kh-stufe-pif", hersteller: "KIND", name: "KIND Premium IF / Premium Plus IF", typ: "Stufe", preis: 2160, bauform: "", eigenschaften: ["Hören ohne Kompromisse", "Modell KINDsevan IF"], hinweis: "ab" },
  { id: "kh-stufe-pp", hersteller: "KIND", name: "KIND Premium Plus", typ: "Stufe", preis: 2305, bauform: "", eigenschaften: ["Hörgeräte, die verstehen, was Sie hören wollen"], hinweis: "ab" },
  { id: "kh-duro-1400c", hersteller: "KIND", name: "KINDduro 1400 C", typ: "Modell", preis: 0, bauform: "HdO mit externem Hörer (RIC)", eigenschaften: ["Nulltarif-Modell"], hinweis: "" },
  { id: "kh-duro-1400", hersteller: "KIND", name: "KINDduro 1400", typ: "Modell", preis: 210, bauform: "HdO mit externem Hörer (RIC)", eigenschaften: ["Economy"], hinweis: "" },
  { id: "kh-sevan-x1-iic", hersteller: "KIND", name: "KINDsevan x 1 IIC", typ: "Modell", preis: 634.85, bauform: "Mini-IdO (IIC)", eigenschaften: ["Nahezu unsichtbar im Gehörgang"], hinweis: "ab" },
  { id: "kh-sevan-x2-cic", hersteller: "KIND", name: "KINDsevan x 2 CIC", typ: "Modell", preis: 984.85, bauform: "Mini-IdO (CIC)", eigenschaften: [], hinweis: "ab" },
  { id: "kh-sevan-x2-itc", hersteller: "KIND", name: "KINDsevan x 2 ITC", typ: "Modell", preis: 984.85, bauform: "IdO (ITC)", eigenschaften: [], hinweis: "ab" },
  { id: "kh-sevan-3-bte", hersteller: "KIND", name: "KINDsevan 3 miniBTE R", typ: "Modell", preis: 1084.85, bauform: "HdO (miniBTE), Akku", eigenschaften: ["Akku"], hinweis: "ab" },
  { id: "kh-sevan-3-rite", hersteller: "KIND", name: "KINDsevan 3 miniRITE R", typ: "Modell", preis: 1184.85, bauform: "HdO mit externem Hörer (miniRITE), Akku", eigenschaften: ["Akku"], hinweis: "ab" },
  { id: "kh-sevan-3-iic", hersteller: "KIND", name: "KINDsevan 3 IIC", typ: "Modell", preis: 1284.85, bauform: "Mini-IdO (IIC)", eigenschaften: [], hinweis: "ab" },
  { id: "kh-sevan-4-bte", hersteller: "KIND", name: "KINDsevan 4 miniBTE R", typ: "Modell", preis: 1609.85, bauform: "HdO (miniBTE), Akku", eigenschaften: ["Akku"], hinweis: "ab" },
  { id: "kh-sevan-5-bte", hersteller: "KIND", name: "KINDsevan 5 miniBTE R", typ: "Modell", preis: 2304.85, bauform: "HdO (miniBTE), Akku", eigenschaften: ["Akku"], hinweis: "ab" },
  { id: "kh-zub-lade", hersteller: "KIND", name: "Ladestation (Lithium-Ionen-Akku)", typ: "Zubehör", preis: 150, bauform: "", eigenschaften: ["150 bis 199 € je nach Ausstattung"], hinweis: "ab" },
  { id: "kh-zub-mini", hersteller: "KIND", name: "Miniaturisierung", typ: "Zubehör", preis: 150, bauform: "", eigenschaften: ["Aufpreis ca. 150 bis 350 €"], hinweis: "ab" },
  { id: "kh-zub-vers", hersteller: "KIND", name: "Hörgeräteversicherung", typ: "Zubehör", preis: 8, bauform: "", eigenschaften: ["je Gerät und Jahr, abhängig vom Eigenanteil"], hinweis: "ab" }
];
