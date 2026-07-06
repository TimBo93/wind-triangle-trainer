import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { WindResult } from '../lib/windMath'
import { add, sub, scale, normalize, perp } from '../lib/geometry'
import type { Pt } from '../lib/geometry'

interface Props {
  result: WindResult
}

const COLORS = {
  axis: '#22c55e',
  wind: '#a855f7',
  head: '#ef4444',
  cross: '#38bdf8',
  text: '#cbd5e1',
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

    const O: Pt = { x: 170, y: H / 2 }
    const { headwind, crosswind } = result
    const mag = Math.hypot(headwind, crosswind)
    const s = mag > 0.01 ? 92 / mag : 0

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

    // Flugrichtung (Kurs) = horizontal nach rechts
    const fwd: Pt = { x: 1, y: 0 }
    const flightLen = 150
    const flightTip = add(O, scale(fwd, flightLen))
    line(O, flightTip, COLORS.axis, 2, '5 6')
    arrowhead(flightTip, fwd, COLORS.axis)
    text(add(flightTip, { x: 0, y: -14 }), 'Flugrichtung (rwK)', COLORS.axis, 12, 700, 'end')

    if (mag < 0.05) {
      text(add(O, { x: flightLen / 2, y: 26 }), 'Kein Wind', COLORS.muted, 14, 600)
      return
    }

    // Windvektor (Wehrichtung) in Bildschirmkoordinaten (Flug = nach rechts):
    //   x = -headwind  (Gegenwind zeigt nach hinten / links)
    //   y = -crosswind (Wind von rechts drückt nach links = nach oben)
    const wind: Pt = { x: -headwind * s, y: -crosswind * s }
    const windEnd = add(O, wind)

    // Rechtwinkel-Zerlegung
    const headEnd: Pt = { x: O.x - headwind * s, y: O.y } // entlang Kurs (horizontal)
    line(O, headEnd, COLORS.head, 3) // Gegen-/Rückenwind
    line(headEnd, windEnd, COLORS.cross, 3) // Seitenwind

    // Windresultierende
    line(O, windEnd, COLORS.wind, 2, '3 4')
    arrowhead(windEnd, normalize(wind), COLORS.wind, 11)

    // Pfeilspitzen an den Komponenten
    if (Math.abs(headwind) > 0.3)
      arrowhead(headEnd, { x: -Math.sign(headwind), y: 0 }, COLORS.head, 11)
    if (Math.abs(crosswind) > 0.3)
      arrowhead(windEnd, { x: 0, y: -Math.sign(crosswind) }, COLORS.cross, 11)

    // Rechtwinkel-Markierung an der Ecke (headEnd)
    if (Math.abs(headwind) > 0.5 && Math.abs(crosswind) > 0.5) {
      const q = 12
      const sx = Math.sign(headwind) // horizontal Richtung O
      const sy = -Math.sign(crosswind) // vertikal Richtung windEnd
      const c1 = { x: headEnd.x + sx * q, y: headEnd.y }
      const c2 = { x: headEnd.x + sx * q, y: headEnd.y + sy * q }
      const c3 = { x: headEnd.x, y: headEnd.y + sy * q }
      line(c1, c2, COLORS.muted, 1)
      line(c2, c3, COLORS.muted, 1)
    }

    // Beschriftungen
    const headLabel = result.headwindKind === 'Rückenwind' ? 'Rückenwind' : 'Gegenwind'
    if (Math.abs(headwind) > 0.3)
      text(
        { x: (O.x + headEnd.x) / 2, y: O.y + 18 },
        `${headLabel} ${Math.abs(headwind).toFixed(1)} kt`,
        COLORS.head,
        12,
        700,
      )
    if (Math.abs(crosswind) > 0.3) {
      const fromRight = windEnd.y <= O.y // Pfeil zeigt nach oben
      text(
        { x: windEnd.x, y: windEnd.y + (fromRight ? -14 : 16) },
        `Seitenwind ${Math.abs(crosswind).toFixed(1)} kt`,
        COLORS.cross,
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
      aria-label="Zerlegung des Windes in Gegen- und Seitenwind"
    />
  )
}
