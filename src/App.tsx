import { useMemo, useState } from 'react'
import Controls from './components/Controls'
import WindTriangle from './components/WindTriangle'
import CrosswindDiagram from './components/CrosswindDiagram'
import Results from './components/Results'
import DisclaimerModal from './components/DisclaimerModal'
import LicensesDialog from './components/LicensesDialog'
import { solveWindTriangle, norm360 } from './lib/windMath'
import type { WindInput } from './lib/windMath'
import './App.css'

export default function App() {
  const [accepted, setAccepted] = useState(false)
  const [showLicenses, setShowLicenses] = useState(false)
  const [input, setInput] = useState<WindInput>({
    tas: 110,
    course: 0,
    windDir: 45,
    windSpeed: 20,
  })

  const result = useMemo(() => solveWindTriangle(input), [input])

  const handleWindDir = (dir: number) => setInput((prev) => ({ ...prev, windDir: norm360(dir) }))

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-main">
          <h1>Winddreieck-Trainer</h1>
          <p>
            TAS, Kurs und Wind eingeben – Vorhaltewinkel, Vektoren und die
            Gegen-/Seitenwind-Zerlegung werden live berechnet.
          </p>
        </div>
        <div className="header-actions">
          <a
            className="header-link"
            href="https://bzf.borowski-software.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            BZF Trainer ↗
          </a>
          <button type="button" className="header-btn" onClick={() => setShowLicenses(true)}>
            Open-Source-Lizenzen
          </button>
        </div>
      </header>

      <main className="layout">
        <div className="col-left">
          <Controls value={input} onChange={setInput} />
          <div className="panel legend">
            <h2>Vektoren</h2>
            <ul>
              <li>
                <span className="tick" style={{ color: '#3b82f6' }}>
                  ▶
                </span>
                <span>
                  <b style={{ color: '#3b82f6' }}>1 Pfeilspitze</b> – Luftvektor
                  (rwSK / TH / TAS)
                </span>
              </li>
              <li>
                <span className="tick" style={{ color: '#22c55e' }}>
                  ▶▶
                </span>
                <span>
                  <b style={{ color: '#22c55e' }}>2 Pfeilspitzen</b> – Grundvektor
                  (rwK / TT·TC / GS)
                </span>
              </li>
              <li>
                <span className="tick" style={{ color: '#a855f7' }}>
                  ▶▶▶
                </span>
                <span>
                  <b style={{ color: '#a855f7' }}>3 Pfeilspitzen</b> – Windvektor
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-center">
          <div className="panel viz">
            <WindTriangle input={input} result={result} onWindDirChange={handleWindDir} />
          </div>
          <div className="panel viz-small">
            <h2>Gegen- &amp; Seitenwind</h2>
            <CrosswindDiagram result={result} />
          </div>
        </div>

        <div className="col-right">
          <Results input={input} result={result} />
        </div>
      </main>

      {!accepted && <DisclaimerModal onAccept={() => setAccepted(true)} />}
      {showLicenses && <LicensesDialog onClose={() => setShowLicenses(false)} />}
    </div>
  )
}
