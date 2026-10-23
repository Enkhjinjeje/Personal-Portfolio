'use client'

import { useEffect, useRef, useState } from 'react'

// A heading whose words light up one by one as it scrolls up the screen. Every word is lit until script runs, and
// stays lit with reduced motion. A newline in `text` is a line break on wide screens.
export default function ScrollWords({ text, id }: { text: string, id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const lines = text.split('\n').map(line => line.split(' '))
  const words = lines.flat()
  const [lit, setLit] = useState(words.length)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let queued = 0
    const measure = () => {
      queued = 0
      const el = ref.current
      if (!el) return
      if (reduce.matches) { setLit(words.length); return }
      // from its top entering the lower part of the screen to its middle reaching just above the centre
      const { top, height } = el.getBoundingClientRect()
      const start = innerHeight * .85, end = innerHeight * .45 - height / 2
      const progress = Math.min(1, Math.max(0, (start - top) / (start - end)))
      setLit(Math.round(progress * words.length))
    }
    const onScroll = () => { if (!queued) queued = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    reduce.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(queued)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      reduce.removeEventListener('change', onScroll)
    }
  }, [words.length])

  return <h2 ref={ref} id={id} className="scroll-words">
    {lines.map((line, j) => {
      const first = lines.slice(0, j).reduce((n, l) => n + l.length, 0)
      return [
        j > 0 && <br key={`br${j}`} className="wide-only" />,
        ...line.map((word, i) => <span key={first + i} className={first + i < lit ? 'is-lit' : undefined}>{word}{first + i < words.length - 1 ? ' ' : ''}</span>),
      ]
    })}
  </h2>
}
