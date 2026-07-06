// Kleine 2D-Vektor-Helfer und Kurs-zu-Bildschirm-Umrechnung.
// Bildschirm: x nach rechts, y nach UNTEN (SVG). Norden = oben.

export interface Pt {
  x: number
  y: number
}

export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Pt, s: number): Pt => ({ x: a.x * s, y: a.y * s })
export const len = (a: Pt): number => Math.hypot(a.x, a.y)

export const normalize = (a: Pt): Pt => {
  const l = len(a)
  return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l }
}

/** 90°-Drehung (im Bildschirmsinn). */
export const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x })

/**
 * Kurs (°, im Uhrzeigersinn ab Nord) → Einheitsvektor im Bildschirm.
 * Nord (0°) zeigt nach oben, Ost (90°) nach rechts.
 */
export const bearingToScreen = (bearingDeg: number): Pt => {
  const r = (bearingDeg * Math.PI) / 180
  return { x: Math.sin(r), y: -Math.cos(r) }
}

/** Bildschirm-Richtungsvektor (relativ zum Zentrum) → Kurs (°, 0..360). */
export const screenToBearing = (dx: number, dy: number): number => {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI
  return ((deg % 360) + 360) % 360
}
