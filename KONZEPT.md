# Winddreieck-Trainer – Konzept

Interaktive Web-Anwendung, mit der Flugschüler das **Winddreieck** verstehen und
üben können. Der Nutzer gibt TAS, rechtweisenden Kurs (rwK), Windrichtung und
Windstärke ein; die App stellt die Vektoren geometrisch dar, berechnet den
Vorhaltewinkel und zerlegt den Wind trigonometrisch in Gegen-/Rückenwind und
Seitenwind.

---

## 1. Ziel & Zielgruppe

- **Zielgruppe:** PPL-/LAPL-Flugschüler in der Navigationsausbildung.
- **Lernziel:** Verstehen, wie sich aus **Kurs über Grund**, **Wind** und
  **Eigengeschwindigkeit** der nötige **Steuerkurs (Vorhaltewinkel)** und die
  **Geschwindigkeit über Grund** ergeben – sowohl geometrisch (Vektoren) als
  auch rechnerisch (Trigonometrie).

---

## 2. Eingaben

| Größe | Symbol | Einheit | Bereich | Bedeutung |
|-------|--------|---------|---------|-----------|
| True Airspeed | TAS | kt | 0–300 | Eigengeschwindigkeit durch die Luft |
| Rechtweisender Kurs | rwK | ° | 0–359 | gewünschter Kurs über Grund (Track) |
| Windrichtung | dd | ° | 0–359 | Richtung, **aus** der der Wind weht |
| Windstärke | W | kt | 0–120 | Windgeschwindigkeit |

Alle Eingaben sind über **Schieberegler + Zahlenfeld** steuerbar. Die
Windrichtung kann zusätzlich **direkt am Kompass per Drag** gesetzt werden.

---

## 3. Berechnung (Trigonometrie)

Grundlage ist die Vektorgleichung des Winddreiecks:

```
Luftvektor (TAS, Steuerkurs) + Windvektor = Grundvektor (GS, Kurs über Grund)
```

Durch Zerlegung senkrecht und parallel zum Kurs ergeben sich geschlossene
Formeln. Mit `β = Windrichtung − rwK` (Winkel des Windes relativ zum Kurs):

| Ergebnis | Formel |
|----------|--------|
| Vorhaltewinkel | `WCA = arcsin( (W / TAS) · sin β )` |
| Steuerkurs (rwSK) | `rwSK = rwK + WCA` |
| Geschwindigkeit über Grund | `GS = TAS · cos(WCA) − W · cos β` |
| Gegen-/Rückenwind | `HWC = W · cos β`  (+ = Gegenwind) |
| Seitenwind | `XWC = W · sin β`  (+ = von rechts) |

**Sonderfall:** Ist `W · |sin β| > TAS`, kann der Kurs nicht gehalten werden
(kein Steuerkurs lösbar). Gegen-/Seitenwind bleiben trotzdem definiert.

---

## 4. Kompass & Winddreieck (D3)

- **Kompassrose** mit Nordung (N oben), Strichen alle 10°, Beschriftung alle 30°
  und Himmelsrichtungen **N / O / S / W**.
- **Drei Vektoren** in Head-to-Tail-Konstruktion **A → P → B**:
  Luftvektor (A→P), Windvektor (P→B), Grundvektor (A→B). Das Dreieck schließt
  sich exakt. Wichtig: Die **Anzahl der Pfeilspitzen** unterscheidet die Vektoren
  (klassische Navigations-Konvention, siehe Referenz):

  | Vektor | Bezeichnung | Pfeilspitzen | Farbe |
  |--------|-------------|:------------:|-------|
  | Luftvektor | rwSK / TH / TAS | **1** | Blau `#3b82f6` |
  | Grundvektor | rwK / TT·TC / GS | **2** | Grün `#22c55e` |
  | Windvektor | Wind | **3** | Violett `#a855f7` |

- **Vorhaltewinkel / Driftwinkel** als Bogen an **A** zwischen Luft- und
  Grundvektor, beschriftet mit „Drift ±x°" (Pink `#f472b6`).
- **Winkel zwischen Wind und rwK·GS** als Bogen an **B**, wo Wind- und
  Grundvektor zusammentreffen (Amber `#fbbf24`, siehe Abschnitt 6).
- Punkte **A** (Start) und **B** (Ziel) wie in der klassischen Darstellung.
- **Interaktiv:** Alle Eingaben aktualisieren die Grafik live; die Windrichtung
  kann zusätzlich per **Ziehen am „W"-Griff** am Kompass gesetzt werden.

---

## 5. Gegen- & Seitenwind-Diagramm

Kompaktes Diagramm **unter dem Kompass** (gleiche Breite), das den Wind wie in
der Literatur relativ zum **Kurs über Grund (rwK)** zerlegt:

- Die **x-Achse ist der Grundvektor `rwK · GS`** (grün), ab **A** nach rechts.
- Der **Windvektor** geht von **A** aus (violett).
- Zerlegung in **Gegen-/Rückenwind auf der x-Achse** (`W · cos β`, rot) und
  **Seitenwind auf der y-Achse** (`W · sin β`, cyan), mit Rechtwinkel-Markierung.
- **Gemeinsamer Maßstab** (px/kt) für `rwK · GS` **und** den Wind: die Länge des
  grünen Vektors ist ∝ GS, sodass der rote Gegen-/Rückenwind-Vektor seine Größe
  **im Verhältnis zum grünen** ändert, wenn sich die Windstärke ändert.
- Die Zahlenwerte sind **identisch zur Ergebnis-Tabelle** (track-relativ);
  der Seitenwind ist der Wert, der über `W · sin β = TAS · sin WCA` den
  Vorhaltewinkel bestimmt.

---

## 6. Winkel zwischen Wind und rwK·GS

In **beiden** Diagrammen wird der Winkel zwischen dem Windvektor und dem
Grundvektor `rwK · GS` als Bogen mit Gradzahl eingezeichnet (Amber `#fbbf24`):
im Kompass an **B**, im Gegen-/Seitenwind-Diagramm an **A**. Es ist derselbe
physikalische Winkel (`180° − |β|`) und aktualisiert sich live.

---

## 7. Ergebnis-Panel

Zeigt alle Ergebnisse mit **eingesetzten Zahlenwerten** der Formeln:
Vorhaltewinkel, Steuerkurs, GS, Gegen-/Rückenwind, Seitenwind (mit Seite) und
Windwinkel β. Bei nicht lösbarem Kurs erscheint ein deutlicher Hinweis.

---

## 8. App-Rahmen (Hinweis, Header, Lizenzen)

- **Start-Hinweis:** Beim Laden erscheint ein Dialog, der bestätigt werden muss,
  bevor die Anwendung nutzbar ist. Inhalt: entwickelt von **Tim Borowski**
  (Link zu `borowski-software.de`), IT-Freelancer, mit KI-Unterstützung;
  ausschließlich für den **Flugsimulator** (z. B. MSFS), **nicht** für die reale
  Luftfahrt; **keine Haftung** für die Richtigkeit; Link zum Repository.
- **Header:** Titel, ein Link zum **BZF Trainer** (`bzf.borowski-software.de`)
  sowie ein Button **„Open-Source-Lizenzen"**, der einen Dialog mit den Lizenzen
  aller Laufzeit-Abhängigkeiten öffnet (per iFrame aus `public/licenses.html`).
- **Lizenzliste** wird beim Build automatisch erzeugt (`predev`/`prebuild` →
  `scripts/generate-licenses.mjs`).

---

## 9. Farben (konsistent über beide Diagramme)

| Element | Farbe |
|---------|-------|
| Luftvektor `rwSK · TAS` | Blau `#3b82f6` |
| Grundvektor `rwK · GS` | Grün `#22c55e` |
| Windvektor | Violett `#a855f7` |
| Gegen-/Rückenwind | Rot `#ef4444` |
| Seitenwind | Cyan `#38bdf8` |
| Vorhaltewinkel / Drift | Pink `#f472b6` |
| Winkel Wind ↔ rwK·GS | Amber `#fbbf24` |

---

## 10. Tech-Stack & Struktur

- **React 18 + TypeScript + Vite** (schnelles Dev-Setup, Typsicherheit)
- **D3.js** für Kompass, Vektoren, Pfeilspitzen, Bögen und Drag-Interaktion

```
src/
  main.tsx
  App.tsx / App.css / index.css
  vite-env.d.ts
  lib/
    windMath.ts            # reine Berechnung (Formeln)
    geometry.ts            # Vektor-/Koordinaten-Helfer
  components/
    Controls.tsx           # Eingaben (Slider + Zahlenfeld)
    WindTriangle.tsx       # D3-Kompass + Winddreieck (1/2/3 Pfeilspitzen)
    CrosswindDiagram.tsx   # D3-Zerlegung Gegen-/Seitenwind (rwK·GS-Achse)
    Results.tsx            # Ergebnisse + Formeln
    Modal.tsx              # generisches Overlay
    DisclaimerModal.tsx    # Start-Hinweis
    LicensesDialog.tsx     # Lizenz-Dialog (iFrame)
scripts/
  generate-licenses.mjs    # erzeugt public/licenses.html
```

**Bauen & Ausliefern:** `npm install`, dann `npm run dev` (Entwicklung,
`http://localhost:5173`), `npm run build` (Produktion → `dist/`) und
`npm run preview` (`dist/` lokal ausliefern). Details in der
[README](README.md).

---

## 11. Annahmen

- Einheiten: **Knoten (kt)** und **Grad (°)**, alles **rechtweisend** (True).
- Windrichtung = Richtung, **aus** der es weht (meteorologische Konvention).
- Gegen-/Seitenwind werden relativ zum **rwK** berechnet (Literatur-Standard).
- Kein Höhen-/Temperatureinfluss (TAS wird als gegeben angenommen).
