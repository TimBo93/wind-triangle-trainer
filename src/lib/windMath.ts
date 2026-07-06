// Reine Berechnung des Winddreiecks – keine UI-Abhängigkeiten.

export interface WindInput {
  /** True Airspeed [kt] */
  tas: number
  /** Rechtweisender Kurs / gewünschter Kurs über Grund [°] */
  course: number
  /** Windrichtung [°] – Richtung, AUS der der Wind weht */
  windDir: number
  /** Windstärke [kt] */
  windSpeed: number
}

export type Side = 'links' | 'rechts' | 'kein'
export type HeadKind = 'Gegenwind' | 'Rückenwind' | 'kein'

export interface WindResult {
  /** Vorhaltewinkel [°], + = nach rechts vorhalten */
  wca: number
  /** Steuerkurs rwSK [°] */
  heading: number
  /** Geschwindigkeit über Grund [kt] */
  groundSpeed: number
  /** Gegen-/Rückenwindkomponente [kt], + = Gegenwind */
  headwind: number
  /** Seitenwindkomponente [kt], + = von rechts */
  crosswind: number
  /** Windwinkel relativ zum Kurs β = windDir - course, normiert auf -180..180 */
  windAngle: number
  crosswindSide: Side
  headwindKind: HeadKind
  /** false, wenn kein Steuerkurs möglich ist (Seitenwind > TAS) */
  solvable: boolean
}

export const toRad = (deg: number): number => (deg * Math.PI) / 180
export const toDeg = (rad: number): number => (rad * 180) / Math.PI

/** Normiert einen Winkel auf [0, 360). */
export const norm360 = (a: number): number => ((a % 360) + 360) % 360

/** Normiert einen Winkel auf (-180, 180]. */
export const norm180 = (a: number): number => {
  const x = norm360(a)
  return x > 180 ? x - 360 : x
}

export function solveWindTriangle(input: WindInput): WindResult {
  const { tas, course, windDir, windSpeed } = input

  // Windwinkel relativ zum Kurs
  const beta = norm180(windDir - course)
  const betaRad = toRad(beta)

  // Vorhaltewinkel über die Sinus-Beziehung
  const sinWca = tas > 0 ? (windSpeed / tas) * Math.sin(betaRad) : 0
  const solvable = tas > 0 && Math.abs(sinWca) <= 1

  const wca = solvable ? toDeg(Math.asin(sinWca)) : NaN
  const heading = solvable ? norm360(course + wca) : NaN
  const groundSpeed = solvable
    ? tas * Math.cos(toRad(wca)) - windSpeed * Math.cos(betaRad)
    : NaN

  // Wind-Komponenten (immer definiert)
  const headwind = windSpeed * Math.cos(betaRad)
  const crosswind = windSpeed * Math.sin(betaRad)

  const crosswindSide: Side =
    crosswind > 0.05 ? 'rechts' : crosswind < -0.05 ? 'links' : 'kein'
  const headwindKind: HeadKind =
    headwind > 0.05 ? 'Gegenwind' : headwind < -0.05 ? 'Rückenwind' : 'kein'

  return {
    wca,
    heading,
    groundSpeed,
    headwind,
    crosswind,
    windAngle: beta,
    crosswindSide,
    headwindKind,
    solvable,
  }
}
