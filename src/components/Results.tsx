import type { WindInput, WindResult } from '../lib/windMath'

interface Props {
  input: WindInput
  result: WindResult
}

const fmt = (v: number, digits = 1): string =>
  Number.isFinite(v) ? v.toFixed(digits) : '—'

const deg = (v: number): string => (Number.isFinite(v) ? `${Math.round(v)}°` : '—')

export default function Results({ input, result }: Props) {
  const { tas, course, windDir, windSpeed } = input
  const beta = result.windAngle
  const cosB = Math.cos((beta * Math.PI) / 180)
  const sinB = Math.sin((beta * Math.PI) / 180)

  const sideText =
    result.crosswindSide === 'kein'
      ? ''
      : `von ${result.crosswindSide}`
  const headText = result.headwindKind === 'kein' ? 'neutral' : result.headwindKind

  return (
    <div className="panel results">
      <h2>Ergebnisse</h2>

      {!result.solvable && (
        <div className="warn">
          Kein Steuerkurs möglich: Der Seitenwind ist größer als die TAS
          (W·|sin β| &gt; TAS). Der gewünschte Kurs kann nicht gehalten werden.
        </div>
      )}

      <div className="result-grid">
        <div className="result-card" style={{ borderColor: '#f59e0b' }}>
          <span className="rc-label">Vorhaltewinkel (WCA)</span>
          <span className="rc-value">
            {result.solvable
              ? `${result.wca >= 0 ? '+' : ''}${fmt(result.wca)}°`
              : '—'}
          </span>
          <span className="rc-sub">
            {result.solvable
              ? result.wca >= 0
                ? 'nach rechts vorhalten'
                : 'nach links vorhalten'
              : ''}
          </span>
        </div>

        <div className="result-card" style={{ borderColor: '#3b82f6' }}>
          <span className="rc-label">Steuerkurs (rwSK)</span>
          <span className="rc-value">{deg(result.heading)}</span>
          <span className="rc-sub">rwK + WCA</span>
        </div>

        <div className="result-card" style={{ borderColor: '#22c55e' }}>
          <span className="rc-label">Ground Speed (GS)</span>
          <span className="rc-value">{fmt(result.groundSpeed, 0)} kt</span>
          <span className="rc-sub">über Grund</span>
        </div>

        <div className="result-card" style={{ borderColor: '#ef4444' }}>
          <span className="rc-label">{headText}</span>
          <span className="rc-value">{fmt(Math.abs(result.headwind))} kt</span>
          <span className="rc-sub">längs zum Kurs</span>
        </div>

        <div className="result-card" style={{ borderColor: '#38bdf8' }}>
          <span className="rc-label">Seitenwind</span>
          <span className="rc-value">{fmt(Math.abs(result.crosswind))} kt</span>
          <span className="rc-sub">{sideText || 'quer zum Kurs'}</span>
        </div>

        <div className="result-card" style={{ borderColor: '#64748b' }}>
          <span className="rc-label">Windwinkel β</span>
          <span className="rc-value">{fmt(beta, 0)}°</span>
          <span className="rc-sub">Windrichtung − rwK</span>
        </div>
      </div>

      <h3>Rechenweg (Trigonometrie)</h3>
      <div className="formulas">
        <div className="formula">
          <span className="f-name">β</span>= dd − rwK = {windDir}° − {course}° ={' '}
          <b>{fmt(beta, 0)}°</b>
        </div>
        <div className="formula">
          <span className="f-name">WCA</span>= arcsin( (W / TAS) · sin β ) = arcsin( ({windSpeed} /{' '}
          {tas}) · {fmt(sinB, 3)} ) ={' '}
          <b>{result.solvable ? `${fmt(result.wca)}°` : 'n. lösbar'}</b>
        </div>
        <div className="formula">
          <span className="f-name">GS</span>= TAS·cos(WCA) − W·cos β ={' '}
          {result.solvable
            ? `${tas}·${fmt(Math.cos((result.wca * Math.PI) / 180), 3)} − ${windSpeed}·${fmt(cosB, 3)}`
            : '—'}{' '}
          = <b>{fmt(result.groundSpeed, 0)} kt</b>
        </div>
        <div className="formula">
          <span className="f-name" style={{ color: '#ef4444' }}>
            HWC
          </span>
          = W · cos β = {windSpeed} · {fmt(cosB, 3)} = <b>{fmt(result.headwind)} kt</b>
        </div>
        <div className="formula">
          <span className="f-name" style={{ color: '#38bdf8' }}>
            XWC
          </span>
          = W · sin β = {windSpeed} · {fmt(sinB, 3)} = <b>{fmt(result.crosswind)} kt</b>
        </div>
      </div>
      <p className="legend-note">
        Vorzeichen: HWC &gt; 0 = Gegenwind, &lt; 0 = Rückenwind · XWC &gt; 0 = von
        rechts, &lt; 0 = von links.
      </p>
    </div>
  )
}
