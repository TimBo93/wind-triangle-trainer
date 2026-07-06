import type { WindInput } from '../lib/windMath'

interface Props {
  value: WindInput
  onChange: (next: WindInput) => void
}

interface FieldProps {
  label: string
  hint: string
  unit: string
  min: number
  max: number
  value: number
  accent: string
  onChange: (v: number) => void
}

function Field({ label, hint, unit, min, max, value, accent, onChange }: FieldProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min))
  return (
    <div className="field">
      <div className="field-head">
        <label>
          <span className="dot" style={{ background: accent }} />
          {label} <span className="field-hint">{hint}</span>
        </label>
        <div className="field-value">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
          />
          <span className="unit">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        style={{ accentColor: accent }}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
      />
    </div>
  )
}

export default function Controls({ value, onChange }: Props) {
  const set = (patch: Partial<WindInput>) => onChange({ ...value, ...patch })

  return (
    <div className="panel controls">
      <h2>Eingaben</h2>
      <Field
        label="TAS"
        hint="Eigengeschwindigkeit"
        unit="kt"
        min={0}
        max={300}
        value={value.tas}
        accent="#3b82f6"
        onChange={(tas) => set({ tas })}
      />
      <Field
        label="rwK"
        hint="rechtw. Kurs"
        unit="°"
        min={0}
        max={359}
        value={value.course}
        accent="#22c55e"
        onChange={(course) => set({ course })}
      />
      <Field
        label="Windrichtung"
        hint="aus"
        unit="°"
        min={0}
        max={359}
        value={value.windDir}
        accent="#a855f7"
        onChange={(windDir) => set({ windDir })}
      />
      <Field
        label="Windstärke"
        hint="Wind"
        unit="kt"
        min={0}
        max={120}
        value={value.windSpeed}
        accent="#a855f7"
        onChange={(windSpeed) => set({ windSpeed })}
      />
      <p className="tip">
        Tipp: Den violetten <strong>W</strong>-Griff am Kompass ziehen, um die
        Windrichtung direkt einzustellen.
      </p>
    </div>
  )
}
