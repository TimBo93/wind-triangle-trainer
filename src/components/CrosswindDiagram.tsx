import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { WindResult } from '../lib/windMath'
import { add, sub, scale, normalize, perp } from '../lib/geometry'
import type { Pt } from '../lib/geometry'

interface Props {
  result: WindResult
}

// Farben konsistent zum Kompass
const COLORS = {
  ground: '#22c55e', // rwK · GS (Grund-/Kursvektor)
  wind: '#a855f7', // Windvektor
  head: '#ef4444', // Gegen-/Rückenwind
  cross: '#38bdf8', // Seitenwind
  angle: '#fbbf24', // Winkel Wind ↔ rwK·GS
  point: '#e2e8f0',
  muted: '#64748b',
}

const W = 420
const H = 230

export default function CrosswindDiagram({ result }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svgEl = ref.current
    if (!svgEl) return
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    const root = svg.append('g')

    const A: Pt = { x: 165, y: H / 2 }

    // Zerlegung relativ zum Kurs über Grund (rwK) – wie in der Literatur.
    // Werte identisch zur Ergebnis-Tabelle (β = Windrichtung − rwK).
    const headwind = result.headwind // + = Gegenwind (entgegen rwK)
    const crosswind = result.crosswind // + = von rechts (bzgl. rwK)
    const wMag = Math.hypot(headwind, crosswind)
    const gs = result.solvable && result.groundSpeed > 0 ? result.groundSpeed : Math.max(wMag, 1)

    // Gemeinsamer Maßstab (px/kt) für rwK·GS UND Wind → die Größenverhältnisse stimmen.
    const rightNeeded = Math.max(gs, -headwind, 1) // rwK·GS bzw. Rückenwind (nach rechts)
    const leftNeeded = Math.max(headwind, 1) // Gegenwind (nach links)
    const vertNeeded = Math.max(Math.abs(crosswind), 1)
    const s = Math.min(235 / rightNeeded, 145 / leftNeeded, 90 / vertNeeded)

    const line = (a: Pt, b: Pt, color: string, width: number, dash?: string) => {
      const l = root
        .append('line')
        .attr('x1', a.x)
        .attr('y1', a.y)
        .attr('x2', b.x)
        .attr('y2', b.y)
        .attr('stroke', color)
        .attr('stroke-width', width)
        .attr('stroke-linecap', 'round')
      if (dash) l.attr('stroke-dasharray', dash)
      return l
    }

    const text = (
      p: Pt,
      t: string,
      color: string,
      size = 12,
      weight = 600,
      anchor: 'start' | 'middle' | 'end' = 'middle',
    ) =>
      root
        .append('text')
        .attr('x', p.x)
        .attr('y', p.y)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'central')
        .attr('fill', color)
        .attr('font-size', size)
        .attr('font-weight', weight)
        .text(t)

    const arrowhead = (tip: Pt, dir: Pt, color: string, size = 12) => {
      const n = perp(dir)
      const back = sub(tip, scale(dir, size))
      const bL = add(back, scale(n, size * 0.42))
      const bR = sub(back, scale(n, size * 0.42))
      root
        .append('path')
        .attr('d', `M${tip.x},${tip.y} L${bL.x},${bL.y} L${bR.x},${bR.y} Z`)
        .attr('fill', color)
    }

    // rwK · GS als x-Achse (Grundvektor), Länge ∝ GS – gleicher Maßstab wie der Wind
    const axisDir: Pt = { x: 1, y: 0 }
    const axisTip = add(A, scale(axisDir, gs * s))
    line(A, axisTip, COLORS.ground, 2.5)
    arrowhead(axisTip, axisDir, COLORS.ground)
    text(add(axisTip, { x: 0, y: -14 }), 'rwK · GS', COLORS.ground, 12, 700, 'end')

    // Ursprung A
    root.append('circle').attr('cx', A.x).attr('cy', A.y).attr('r', 4).attr('fill', COLORS.point)
    text(add(A, { x: 0, y: -15 }), 'A', COLORS.point, 13, 700)

    if (wMag < 0.05) {
      text(add(A, { x: 92, y: 26 }), 'Kein Wind', COLORS.muted, 14, 600)
      return
    }

    // Windvektor von A und seine Komponenten (bzgl. rwK):
    //   x = -headwind  (Gegenwind zeigt entgegen rwK / nach links)
    //   y = -crosswind (Wind von rechts → nach oben)
    const wind: Pt = { x: -headwind * s, y: -crosswind * s }
    const windEnd = add(A, wind)
    const headEnd: Pt = { x: A.x - headwind * s, y: A.y }

    // Komponenten
    line(A, headEnd, COLORS.head, 3) // Gegen-/Rückenwind (auf der x-Achse)
    line(headEnd, windEnd, COLORS.cross, 3) // Seitenwind (auf der y-Achse)
    if (Math.abs(headwind) > 0.3)
      arrowhead(headEnd, { x: -Math.sign(headwind), y: 0 }, COLORS.head, 10)
    if (Math.abs(crosswind) > 0.3)
      arrowhead(windEnd, { x: 0, y: -Math.sign(crosswind) }, COLORS.cross, 10)

    // Windvektor (Hypotenuse) von A
    line(A, windEnd, COLORS.wind, 2.5)
    arrowhead(windEnd, normalize(wind), COLORS.wind, 11)

    // Rechtwinkel-Markierung an der Ecke (headEnd)
    if (Math.abs(headwind) > 0.6 && Math.abs(crosswind) > 0.6) {
      const q = 11
      const sx = Math.sign(headwind)
      const sy = -Math.sign(crosswind)
      const c1 = { x: headEnd.x + sx * q, y: headEnd.y }
      const c2 = { x: headEnd.x + sx * q, y: headEnd.y + sy * q }
      const c3 = { x: headEnd.x, y: headEnd.y + sy * q }
      line(c1, c2, COLORS.muted, 1)
      line(c2, c3, COLORS.muted, 1)
    }

    // Beschriftungen
    const headLabel = headwind >= 0 ? 'Gegenwind' : 'Rückenwind'
    if (Math.abs(headwind) > 0.3)
      text(
        { x: (A.x + headEnd.x) / 2, y: A.y + 18 },
        `${headLabel} ${Math.abs(headwind).toFixed(1)} kt`,
        COLORS.head,
        12,
        700,
      )
    if (Math.abs(crosswind) > 0.3) {
      const fromRight = windEnd.y <= A.y
      text(
        { x: windEnd.x, y: windEnd.y + (fromRight ? -14 : 16) },
        `Seitenwind ${Math.abs(crosswind).toFixed(1)} kt`,
        COLORS.cross,
        12,
        700,
      )
    }
    const wMid = scale(add(A, windEnd), 0.5)
    const wOut = normalize(sub(wMid, headEnd))
    text(add(wMid, scale(wOut, 16)), 'Wind', COLORS.wind, 12, 700)

    // Winkel zwischen Wind und rwK·GS (am Punkt A)
    {
      const wdir = normalize(wind)
      const rr = 34
      const a1 = 0 // rwK·GS zeigt nach +x
      const a2 = Math.atan2(wdir.y, wdir.x)
      let delta = a2 - a1
      while (delta > Math.PI) delta -= 2 * Math.PI
      while (delta < -Math.PI) delta += 2 * Math.PI
      let d = ''
      const steps = 28
      for (let i = 0; i <= steps; i++) {
        const a = a1 + (delta * i) / steps
        d += `${i === 0 ? 'M' : 'L'}${(A.x + rr * Math.cos(a)).toFixed(2)},${(A.y + rr * Math.sin(a)).toFixed(2)}`
      }
      root.append('path').attr('d', d).attr('fill', 'none').attr('stroke', COLORS.angle).attr('stroke-width', 1.5)
      const midA = a1 + delta / 2
      text(
        { x: A.x + (rr + 16) * Math.cos(midA), y: A.y + (rr + 16) * Math.sin(midA) },
        `${Math.abs((delta * 180) / Math.PI).toFixed(0)}°`,
        COLORS.angle,
        12,
        700,
      )
    }
  }, [result])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="crosswind-svg"
      role="img"
      aria-label="Windvektor relativ zum Kurs über Grund (rwK) mit Gegen-/Rückenwind und Seitenwind"
    />
  )
}
