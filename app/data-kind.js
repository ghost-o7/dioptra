"use strict";
// Dioptra - Startbestand der Gläserdatenbank: das KIND-Glassortiment in Deutschland.
// Quelle: kind.com (Brillengläser, Glasoptionen, Brillenglas-Preise, Gleitsicht), Stand 14.10.2026.
// Preise in Euro je Glaspaar (Grundgläser) bzw. Aufpreis je Paar (Optionen). Herstellerbestellnummern
// sind nicht öffentlich und werden im Geschäft nachgetragen (Feld „Bestellnummer“).
const SEED_VERSION = 1;
// gruppe: index | veredelung | toenung | zuschlag. In den Gruppen index und toenung ist nur eine Option je Brille möglich.
const KIND_SEED = [
  // Einstärkengläser
  { id: "kind-ev-q", hersteller: "KIND", name: "KIND Qualität", typ: "Einstärken", stufe: "Qualität", preis: 49, index: "1,5",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Leichtes Kunststoffglas", "Entspiegelt", "Gehärtet", "Wasserabweisend, pflegeleicht", "UV-Schutz"],
    hinweis: "Einstieg. Aufpreis Prisma 25 € je Glas." },
  { id: "kind-ev-qp", hersteller: "KIND", name: "KIND Qualität Plus", typ: "Einstärken", stufe: "Qualität Plus", preis: 149, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Flacheres Design, dünner und leichter", "Klare Sicht bis zum Rand", "Weniger Vergrößerung/Verkleinerung der Augen", "Ultra-robust, superentspiegelt, antistatisch", "Wasser- und schmutzabweisend"],
    hinweis: "Asphärisches Design laut Beschreibung (geringere Wölbung)." },
  { id: "kind-ev-p", hersteller: "KIND", name: "KIND Premium", typ: "Einstärken", stufe: "Premium", preis: 299, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Alles aus Qualität Plus", "Entspanntes Sehen bei häufigem Wechsel Ferne/Nähe", "Leichteres Fokussieren in der Nähe", "Schärfer in den Randbereichen"],
    hinweis: "Einstärkenglas mit Nahunterstützung (akkommodationsentlastend)." },
  { id: "kind-ev-pp", hersteller: "KIND", name: "KIND Premium Plus", typ: "Einstärken", stufe: "Premium Plus", preis: 349, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Alles aus Premium", "Individuell nach Sehgewohnheiten und Augenparametern", "Optimierter Tragekomfort", "Noch schärfere Ränder"],
    hinweis: "Individualglas: Fassungsdaten (HSA, Vorneigung, Fassungsscheibenwinkel) erforderlich." },
  // Gleitsichtgläser
  { id: "kind-gl-q", hersteller: "KIND", name: "KIND Qualität", typ: "Gleitsicht", stufe: "Qualität", preis: 199, index: "1,5",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Breite, klare Sehbereiche mit weichem Übergang", "Leichtes Kunststoffglas", "Entspiegelt, gehärtet, wasserabweisend", "UV-Schutz"],
    hinweis: "Einstiegs-Gleitsichtglas. Aufpreis Prisma 25 € je Glas." },
  { id: "kind-gl-qp", hersteller: "KIND", name: "KIND Qualität Plus", typ: "Gleitsicht", stufe: "Qualität Plus", preis: 399, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Größere, klarere Sehbereiche", "Weniger Schaukeleffekte bei schnellen Kopf- und Augenbewegungen", "Gute Spontanverträglichkeit", "Leichter Wechsel zwischen den Bereichen", "Ultra-robust, superentspiegelt, antistatisch"],
    hinweis: "" },
  { id: "kind-gl-p", hersteller: "KIND", name: "KIND Premium", typ: "Gleitsicht", stufe: "Premium", preis: 599, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Alles aus Qualität Plus", "Individualisiert mit den Parametern beider Augen (z. B. unterschiedliche Nahstärken)", "Leichteres Fokussieren in allen Entfernungen", "Schärferes Bild am Glasrand", "Abstimmbar auf Alltag: innen, draußen oder Stadt"],
    hinweis: "Beim Bestellen die Alltagsvariante (innen / draußen / Stadt) angeben." },
  { id: "kind-gl-pp", hersteller: "KIND", name: "KIND Premium Plus", typ: "Gleitsicht", stufe: "Premium Plus", preis: 699, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Alles aus Premium", "3D-Technologie gegen Randverzerrungen", "Maximale Individualisierung nach Sehgewohnheiten und Augenparametern", "Entspanntes Sehen in allen Bereichen"],
    hinweis: "Individualglas: vollständige Zentrier- und Fassungsdaten erforderlich." },
  // Raumkomfort
  { id: "kind-rk", hersteller: "KIND", name: "KIND Raumkomfort", typ: "Raumkomfort", stufe: "Raumkomfort", preis: 199, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Für häufigen Wechsel zwischen Nähe und mittlerer Entfernung", "Lesen, Bildschirm, Gespräche im Nahbereich"],
    hinweis: "Bildschirmarbeitsplatzbrille: 30 bis 100 cm. KIND empfiehlt die Kombination mit Blaulichtfilter." },
  { id: "kind-rk-plus", hersteller: "KIND", name: "KIND Raumkomfort Plus", typ: "Raumkomfort", stufe: "Raumkomfort Plus", preis: 399, index: "1,5",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Wie Raumkomfort mit höherwertigem Design", "Größere Sehbereiche"],
    hinweis: "" },
  // Optionen (KIND Komfort)
  { id: "kind-opt-16", gruppe: "index", hersteller: "KIND", name: "Dünne Gläser (Index 1,6)", typ: "Option", stufe: "KIND Komfort", preis: 85, index: "1,6",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Materialindex 1,6", "Empfohlen ab ±2,00 dpt"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-opt-167", gruppe: "index", hersteller: "KIND", name: "Extra dünne Gläser (Index 1,67)", typ: "Option", stufe: "KIND Komfort", preis: 120, index: "1,67",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Materialindex 1,67", "Empfohlen ab ±4,00 dpt", "Für mittlere bis höhere Stärken"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-opt-174", gruppe: "index", hersteller: "KIND", name: "Maximal dünne Gläser (Index 1,74)", typ: "Option", stufe: "KIND Komfort", preis: 195, index: "1,74",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Materialindex 1,74", "Empfohlen ab ±6,00 dpt", "Maximale Ästhetik und Tragekomfort"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-opt-ar", gruppe: "veredelung", hersteller: "KIND", name: "Premium-Entspiegelung", typ: "Option", stufe: "KIND Komfort", preis: 25, index: "",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Brillante, extra klare Entspiegelung", "100 % UV-Schutz", "Verbesserter Kontrast", "Antistatisch, staubabweisend", "Besonders kratzfest"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-opt-blau", gruppe: "veredelung", hersteller: "KIND", name: "Blaulichtfilter", typ: "Option", stufe: "KIND Komfort", preis: 50, index: "",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Filtert Blaulichtanteile digitaler Geräte"], hinweis: "Aufpreis je Glaspaar. Von KIND für Bildschirmarbeitsplatzbrillen empfohlen." },
  { id: "kind-opt-prisma", gruppe: "zuschlag", hersteller: "KIND", name: "Prismatische Korrektion", typ: "Option", stufe: "Zuschlag", preis: 50, index: "",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["25 € je Glas, 50 € je Paar"], hinweis: "Gilt für Einstärken- und Gleitsichtgläser." },
  // Tönungen
  { id: "kind-toen-colour", gruppe: "toenung", hersteller: "KIND", name: "KIND_colour_", typ: "Tönung", stufe: "KIND Tönungen", preis: 40, index: "",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Modische Tönung", "Laut KIND rund 50 Farbvarianten im Sortiment"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-toen-fashion", gruppe: "toenung", hersteller: "KIND", name: "KIND_fashionColour_", typ: "Tönung", stufe: "KIND Tönungen", preis: 50, index: "",
    verfuegbar: "Nur Fachgeschäft", eigenschaften: ["Modische Farbtönung, Verlauf oder Vollton"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-toen-mirror", gruppe: "veredelung", hersteller: "KIND", name: "KIND_styleMirror_", typ: "Tönung", stufe: "KIND Tönungen", preis: 50, index: "",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Verspiegelung"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-toen-polar", gruppe: "toenung", hersteller: "KIND", name: "Polarisierende Gläser", typ: "Tönung", stufe: "KIND Tönungen", preis: 110, index: "",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Blendet Lichtreflexe aus (Wasser, nasse Straße)"], hinweis: "Aufpreis je Glaspaar." },
  { id: "kind-toen-photo", gruppe: "toenung", hersteller: "KIND", name: "Selbsttönende Gläser (Phototrop)", typ: "Tönung", stufe: "KIND Tönungen", preis: 110, index: "",
    verfuegbar: "Online und Fachgeschäft", eigenschaften: ["Passt sich dem Licht an, volle Tönung in 20 bis 30 s", "Hellt im Dunkeln vollständig auf, nachts fahrtauglich", "100 % UV-Schutz", "Hinter der Windschutzscheibe nur schwache Tönung"],
    hinweis: "Preisseite: 110 € je Paar. Sonnenbrillenseite nennt Phototrop mit 159 € je Paar; im Geschäft prüfen." }
];
