'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

// From the Imagescroll component's useLoopScroll, scrolling the page stage (#main) rather than the window: the
// stage scrolls through a tall section whose sticky child holds the view, and the scroll position becomes a
// position along the items. Three copies of the list are laid end to end and the scroll is moved by one copy
// whenever it nears either end, so the list loops.

export const wrap = (value: number, count: number) => count > 0 ? ((value % count) + count) % count : 0

const scroller = () => document.getElementById('main')

export function useStageLoop({ count, scrollPerItem = .9 }: { count: number, scrollPerItem?: number }) {
  const steps = count > 1 ? 3 * count : 0
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [width, setWidth] = useState(0)
  const activeIndex = wrap(Math.round(position), count)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const sc = scroller()
    if (!sc) return
    let frame = 0
    const update = () => {
      frame = 0
      const root = rootRef.current, stage = stageRef.current
      if (!root || !stage) return
      const travel = root.offsetHeight - stage.offsetHeight
      const top = root.getBoundingClientRect().top - sc.getBoundingClientRect().top
      const step = steps ? travel / steps : 0
      let next = step > 0 ? Math.min(steps, Math.max(0, -top / step)) : 0
      if (count > 1 && step > 0) {
        const shift = next < count / 2 ? count : next > count * 2.5 ? -count : 0
        if (shift) {
          next += shift
          sc.scrollTo({ top: sc.scrollTop + shift * step, behavior: 'instant' })
        }
      }
      setPosition(next)
      setWidth(stage.clientWidth)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(schedule)
    if (rootRef.current) observer.observe(rootRef.current)
    if (stageRef.current) observer.observe(stageRef.current)
    sc.addEventListener('scroll', schedule, { passive: true })
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      sc.removeEventListener('scroll', schedule)
    }
  }, [count, steps])

  const move = (delta: number) => {
    const sc = scroller(), root = rootRef.current, stage = stageRef.current
    if (!sc || !root || !stage || !steps) return
    const start = sc.scrollTop + root.getBoundingClientRect().top - sc.getBoundingClientRect().top
    const travel = root.offsetHeight - stage.offsetHeight
    const target = Math.min(steps, Math.max(0, Math.round(position) + delta))
    sc.scrollTo({ top: start + target / steps * travel, behavior: reducedMotion ? 'instant' : 'smooth' })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    move(['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1)
  }
  const progress = reducedMotion ? activeIndex : wrap(position, count)
  // where item i sits relative to the one in view, from -count/2 to count/2
  const offsetFor = (index: number) => wrap(index - progress + count / 2, count) - count / 2

  return {
    rootRef, stageRef, activeIndex, progress, reducedMotion, width, offsetFor, onKeyDown,
    // the section's height, as a multiple of the stage's
    span: 1 + steps * scrollPerItem,
    next: () => move(1), previous: () => move(-1),
  }
}
