'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { DotField } from './dotField'

// The dualscroll dot field as the backdrop of the landing view: it runs from the top of the page to the bottom of
// the `until` element. The cutout in `src` is set into the field inside the `frame` element, so the portrait is
// drawn by the field's own dots. The pointer is tracked on the window so the dots react through the content, and
// a click on anything that isn't a control sends a colour wave out from it: the portrait turns to colour as the
// wave passes, and the next wave turns it back. `control.wave()` sends one from the portrait's centre.
export type PortraitControl = { wave(): void }
export default function DotFieldBackground({ until, frame, src, control, onColor }: {
  until: string, frame: string, src: string, control?: RefObject<PortraitControl | null>, onColor?: (colored: boolean) => void,
}) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current!
    const end = document.querySelector(until)
    const box = document.querySelector(frame)
    const fit = () => { if (end) el.style.height = `${end.getBoundingClientRect().bottom + window.scrollY}px` }
    fit()

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    const field = new DotField(el, { still: () => reduce.matches })
    const portrait = new Image()
    const place = () => {
      if (!box || !portrait.naturalWidth) return
      const r = box.getBoundingClientRect(), c = el.getBoundingClientRect()
      field.setImage({ image: portrait, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height, mode: 'tone' })
    }
    portrait.src = src
    portrait.decode().then(place, () => {})

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
    const resize = () => { fit(); place() }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('click', click)
    window.addEventListener('blur', leave)
    window.addEventListener('resize', resize)
    document.documentElement.addEventListener('pointerleave', leave)
    scheme.addEventListener('change', refresh)
    // re-read the dot colour and the portrait's tones whenever the theme toggle flips data-theme
    const themes = new MutationObserver(refresh)
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const sizes = new ResizeObserver(resize)
    if (end) sizes.observe(end)
    if (box) sizes.observe(box)

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
      document.documentElement.removeEventListener('pointerleave', leave)
      scheme.removeEventListener('change', refresh)
      if (control) control.current = null
      field.destroy()
    }
  }, [until, frame, src, control, onColor])

  return <canvas ref={canvas} className="dot-field" aria-hidden="true" />
}
