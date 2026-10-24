'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { FieldMark } from './field'
import { DotField, FLOW_EDGE } from './dotField'

// A page change is a flow: a wave runs from the click to the far side of the screen, speeding up and washing the
// page away, bounces, and runs back to the click, slowing down and bringing the new page in behind it
const OUT = 480   // ms
const BACK = 640  // ms
const easeIn = (u: number) => u * u
const easeOut = (u: number) => 1 - (1 - u) ** 3

type Flow = { href: string, x: number, y: number, far: number, start: number, phase: 'out' | 'wait' | 'back' }
type FieldControls = {
  colored: boolean
  wave(): void
  ripple(x: number, y: number): void
  // change page with a flow from (x, y), in viewport px
  go(href: string, x: number, y: number): void
}
const FieldContext = createContext<FieldControls>({ colored: false, wave() {}, ripple() {}, go() {} })
export const useField = () => useContext(FieldContext)

// The dot field behind every page, fixed to the viewport and kept across navigation. On a page with a
// `.hero-portrait` the portrait is set into it, and a `.wordmark`'s data-word is drawn across that element's width in
// its own font; on other pages they fade out. The pointer is tracked on the window so the field reacts through the
// content, and a click on anything that isn't a control sends a colour wave across the portrait, or a plain ring on
// other pages.
export default function FieldProvider({ children }: { children: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const field = useRef<DotField | null>(null)
  const flow = useRef<Flow | null>(null)
  const scene = useRef(() => {})
  const arrive = useRef(() => {})
  const portraitBox = useRef<DOMRect | null>(null)
  const [colored, setColored] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router }, [router])

  useEffect(() => {
    const el = canvas.current!
    const html = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    // 1.25 times the dots of the stylesheet's spacing (--field-gap); ?dots=2 previews another density
    const density = Math.min(20, Math.max(1, Number(new URLSearchParams(location.search).get('dots')) || 1.25))
    const f = field.current = new DotField(el, { still: () => reduce.matches, density })
    const portrait = new Image()
    portrait.src = '/portrait-cutout.webp'
    const ready = Promise.all([portrait.decode().catch(() => {}), document.fonts.ready])
    let disposed = false

    // set the current page's portrait and wordmark into the field; returns whether the page has a portrait
    const place = () => {
      const frame = document.querySelector('.hero-portrait'), word = document.querySelector<HTMLElement>('.wordmark')
      const c = el.getBoundingClientRect()
      portraitBox.current = frame ? frame.getBoundingClientRect() : null
      const r = portraitBox.current
      if (r && portrait.naturalWidth) f.setImage({ image: portrait, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height })
      // with no wordmark on the page the old one stays set, so it fades out with the portrait
      if (word) {
        const mark = letter(word, c)
        word.classList.add(mark ? 'is-drawn' : 'is-plain')
        f.setMark(mark)
      }
      return !!r
    }
    // a page reached by loading or by the browser's back and forward: the name gathers, the portrait fades
    scene.current = () => ready.then(() => {
      if (disposed) return
      watch()
      const home = place()
      f.show(home)
      if (home) f.assemble()
    })
    // a page reached by a flow, while the flow hides everything: set it at once, then send the flow back
    arrive.current = () => ready.then(() => {
      const fl = flow.current
      if (disposed || !fl) return
      watch()
      f.show(place(), true)
      fl.phase = 'back'
      fl.start = performance.now()
    })

    // The flow's radius, each frame: the dots carry the ring, and the page is masked to what lies beyond its front
    const stage = () => document.getElementById('main')
    const advance = (fl: Flow, now: number) => {
      const t = now - fl.start
      let r = fl.far
      if (fl.phase === 'out') {
        const u = Math.min(1, t / OUT)
        r = fl.far * easeIn(u)
        if (u === 1) { fl.phase = 'wait'; routerRef.current.push(fl.href) }
      } else if (fl.phase === 'back') {
        const u = Math.min(1, t / BACK)
        r = fl.far * (1 - easeOut(u))
        if (u === 1) return finish()
      }
      f.setFlow({ x: fl.x, y: fl.y, r, dir: fl.phase === 'back' ? -1 : 1 })
      const s = stage(), box = s?.getBoundingClientRect()
      if (s && box) {
        s.style.setProperty('--wave-x', `${fl.x - box.left}px`)
        s.style.setProperty('--wave-y', `${fl.y - box.top}px`)
        s.style.setProperty('--wave-r', `${r}px`)
      }
    }
    const finish = () => {
      flow.current = null
      f.setFlow(null)
      html.classList.remove('is-flowing')
      // from here on pages arrive through the flow, not their own entrance
      html.classList.add('flowed')
    }

    const local = (e: MouseEvent) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const }
    const move = (e: PointerEvent) => f.pointer(...local(e), e.timeStamp)
    const leave = () => f.leave()
    const click = (e: MouseEvent) => {
      if (flow.current || (e.target as Element).closest('a, button, summary, input, textarea, label, .curious-mind, .project-field, .project-detail')) return
      if (portraitBox.current) setColored(f.wave(...local(e)))
      else f.ripple(...local(e))
    }
    const resize = () => { if (!disposed && !flow.current) place() }
    // the portrait's box can change without the window changing (a phone sizes it to the space under the words)
    const boxes = new ResizeObserver(resize)
    const watch = () => { boxes.disconnect(); const frame = document.querySelector('.hero-portrait'); if (frame) boxes.observe(frame) }
    const refresh = () => f.refresh()
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('click', click)
    window.addEventListener('blur', leave)
    window.addEventListener('resize', resize)
    html.addEventListener('pointerleave', leave)
    // re-read the colours and the portrait's tones whenever the theme toggle flips data-theme
    const themes = new MutationObserver(refresh)
    themes.observe(html, { attributes: true, attributeFilter: ['data-theme'] })

    let raf = 0, last = performance.now()
    const frame = (now: number) => {
      if (flow.current) advance(flow.current, now)
      f.tick(Math.min(.05, (now - last) / 1000))
      last = now
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      themes.disconnect()
      boxes.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('click', click)
      window.removeEventListener('blur', leave)
      window.removeEventListener('resize', resize)
      html.removeEventListener('pointerleave', leave)
      f.destroy()
      field.current = null
    }
  }, [])

  // each page sets its own scene; one the flow brought in finishes the flow
  useEffect(() => {
    if (flow.current?.phase === 'wait') arrive.current()
    else scene.current()
  }, [pathname])

  const controls = useMemo<FieldControls>(() => ({
    colored,
    wave() {
      const f = field.current, r = portraitBox.current
      if (f && r) setColored(f.wave(r.left + r.width / 2, r.top + r.height / 2))
    },
    ripple(x, y) { field.current?.ripple(x, y) },
    go(href, x, y) {
      if (flow.current) return
      if (href === pathname) { field.current?.ripple(x, y); return }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { router.push(href); return }
      // far enough that the ring has left the screen, soft edge included, when it bounces
      const far = Math.max(Math.hypot(x, y), Math.hypot(innerWidth - x, y), Math.hypot(x, innerHeight - y), Math.hypot(innerWidth - x, innerHeight - y)) + FLOW_EDGE + 20
      flow.current = { href, x, y, far, start: performance.now(), phase: 'out' }
      document.documentElement.classList.add('is-flowing')
    },
  }), [colored, pathname, router])

  return <FieldContext.Provider value={controls}>
    <div className="field" aria-hidden="true"><canvas ref={canvas} /></div>
    {children}
  </FieldContext.Provider>
}

// The wordmark: the element's data-word in its own font, its ink filling the element's width and centred on its
// height, drawn at three times its css size so each cell averages a smooth patch of the letters
function letter(word: HTMLElement, c: DOMRect): FieldMark | null {
  const text = word.dataset.word, r = word.getBoundingClientRect(), css = getComputedStyle(word)
  if (!text || !r.width) return null
  const g = document.createElement('canvas').getContext('2d')!
  const font = `${css.fontWeight} 200px ${css.fontFamily}`
  g.font = font
  g.letterSpacing = '-9px'
  const m = g.measureText(text)
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  const k = r.width * 3 / inkW, out = g.canvas
  out.width = Math.ceil(r.width * 3); out.height = Math.ceil(inkH * k)
  g.font = font
  g.letterSpacing = '-9px'
  g.scale(k, k)
  g.fillText(text, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent)
  const h = out.height / 3
  return { source: out, box: { x: r.left - c.left, y: r.top - c.top + (r.height - h) / 2, w: r.width, h } }
}
