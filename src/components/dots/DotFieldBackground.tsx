'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { DotField } from './dotField'

// The dualscroll dot field as the backdrop of the landing view: it runs from the top of the page to the bottom of
// the `until` element. The cutout in `src` is set into the field inside the `frame` element, so the portrait is
// drawn by the field's own dots. The pointer is tracked on the window so the dots react through the content, and
// a click on anything that isn't a control sends a colour wave out from it: the portrait turns to colour as the
// wave passes, and the next wave turns it back. `control.wave()` sends one from the portrait's centre.
// The `mark` element's data-word is drawn into the field across that element's width, in its own font; once the
// dots have it, the element gets `is-drawn` (its plain text stays for no-script and assistive tech).
export type PortraitControl = { wave(): void }
export default function DotFieldBackground({ until, frame, src, mark, control, onColor }: {
  until: string, frame: string, src: string, mark?: string, control?: RefObject<PortraitControl | null>, onColor?: (colored: boolean) => void,
}) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const end = document.querySelector(until)
    const box = document.querySelector(frame)
    const fit = () => { if (end) el.style.height = `${end.getBoundingClientRect().bottom + window.scrollY}px` }
    fit()

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const field = new DotField(el, { still: () => reduce.matches })
    const portrait = new Image()
    const place = () => {
      if (!box || !portrait.naturalWidth) return
      const r = box.getBoundingClientRect(), c = el.getBoundingClientRect()
      field.setImage({ image: portrait, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height })
    }
    portrait.src = src
    portrait.decode().then(place, () => {})

    // the wordmark: the text's ink fills the element's width, centred on its height
    const word = mark ? document.querySelector<HTMLElement>(mark) : null
    const letter = () => {
      const text = word?.dataset.word
      if (!word || !text) return false
      const r = word.getBoundingClientRect(), c = el.getBoundingClientRect(), css = getComputedStyle(word)
      if (!r.width) return false
      const g = document.createElement('canvas').getContext('2d')!
      g.font = `${css.fontWeight} 200px ${css.fontFamily}`
      g.letterSpacing = '-9px'
      const m = g.measureText(text)
      const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
      // drawn at three times its css size so each dot averages a smooth patch of the letters
      const k = r.width * 3 / inkW, out = g.canvas
      out.width = Math.ceil(r.width * 3); out.height = Math.ceil(inkH * k)
      g.font = `${css.fontWeight} 200px ${css.fontFamily}`
      g.letterSpacing = '-9px'
      g.scale(k, k)
      g.fillText(text, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent)
      const h = out.height / 3
      field.markImage = { source: out, box: { x: r.left - c.left, y: r.top - c.top + (r.height - h) / 2, w: r.width, h } }
      return true
    }
    let disposed = false
    if (word) document.fonts.ready.then(() => {
      if (disposed) return
      if (!letter()) { word.classList.add('is-plain'); return }
      word.classList.add('is-drawn')
      field.assemble()
    })

    const local = (e: MouseEvent) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const }
    const move = (e: PointerEvent) => field.pointer(...local(e), e.timeStamp)
    const leave = () => field.leave()
    const send = (x: number, y: number) => onColor?.(field.wave(x, y))
    const click = (e: MouseEvent) => {
      const [x, y] = local(e)
      if (y < el.clientHeight && !(e.target as Element).closest('a, button, summary, input, textarea, label')) send(x, y)
    }
    if (control) control.current = {
      wave() {
        const r = box?.getBoundingClientRect(), c = el.getBoundingClientRect()
        if (r) send(r.left + r.width / 2 - c.left, r.top + r.height / 2 - c.top)
      },
    }
    const refresh = () => field.refresh()
    const resize = () => { fit(); place(); letter() }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('click', click)
    window.addEventListener('blur', leave)
    window.addEventListener('resize', resize)
    document.documentElement.addEventListener('pointerleave', leave)
    // re-read the dot colour and the portrait's tones whenever the theme toggle flips data-theme
    const themes = new MutationObserver(refresh)
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const sizes = new ResizeObserver(resize)
    if (end) sizes.observe(end)
    if (box) sizes.observe(box)
    if (word) sizes.observe(word)

    let raf = 0, last = 0
    const frameStep = (now: number) => {
      field.tick(Math.min(.05, (now - last) / 1000))
      last = now
      raf = requestAnimationFrame(frameStep)
    }
    const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frameStep) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    // nothing runs once the landing view is scrolled away
    const visible = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
    visible.observe(el)

    return () => {
      stop()
      visible.disconnect(); sizes.disconnect(); themes.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('click', click)
      window.removeEventListener('blur', leave)
      window.removeEventListener('resize', resize)
      disposed = true
      document.documentElement.removeEventListener('pointerleave', leave)
      if (control) control.current = null
      field.destroy()
    }
  }, [until, frame, src, mark, control, onColor])

  return <canvas ref={canvas} className="dot-field" aria-hidden="true" />
}
