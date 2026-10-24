'use client'

import { useEffect, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useField } from './field/FieldProvider'

const corners = [
  { href: '/projects', n: '01', label: 'Projects', short: 'Projects', place: 'tl' },
  { href: '/work', n: '02', label: 'Work experience', short: 'Work', place: 'tr' },
  { href: '/about', n: '03', label: 'About me', short: 'About', place: 'bl' },
  { href: '/contact', n: '04', label: 'Contact', short: 'Contact', place: 'br' },
]

// the centre of an element, in viewport px
const centre = (el: Element | null) => {
  const r = el?.getBoundingClientRect()
  return r ? [r.left + r.width / 2, r.top + r.height / 2] as const : [0, 0] as const
}

// The four pages, one in each corner of the screen. On a page, its own corner turns into the way home, marked
// with a dot, so you leave by the corner you came in by. Choosing a corner sends the flow out from where it was
// clicked (from the corner, by keyboard), and Esc flows home through the page's own corner.
export default function CornerNav() {
  const pathname = usePathname()
  const { go } = useField()

  useEffect(() => {
    document.getElementById('main')?.scrollTo(0, 0)
    if (pathname === '/') return
    const home = (e: KeyboardEvent) => {
      // Curious Mind and open menus use Escape themselves
      if (e.key !== 'Escape' || e.defaultPrevented || (e.target as Element).closest?.('.curious-mind, input, textarea')) return
      go('/', ...centre(document.querySelector('.corner.is-home')))
    }
    window.addEventListener('keydown', home)
    return () => window.removeEventListener('keydown', home)
  }, [pathname, go])

  function follow(e: MouseEvent<HTMLAnchorElement>, href: string) {
    // a new tab or window opens as usual
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    // a keyboard press has no pointer position
    go(href, ...(e.detail ? [e.clientX, e.clientY] as const : centre(e.currentTarget)))
  }

  return <nav className="corners" aria-label="Main navigation">
    {corners.map(c => {
      const here = pathname === c.href, href = here ? '/' : c.href, label = here ? 'Home' : c.label
      return <Link key={c.place} href={href} className={`corner corner-${c.place} ${here ? 'is-home' : ''}`} aria-label={label}
        onClick={e => follow(e, href)}>
        <span className="corner-n" aria-hidden="true">{c.n}</span>
        <span className="corner-label" aria-hidden="true"><i className="corner-dot" /><span className="label-long">{label}</span><span className="label-short">{here ? 'Home' : c.short}</span></span>
      </Link>
    })}
  </nav>
}
