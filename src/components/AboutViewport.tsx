'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

/** Fit the complete composition, including an open note, inside the corner navigation. */
export default function AboutViewport({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null)
  const composition = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const frame = viewport.current!
    const content = composition.current!
    const fit = () => {
      const scale = Math.min(1, frame.clientHeight / content.offsetHeight)
      content.style.setProperty('--about-scale', String(scale))
    }
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    observer.observe(composition.current!)
    fit()
    return () => observer.disconnect()
  }, [])
  return <div className="about-viewport" ref={viewport}><div className="about-composition" ref={composition}>{children}</div></div>
}
