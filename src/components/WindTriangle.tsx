import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { WindInput, WindResult } from '../lib/windMath'
import {
  add,
  sub,
  scale,
  len,
  normalize,
  perp,
  bearingToScreen,
  screenToBearing,
} from '../lib/geometry'
import type { Pt } from '../lib/geometry'

interface Props {
  input: WindInput
  result: WindResult
  onWindDirChange: (dir: number) => void
}

const COLORS = {
  air: '#3b82f6', // Luftvektor (1 Spitze)
  ground: '#22c55e', // Grundvektor (2 Spitzen)
  wind: '#a855f7', // Windvektor (3 Spitzen)
  ring: '#334155',
  ringText: '#94a3b8',
  guide: '#475569',
  drift: '#f472b6',
  angle: '#fbbf24',
  point: '#e2e8f0',
}

const SIZE = 560
const R = 250

export default function WindTriangle({ input, result, onWindDirChange }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svgEl = ref.current
    if (!svgEl) return
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const C: Pt = { x: SIZE / 2, y: SIZE / 2 }
    const { tas, course, windDir, windSpeed } = input
    const gs = result.solvable ? result.groundSpeed : tas
    const heading = result.solvable ? result.heading : course

    const maxMag = Math.max(tas, windSpeed, Number.isFinite(gs) ? gs : 0, 1)
    const s = (R * 0.8) / maxMag

    const root = svg.append('g')

    // --- Zeichenhelfer -----------------------------------------------------
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

    const label = (
      p: Pt,
      text: string,
      color: string,
      size = 14,
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
        .text(text)

    // Pfeilspitzen-Konvention: 1 = Luft, 2 = Grund, 3 = Wind
    const drawArrowheads = (tail: Pt, head: Pt, count: number, color: string) => {
      const seg = sub(head, tail)
      const L = len(seg)
      if (L < 3) return
      const dir = normalize(seg)
      const nrm = perp(dir)
      const size = Math.min(15, L / (count + 0.6))
      const halfW = size * 0.42
      const spacing = size * 0.9
      const center = add(tail, scale(dir, L * 0.58))
      for (let i = 0; i < count; i++) {
        const c = add(center, scale(dir, (i - (count - 1) / 2) * spacing))
        const tip = add(c, scale(dir, size / 2))
        const back = sub(c, scale(dir, size / 2))
        const bL = add(back, scale(nrm, halfW))
        const bR = sub(back, scale(nrm, halfW))
        root
          .append('path')
          .attr('d', `M${tip.x},${tip.y} L${bL.x},${bL.y} L${bR.x},${bR.y} Z`)
          .attr('fill', color)
      }
    }

    // --- Kompassrose -------------------------------------------------------
    root
      .append('circle')
      .attr('cx', C.x)
      .attr('cy', C.y)
      .attr('r', R)
      .attr('fill', 'none')
      .attr('stroke', COLORS.ring)
      .attr('stroke-width', 1.5)

    for (let deg = 0; deg < 360; deg += 10) {
      const dir = bearingToScreen(deg)
      const major = deg % 30 === 0
      const p1 = add(C, scale(dir, R))
      const p2 = add(C, scale(dir, R - (major ? 14 : 8)))
      line(p1, p2, COLORS.ring, major ? 1.5 : 0.75)
      if (major) {
        const lp = add(C, scale(dir, R - 30))
        const t =
          deg === 0
            ? 'N'
            : deg === 90
              ? 'O'
              : deg === 180
                ? 'S'
                : deg === 270
                  ? 'W'
                  : String(deg)
        label(lp, t, COLORS.ringText, deg % 90 === 0 ? 15 : 11, deg % 90 === 0 ? 700 : 500)
      }
    }

    // --- Kurs-Hilfslinie (gestrichelt) ------------------------------------
    const cdir = bearingToScreen(course)
    line(sub(C, scale(cdir, R)), add(C, scale(cdir, R)), COLORS.guide, 1, '4 6')

    // --- Vektoren des Winddreiecks ----------------------------------------
    const O = C
    const airDir = bearingToScreen(heading)
    const groundDir = bearingToScreen(course)
    const P = add(O, scale(airDir, tas * s)) // Kopf Luftvektor
    const Q = add(O, scale(groundDir, gs * s)) // Kopf Grundvektor (= P + Wind)

    // Linien
    line(O, Q, COLORS.ground, 3) // Grundvektor
    line(O, P, COLORS.air, 3) // Luftvektor
    if (windSpeed > 0) line(P, Q, COLORS.wind, 3) // Windvektor

    // Pfeilspitzen (1 / 2 / 3)
    drawArrowheads(O, P, 1, COLORS.air)
    drawArrowheads(O, Q, 2, COLORS.ground)
    if (windSpeed > 0) drawArrowheads(P, Q, 3, COLORS.wind)

    // --- Vorhaltewinkel-Bogen ---------------------------------------------
    if (result.solvable && Math.abs(result.wca) > 0.3) {
      const rr = 52
      const a1 = add(O, scale(groundDir, rr))
      const a2 = add(O, scale(airDir, rr))
      const sweep = result.wca >= 0 ? 1 : 0
      root
        .append('path')
        .attr('d', `M${a1.x},${a1.y} A${rr},${rr} 0 0 ${sweep} ${a2.x},${a2.y}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS.drift)
        .attr('stroke-width', 2)
      const bis = normalize(add(groundDir, airDir))
      const lp = add(O, scale(bis, rr + 18))
      label(lp, `Drift ${result.wca >= 0 ? '+' : ''}${result.wca.toFixed(1)}°`, COLORS.drift, 13, 700)
    }

    // --- Vektor-Beschriftungen --------------------------------------------
    const along = (a: Pt, b: Pt, frac: number, d: number): Pt => {
      const pt = add(a, scale(sub(b, a), frac))
      const n = perp(normalize(sub(b, a)))
      return add(pt, scale(n, d))
    }
    label(along(O, P, 0.5, -30), 'rwSK · TAS', COLORS.air, 13, 700)
    label(along(O, Q, 0.5, result.wca >= 0 ? -30 : 30), 'rwK · GS', COLORS.ground, 13, 700)
    if (windSpeed > 4) {
      const midPQ = scale(add(P, Q), 0.5)
      const inward = normalize(sub(O, midPQ))
      label(add(midPQ, scale(inward, 24)), 'Wind', COLORS.wind, 13, 700)
    }

    // --- Punkte A / B + Marker --------------------------------------------
    const dot = (p: Pt, color: string) =>
      root
        .append('circle')
        .attr('cx', p.x)
        .attr('cy', p.y)
        .attr('r', 4)
        .attr('fill', color)
    dot(O, COLORS.point)
    dot(Q, COLORS.point)
    dot(P, COLORS.air)
    label(add(O, { x: -14, y: 16 }), 'A', COLORS.point, 15, 700)
    label(add(Q, scale(perp(groundDir), 16)), 'B', COLORS.point, 15, 700)

    // --- Winkel zwischen Wind und rwK·GS (am Punkt B) --------------------
    if (windSpeed > 0) {
      const dQO = normalize(sub(O, Q)) // entlang Grundvektor (Richtung A)
      const dQP = normalize(sub(P, Q)) // entlang Windvektor (Richtung P)
      const rr = 24
      const a1 = Math.atan2(dQO.y, dQO.x)
      const a2 = Math.atan2(dQP.y, dQP.x)
      let delta = a2 - a1
      while (delta > Math.PI) delta -= 2 * Math.PI
      while (delta < -Math.PI) delta += 2 * Math.PI
      let d = ''
      const steps = 28
      for (let i = 0; i <= steps; i++) {
        const a = a1 + (delta * i) / steps
        d += `${i === 0 ? 'M' : 'L'}${(Q.x + rr * Math.cos(a)).toFixed(2)},${(Q.y + rr * Math.sin(a)).toFixed(2)}`
      }
      root.append('path').attr('d', d).attr('fill', 'none').attr('stroke', COLORS.angle).attr('stroke-width', 1.5)
      const midA = a1 + delta / 2
      label(
        add(Q, { x: (rr + 15) * Math.cos(midA), y: (rr + 15) * Math.sin(midA) }),
        `${Math.abs((delta * 180) / Math.PI).toFixed(0)}°`,
        COLORS.angle,
        12,
        700,
      )
    }

    // --- Wind-Griff am Kompass (Drag = Windrichtung) ----------------------
    const hdir = bearingToScreen(windDir)
    const H = add(C, scale(hdir, R))
    const inward = scale(hdir, -1)
    const aTip = add(H, scale(inward, 26))
    const aN = perp(inward)
    const handle = root.append('g').style('cursor', 'grab')

    // unsichtbare, großzügige Trefferfläche
    handle
      .append('circle')
      .attr('cx', H.x)
      .attr('cy', H.y)
      .attr('r', 22)
      .attr('fill', 'transparent')

    // Pfeil nach innen deutet die Wehrichtung an
    handle
      .append('line')
      .attr('x1', H.x)
      .attr('y1', H.y)
      .attr('x2', aTip.x)
      .attr('y2', aTip.y)
      .attr('stroke', COLORS.wind)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
    handle
      .append('path')
      .attr(
        'd',
        `M${add(aTip, scale(aN, 6)).x},${add(aTip, scale(aN, 6)).y} ` +
          `L${add(aTip, scale(inward, 10)).x},${add(aTip, scale(inward, 10)).y} ` +
          `L${sub(aTip, scale(aN, 6)).x},${sub(aTip, scale(aN, 6)).y} Z`,
      )
      .attr('fill', COLORS.wind)
    handle
      .append('circle')
      .attr('cx', H.x)
      .attr('cy', H.y)
      .attr('r', 11)
      .attr('fill', COLORS.wind)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
    handle
      .append('text')
      .attr('x', H.x)
      .attr('y', H.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .style('pointer-events', 'none')
      .text('W')

    const drag = d3
      .drag<SVGGElement, unknown>()
      .container(svgEl)
      .on('start', function () {
        d3.select(this).style('cursor', 'grabbing')
      })
      .on('drag', (event) => {
        const b = screenToBearing(event.x - C.x, event.y - C.y)
        onWindDirChange(Math.round(b))
      })
      .on('end', function () {
        d3.select(this).style('cursor', 'grab')
      })
    handle.call(drag)
  }, [input, result, onWindDirChange])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="triangle-svg"
      role="img"
      aria-label="Winddreieck mit Kompass, Luft-, Grund- und Windvektor"
    />
  )
}
