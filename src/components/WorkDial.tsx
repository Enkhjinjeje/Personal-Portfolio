'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { experience } from '../content'
import { useField } from './field/FieldProvider'
import { pad } from './projects/layout'

const STEP = 22       // degrees between roles around the dial
const EASE = .14      // how much of the way to the chosen role the dial turns each frame
const WHEEL = 150     // px of wheel or trackpad travel per role
const COOLDOWN = 450  // ms before the wheel can turn it again, so one flick moves one role
const SETTLE = 160    // ms the chosen role holds before its words gather, so turning past one doesn't draw it
const FADE = 2.4      // roles away from the pointer by which a label has faded out

const last = experience.length - 1
const clamp = (n: number) => Math.min(last, Math.max(0, n))
const year = (date: string) => date.match(/\d{4}/)?.[0] ?? ''

// A role's label, `o` roles round from the pointer at three o'clock (older ones further clockwise): it lies along
// its radius like the numbers on a dial, and fades in as it turns toward the pointer and out as it turns away
function label(o: number): CSSProperties {
  const f = Math.min(1, Math.abs(o) / FADE)
  return {
    transform: `translateY(-50%) rotate(${o * STEP}deg) translateX(var(--label-r))`,
    opacity: String(1 - f * f),
    // out of sight it can't be clicked, but stays in reach of the keyboard and screen readers
    pointerEvents: f >= 1 ? 'none' : 'auto',
  }
}

// the ticks round the hub: every 3 degrees, longer every 15
const TICKS = Array.from({ length: 120 }, (_, k) => k * 3)

// Work experience as half a dial: a hub on the left with a ring of ticks, and the roles round it with their start
// years, turning past a pointer at three o'clock (scroll, the arrow keys, the buttons beneath, a drag, or pick one).
// On the right that role gathers from the dots around it, then what it was.
export default function WorkDial() {
  const [sel, setSel] = useState(0)
  const field = useField()
  // read through a ref: the field's controls change with the portrait's colour, which mustn't regather the words
  const regather = useRef(field.regather)
  regather.current = field.regather
  const dial = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const marks = useRef<(HTMLButtonElement | null)[]>([])
  const motion = useRef({ pos: 0, target: 0, raf: 0, drag: null as null | { cx: number, cy: number, angle: number, moved: boolean, v: number, t: number } })
  const dragged = useRef(false)
  const job = experience[sel]

  // the dial turns toward the chosen role a little each frame, and rests once it is there
  const paint = () => {
    const m = motion.current
    marks.current.forEach((el, i) => { if (el) Object.assign(el.style, label(i - m.pos)) })
    if (ring.current) ring.current.style.transform = `rotate(${-m.pos * STEP}deg)`
  }
  const frame = () => {
    const m = motion.current
    m.raf = 0
    if (!m.drag) {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      m.pos = still || Math.abs(m.target - m.pos) < .002 ? m.target : m.pos + (m.target - m.pos) * EASE
    }
    paint()
    if (m.drag || m.pos !== m.target) m.raf = requestAnimationFrame(frame)
  }
  const turn = () => { if (!motion.current.raf) motion.current.raf = requestAnimationFrame(frame) }

  const choose = (i: number) => {
    const next = clamp(i)
    // keyboard focus follows the dial, when it was on one of its roles
    const focused = marks.current.includes(document.activeElement as HTMLButtonElement)
    motion.current.target = next
    setSel(next)
    turn()
    if (focused) marks.current[next]?.focus()
  }
  const chooseRef = useRef(choose)
  chooseRef.current = choose

  // a new role's words gather once the dial has settled on it
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = setTimeout(() => regather.current(), SETTLE)
    return () => clearTimeout(t)
  }, [sel])

  // the wheel turns it one role per flick (a listener of its own, so it can keep the page from scrolling), and the
  // arrow keys turn it from anywhere on the page
  useEffect(() => {
    const el = dial.current!
    let travel = 0, until = 0
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = performance.now()
      if (now < until) return
      travel += e.deltaY + e.deltaX
      if (Math.abs(travel) < WHEEL) return
      const to = clamp(motion.current.target + Math.sign(travel))
      travel = 0
      until = now + COOLDOWN
      if (to !== motion.current.target) chooseRef.current(to)
    }
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || (e.target as Element).closest?.('input, textarea, dialog')) return
      const t = motion.current.target
      const to = { ArrowDown: t + 1, ArrowRight: t + 1, ArrowUp: t - 1, ArrowLeft: t - 1, Home: 0, End: last }[e.key]
      if (to === undefined) return
      e.preventDefault()
      chooseRef.current(to)
    }
    el.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    return () => { el.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key); cancelAnimationFrame(motion.current.raf) }
  }, [])

  // dragging turns it round the hub under the finger, and lets go toward the role it was thrown at
  const angle = (d: { cx: number, cy: number }, e: PointerEvent) => Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180 / Math.PI
  function down(e: PointerEvent) {
    if (e.button !== 0) return
    const r = dial.current!.getBoundingClientRect(), hub = parseFloat(getComputedStyle(dial.current!).getPropertyValue('--hub-x')) || 28
    const d = { cx: r.left + hub, cy: r.top + r.height / 2 }
    motion.current.drag = { ...d, angle: angle(d, e), moved: false, v: 0, t: e.timeStamp }
    dragged.current = false
  }
  function move(e: PointerEvent) {
    const m = motion.current, d = m.drag
    if (!d) return
    const now = angle(d, e), turned = ((now - d.angle + 540) % 360) - 180
    if (!d.moved && Math.abs(turned) < 3) return
    if (!d.moved) { d.moved = true; dial.current!.setPointerCapture(e.pointerId) }
    d.angle = now
    // past either end it gives a little, then holds
    const pos = m.pos - turned / STEP, over = pos < 0 ? pos : pos > last ? pos - last : 0
    const next = pos - over * .7
    d.v = (next - m.pos) / Math.max(1, e.timeStamp - d.t)
    d.t = e.timeStamp
    m.pos = next
    turn()
  }
  function up() {
    const m = motion.current, d = m.drag
    if (!d) return
    m.drag = null
    if (!d.moved) return
    dragged.current = true
    // a quick throw carries on a little past where it was let go
    choose(Math.round(m.pos + d.v * 120))
  }

  return <>
    <div className="dial-wrap">
      <div ref={dial} className="dial" role="tablist" aria-orientation="vertical" aria-label="Roles, newest first"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="dial-arc" aria-hidden="true">
          <div ref={ring} className="dial-ring">
            {TICKS.map(a => <i key={a} className={a % 15 ? undefined : 'is-long'} style={{ transform: `rotate(${a}deg) translateX(var(--tick-r))` }} />)}
          </div>
        </div>
        <i className="dial-hub" aria-hidden="true" />
        <i className="dial-pointer" aria-hidden="true" />
        {experience.map((item, i) =>
          <button key={item.id} ref={el => { marks.current[i] = el }} type="button" role="tab" id={`role-${item.id}`}
            className="dial-label" aria-selected={i === sel} aria-controls="role-panel" tabIndex={i === sel ? 0 : -1}
            aria-label={`${item.org}, ${item.role}, ${item.date}`} style={label(i)} onClick={() => { if (!dragged.current) choose(i) }}>
            <span className="dial-year">{year(item.date)}</span>
            <span className="dial-name"><span className="dial-org">{item.org}</span><span className="dial-role">{item.role}</span></span>
          </button>)}
      </div>
      <div className="dial-steps">
        <button type="button" aria-label="Newer role" disabled={sel === 0} onClick={() => choose(sel - 1)}><ArrowLeft size={16}/></button>
        <span aria-live="polite"><span className="sr-only">Role </span>{pad(sel + 1)}<span aria-hidden="true">/</span><span className="sr-only"> of </span>{pad(experience.length)}</span>
        <button type="button" aria-label="Older role" disabled={sel === last} onClick={() => choose(sel + 1)}><ArrowRight size={16}/></button>
      </div>
    </div>
    <div className="role" role="tabpanel" id="role-panel" aria-labelledby={`role-${job.id}`}>
      {/* drawn in the field's dots; the plain words stand in where script or canvas can't */}
      <h2 className="wordmark role-mark" data-word={job.mark} data-fit="box">
        <span className="wordmark-text" aria-hidden="true">{job.mark}</span><span className="sr-only">{job.role}</span>
      </h2>
      <div key={job.id} className="role-body">
        <p className="role-meta"><strong>{job.org}</strong><span>{job.date}</span></p>
        <p className="role-text">{job.text}</p>
      </div>
    </div>
  </>
}
