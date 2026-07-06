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

## 4. Geometrische Darstellung (D3)

- **Kompassrose** mit Nordung (N oben), Strichen alle 10°, Beschriftung alle 30°
  und Himmelsrichtungen **N / O / S / W**.
- **Drei Vektoren** vom Ursprung/Kopf, farblich unterschieden. Wichtig: Die
  **Anzahl der Pfeilspitzen** unterscheidet die Vektoren (klassische
  Navigations-Konvention, siehe Referenz):

  | Vektor | Bezeichnung | Pfeilspitzen | Farbe |
  |--------|-------------|:------------:|-------|
  | Luftvektor | rwSK / TH / TAS | **1** | Blau |
  | Grundvektor | rwK / TT/TC / GS | **2** | Grün |
  | Windvektor | Wind | **3** | Violett |

- **Vorhaltewinkel** als Bogen zwischen Luft- und Grundvektor mit Gradzahl.
- **Head-to-Tail-Konstruktion:** Luftvektor (O→P), Windvektor (P→Q),
  Grundvektor (O→Q). Das Dreieck schließt sich exakt.
- Punkte **A** (Start) und **B** (Ziel) wie in der klassischen Darstellung.
- **Interaktiv:** Alle Eingaben aktualisieren die Grafik live; Windrichtung
  zusätzlich per Ziehen am Kompass.

---

## 5. Seitenwind-/Gegenwind-Diagramm

Separates, kompaktes Diagramm, das den Windvektor relativ zur Flugrichtung in
zwei rechtwinklige Komponenten zerlegt:

- **Gegenwind/Rückenwind** entlang des Kurses (`W · cos β`).
- **Seitenwind** senkrecht zum Kurs (`W · sin β`, von links/rechts).
- Rechtwinkel-Markierung und beschriftete Komponenten – zeigt anschaulich die
  Trigonometrie hinter den Zahlen.

---

## 6. Ergebnis-Panel

Zeigt alle Ergebnisse mit **eingesetzten Zahlenwerten** der Formeln:
Vorhaltewinkel, Steuerkurs, GS, Gegen-/Rückenwind, Seitenwind (mit Seite).
Bei nicht lösbarem Kurs erscheint ein deutlicher Hinweis.

---

## 7. Tech-Stack & Struktur

- **React 18 + TypeScript + Vite** (schnelles Dev-Setup, Typsicherheit)
- **D3.js** für Kompass, Vektoren, Pfeilspitzen, Bogen und Drag-Interaktion

```
src/
  main.tsx
  App.tsx
  lib/
    windMath.ts        # reine Berechnung (Formeln)
    geometry.ts        # Vektor-/Koordinaten-Helfer
  components/
    Controls.tsx       # Eingaben (Slider + Zahlenfeld)
    WindTriangle.tsx   # D3-Kompass + Winddreieck (1/2/3 Pfeilspitzen)
    CrosswindDiagram.tsx # D3-Zerlegung Gegen-/Seitenwind
    Results.tsx        # Ergebnisse + Formeln
```

---

## 8. Annahmen

- Einheiten: **Knoten (kt)** und **Grad (°)**, alles **rechtweisend** (True).
- Windrichtung = Richtung, **aus** der es weht (meteorologische Konvention).
- Gegen-/Seitenwind werden relativ zum **rwK** berechnet.
- Kein Höhen-/Temperatureinfluss (TAS wird als gegeben angenommen).
