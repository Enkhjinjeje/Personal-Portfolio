'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projects } from '../../content'
import { useField } from '../field/FieldProvider'
import { fitLayout, groupCentre, LAYOUTS, pad, spotCentre, TILE, wrapHalf, type Layout } from './layout'
import { drawLinks, type Pulse } from './links'
import ProjectDetail, { ProjectBurst } from './ProjectDetail'
import StationLine from './StationLine'
import './projects.css'

const STEP = 280      // how far an arrow key moves, css px
const EASE = .14      // how much of the way to its target the canvas moves each frame
const SETTLE = 420    // ms the canvas takes to bring a chosen project to the middle before it opens
const WAVE = .9       // px per ms a pulse from a click on the background travels toward the nearest project

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The projects as an endless canvas to look around: scroll, drag or use the arrow keys, and it repeats in every
// direction. Each tile is the site's screenshot in its own colours, seen through a fine screen of dots like the
// page's background; near the pointer the screen lifts and the site shows sharp. Dotted links run from each project
// to the next, and from the pointer to the nearest project; a click on the background sends a pulse down a link to
// the nearest project. A line of stations along the bottom marks the one in view and travels to any of them.
// Choosing a project brings it to the middle, the dots spin out and it opens there.
export default function ProjectField() {
  const view = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLCanvasElement>(null)
  const [fit, setFit] = useState({ layout: LAYOUTS.wide as Layout, scale: 1, copies: { cols: 2, rows: 2 } })
  // the tiles wait, hidden, for the first fit: the page arrives in the wide layout, and a phone would otherwise see
  // them jump into its own
  const [fitted, setFitted] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const [opening, setOpening] = useState<number | null>(null)
  const [near, setNear] = useState<string | null>(null)
  const [inView, setInView] = useState(0)
  const pan = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, drag: null as null | { x: number, y: number, moved: boolean } })
  const size = useRef({ w: 0, h: 0 })
  const pointer = useRef<{ x: number, y: number } | null>(null)
  const pulses = useRef<Pulse[]>([])
  const started = useRef<Layout | null>(null)
  const dragged = useRef(false)
  const timer = useRef(0)
  const { ripple } = useField()
  const { layout, scale, copies } = fit
  const shown = open ?? opening
  // while a project is open the canvas sits blurred behind it; redrawing it there would only cost frames
  const paused = useRef(false)
  paused.current = open !== null

  // size the pattern and the links canvas to the view
  useEffect(() => {
    const el = view.current!, c = links.current!
    const resize = () => {
      const { width, height } = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2)
      size.current = { w: width, h: height }
      c.width = Math.round(width * dpr); c.height = Math.round(height * dpr)
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
      setFit(fitLayout(width, height))
      setFitted(true)
    }
    resize()
    const sizes = new ResizeObserver(resize)
    sizes.observe(el)
    return () => { sizes.disconnect(); clearTimeout(timer.current) }
  }, [])

  // each frame: the canvas glides toward its target, the plane shifts by the offset modulo one block so it wraps,
  // the links are drawn between the tiles where they now are, and the station of the project nearest the middle lights
  useEffect(() => {
    // held here, not read from the ref each frame: leaving the page clears the ref a frame before this effect stops
    const el = view.current!, sheet = plane.current!, p = pan.current, g = links.current!.getContext('2d')!
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bw = layout.block.w * scale, bh = layout.block.h * scale
    if (started.current !== layout) {
      // start with the whole group of projects in the middle
      started.current = layout
      const [x, y] = groupCentre(layout, scale, size.current.w, size.current.h)
      p.x = p.tx = x; p.y = p.ty = y
    }
    // the links take the text colour, read again when the theme changes rather than every frame
    let ink = getComputedStyle(el).color
    const themes = new MutationObserver(() => { ink = getComputedStyle(el).color })
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let raf = 0, nearKey: string | null = null, viewKey = -1
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (paused.current) return
      if (!p.drag) {
        // a throw keeps gliding and slows down
        if (Math.abs(p.vx) + Math.abs(p.vy) > .1) { p.tx += p.vx; p.ty += p.vy; p.vx *= .92; p.vy *= .92 } else p.vx = p.vy = 0
        const k = motion.matches ? 1 : EASE
        p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k
      }
      const ox = ((p.x % bw) + bw) % bw - bw, oy = ((p.y % bh) + bh) % bh - bh
      sheet.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`

      // the station: whichever project's nearest copy is closest to the middle
      const { w, h } = size.current
      let best = 0, bestD = Infinity
      for (let i = 0; i < layout.spots.length; i++) {
        const [cx, cy] = spotCentre(layout, scale, i)
        const dx = wrapHalf(w / 2 - p.x - cx, bw), dy = wrapHalf(h / 2 - p.y - cy, bh)
        if (dx * dx + dy * dy < bestD) { bestD = dx * dx + dy * dy; best = i }
      }
      if (best !== viewKey) { viewKey = best; setInView(best) }

      const drawn = drawLinks(g, {
        w, h, ink, layout, scale, copies, ox, oy, pan: p, now, pulses: pulses.current,
        flow: motion.matches ? 0 : now / 60, pointer: p.drag ? null : pointer.current,
      })
      if (drawn.near !== nearKey) { nearKey = drawn.near; setNear(drawn.near) }
      // a pulse that reaches its project sends a ring through the background's dots, as a click on the home page does
      if (drawn.arrived.length) {
        const box = el.getBoundingClientRect()
        for (const pl of drawn.arrived) ripple(box.left + pl.tx + p.x, box.top + pl.ty + p.y)
        pulses.current = pulses.current.filter(pl => !drawn.arrived.includes(pl))
      }
    }
    raf = requestAnimationFrame(frame)

    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const k = e.deltaMode === 1 ? 16 : 1
      // a plain wheel moves down; shift or a sideways swipe moves across
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX
      const dy = e.shiftKey && !e.deltaX ? 0 : e.deltaY
      p.tx -= dx * k; p.ty -= dy * k; p.vx = p.vy = 0
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => { cancelAnimationFrame(raf); themes.disconnect(); el.removeEventListener('wheel', wheel) }
  }, [layout, scale, copies, ripple])

  // arrow keys look around; Escape closes an open project before it can take you home
  useEffect(() => {
    const p = pan.current
    const key = (e: KeyboardEvent) => {
      if (shown !== null) {
        if (e.key === 'Escape') { e.preventDefault(); close() }
        return
      }
      const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]
      if (!d || (e.target as Element).closest?.('input, textarea')) return
      e.preventDefault()
      p.vx = p.vy = 0
      p.tx += d[0] * STEP; p.ty += d[1] * STEP
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [shown])

  // dragging: the canvas follows the pointer once it has moved a few px, and keeps the last movement as a throw
  function down(e: React.PointerEvent) {
    if (e.button !== 0) return
    const p = pan.current
    p.drag = { x: e.clientX, y: e.clientY, moved: false }
    p.vx = p.vy = 0
    dragged.current = false
  }
  function move(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') {
      const r = view.current!.getBoundingClientRect()
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const p = pan.current, d = p.drag
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    if (!d.moved) { d.moved = true; (e.currentTarget as Element).setPointerCapture(e.pointerId) }
    p.x += dx; p.y += dy; p.tx = p.x; p.ty = p.y
    p.vx = p.vx * .5 + dx * .5; p.vy = p.vy * .5 + dy * .5
    d.x = e.clientX; d.y = e.clientY
  }
  function up() {
    const p = pan.current
    if (p.drag?.moved) dragged.current = true
    p.drag = null
  }

  // glide so the nearest copy of project i sits in the middle of the view
  function centre(i: number) {
    const p = pan.current, bw = layout.block.w * scale, bh = layout.block.h * scale, [cx, cy] = spotCentre(layout, scale, i)
    const wx = size.current.w / 2 - cx, wy = size.current.h / 2 - cy
    p.vx = p.vy = 0
    p.tx = wx - Math.round((wx - p.x) / bw) * bw
    p.ty = wy - Math.round((wy - p.y) / bh) * bh
  }
  // glide so this very tile, the copy that was clicked, sits in the middle of the view
  function centreTile(tile: Element) {
    const p = pan.current, v = view.current!.getBoundingClientRect(), r = tile.querySelector('.project-tile-pic')!.getBoundingClientRect()
    p.vx = p.vy = 0
    p.tx = p.x + v.left + v.width / 2 - (r.left + r.width / 2)
    p.ty = p.y + v.top + v.height / 2 - (r.top + r.height / 2)
  }

  // bring the clicked tile to the middle, then spin the dots out and open it there
  function choose(tile: Element, i: number) {
    clearTimeout(timer.current)
    centreTile(tile)
    setOpen(null)
    if (reduced()) { setOpen(i); return }
    setOpening(i)
    timer.current = window.setTimeout(() => { setOpening(null); setOpen(i) }, SETTLE)
  }
  function close() {
    clearTimeout(timer.current)
    setOpening(null)
    setOpen(null)
  }

  // a click on the background sends a pulse down a link to the nearest project; nothing moves or opens
  function send(e: React.MouseEvent) {
    if (dragged.current || shown !== null || (e.target as Element).closest('.project-tile')) return
    const p = pan.current, bw = layout.block.w * scale, bh = layout.block.h * scale
    const r = view.current!.getBoundingClientRect(), x = e.clientX - r.left - p.x, y = e.clientY - r.top - p.y
    // the nearest copy of any project, in canvas coordinates
    let best = { x: 0, y: 0, d: Infinity }
    for (let i = 0; i < layout.spots.length; i++) {
      const [cx, cy] = spotCentre(layout, scale, i)
      const tx = cx + Math.round((x - cx) / bw) * bw, ty = cy + Math.round((y - cy) / bh) * bh, d = Math.hypot(tx - x, ty - y)
      if (d < best.d) best = { x: tx, y: ty, d }
    }
    if (reduced()) { ripple(r.left + best.x + p.x, r.top + best.y + p.y); return }
    // stop where the line meets the tile's picture, so the pulse stays in sight
    const dx = x - best.x, dy = y - best.y, k = Math.min(1, TILE.w / 2 * scale / Math.abs(dx || 1e-6), TILE.h / 2 * scale / Math.abs(dy || 1e-6))
    const ex = best.x + dx * k, ey = best.y + dy * k
    pulses.current.push({ x, y, ex, ey, tx: best.x, ty: best.y, start: performance.now(), dur: Math.max(600, Math.hypot(ex - x, ey - y) / WAVE) })
  }

  const tiles = []
  for (let row = 0; row <= copies.rows; row++) for (let col = 0; col <= copies.cols; col++) {
    // only one copy of each project is reachable by keyboard and assistive tech
    const first = row === 1 && col === 1
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i], [x, y] = layout.spots[i], key = `${row}-${col}-${i}`
      tiles.push(<button key={key} type="button" className={`project-tile ${near === key ? 'is-near' : ''}`}
        style={{ left: (col * layout.block.w + x) * scale, top: (row * layout.block.h + y) * scale }}
        tabIndex={first ? 0 : -1} aria-hidden={first ? undefined : true} aria-label={`${p.title}, ${p.kind}`}
        onFocus={first && shown === null ? () => centre(i) : undefined}
        onClick={e => { if (!dragged.current) choose(e.currentTarget, i) }}>
        <span className="project-tile-pic">
          <img className="pic-dots" src={p.image} alt="" draggable={false} decoding="async"/>
          <img className="pic-sharp" src={p.image} alt="" draggable={false} decoding="async"/>
          <span className="project-tile-kind">{p.kind}</span>
        </span>
        <span className="project-tile-caption"><span className="project-tile-title">{p.title}</span><span className="project-tile-n">{pad(i + 1)}</span></span>
      </button>)
    }
  }

  return <section className={`page projects ${shown !== null ? 'is-showing' : ''}`} aria-labelledby="projects-heading">
    <div ref={view} className="project-field" style={{ '--tile-scale': scale } as CSSProperties}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={() => { pointer.current = null }} onClick={send}>
      <canvas ref={links} className="project-links" aria-hidden="true" />
      <div ref={plane} className={`project-plane ${fitted ? 'is-fitted' : ''}`}>{tiles}</div>
    </div>
    <h1 id="projects-heading" className="projects-title">Projects.</h1>
    <StationLine here={inView} go={centre} />
    <p className="projects-hint">Drag, scroll or use the arrow keys to look around</p>
    {shown !== null && <ProjectBurst key={shown} />}
    {open !== null && <ProjectDetail index={open} onClose={close} />}
  </section>
}
