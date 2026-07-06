# wind-triangle-trainer

Interactive tool for exploring the **wind triangle** (Winddreieck) in aviation.
Enter TAS, true course (rwK), wind direction and wind speed and the app draws the
vectors, the wind correction angle (Vorhaltewinkel), and the head-/crosswind
decomposition — computed live via trigonometry. The UI is in German.

> ⚠️ For flight-simulator use only (e.g. MSFS), not for real-world navigation. No warranty for correctness.

## Tech stack

React 18 · TypeScript · [Vite](https://vitejs.dev/) 5 · [D3.js](https://d3js.org/)

## Prerequisites

- **Node.js ≥ 18** (developed and tested on Node 24)
- **npm** (ships with Node)

Check your versions:

```bash
node --version
npm --version
```

## Install

Install the dependencies once after cloning:

```bash
npm install
```

## Run in development

Start the Vite dev server with hot-module reloading:

```bash
npm run dev
```

Then open the printed URL (default: **http://localhost:5173/**).

## Build for production

Type-check with `tsc` and bundle with Vite:

```bash
npm run build
```

The optimized, static site is written to the **`dist/`** folder.

## Serve the production build

Preview the built site locally with Vite:

```bash
npm run preview
```

This serves `dist/` (default: **http://localhost:4173/**).

For real hosting, `dist/` is a plain static bundle — serve it with any static
web server or CDN, for example:

```bash
npx serve dist
```

## Available scripts

| Command           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `npm run dev`     | Start the dev server (hot reload).                                 |
| `npm run build`   | Type-check + build the production bundle into `dist/`.             |
| `npm run preview` | Serve the production build locally.                                |

> The `predev` / `prebuild` hooks automatically run `scripts/generate-licenses.mjs`,
> which generates `public/licenses.html` (the third-party license list shown in the
> app's "Open-Source-Lizenzen" dialog). It is regenerated on every `dev`/`build`.

## Project structure

```
src/
  App.tsx                  # layout + state
  lib/
    windMath.ts            # wind-triangle math (pure functions)
    geometry.ts            # 2D vector / bearing helpers
  components/
    Controls.tsx           # inputs (sliders + number fields)
    WindTriangle.tsx       # D3 compass + wind triangle
    CrosswindDiagram.tsx   # D3 head-/crosswind decomposition
    Results.tsx            # results + formulas
    Modal.tsx, DisclaimerModal.tsx, LicensesDialog.tsx
scripts/
  generate-licenses.mjs    # builds public/licenses.html
```

