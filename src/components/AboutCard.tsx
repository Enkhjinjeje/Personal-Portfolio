'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { interests } from './curious-mind/CuriousMind'
import { useMindStory } from './curious-mind/mind-story'
import { pad } from './projects/layout'

// The card's postmark: a ring of where I study round a smaller ring, beside wavy cancellation lines
export function Postmark() {
  const ring = useId()
  return <svg className="card-postmark" viewBox="0 0 150 64" aria-hidden="true">
    <defs><path id={ring} d="M32 54a22 22 0 1 1 0.01 0" /></defs>
    <circle cx="32" cy="32" r="29" /><circle cx="32" cy="32" r="16" />
    <text><textPath href={`#${ring}`}>UW · BOTHELL · CLASS OF 2028 ·</textPath></text>
    <path d="M66 20q8-6 16 0t16 0 16 0 16 0 16 0M66 32q8-6 16 0t16 0 16 0 16 0 16 0M66 44q8-6 16 0t16 0 16 0 16 0 16 0" />
  </svg>
}

// a face holds a story, the words about me (null), or nothing yet (the back, before the card first turns)
type Face = { story: number | null | 'blank' }

// The words about me on a card that turns over to tell the story behind an icon in the head. It has two faces and
// turns half a revolution for every change, so the face coming round always carries what is next: a story, another
// story, or the words again.
export default function AboutCard({ children }: { children: ReactNode }) {
  const mind = useMindStory()!
  const [turns, setTurns] = useState(0)
  const [faces, setFaces] = useState<[Face, Face]>([{ story: null }, { story: 'blank' }])
  const close = useRef<HTMLButtonElement>(null)
  const showing = turns % 2
  const shown = faces[showing].story

  useEffect(() => {
    if (mind.selected === shown) return
    const next = turns + 1
    setFaces(f => { const copy: [Face, Face] = [f[0], f[1]]; copy[next % 2] = { story: mind.selected }; return copy })
    setTurns(next)
  }, [mind.selected])

  // a story that comes round takes focus, so it can be read and closed from the keyboard
  useEffect(() => { if (shown !== null) close.current?.focus({ preventScroll: true }) }, [turns])

  function back() {
    const i = mind.selected
    mind.select(null)
    if (i !== null) mind.icons.current[i]?.focus({ preventScroll: true })
  }

  const face = (k: 0 | 1) => {
    const story = faces[k].story, here = k === showing
    if (story === 'blank') return <div key={k} className={`card-face ${k ? 'is-back' : ''}`} aria-hidden="true" inert />
    const interest = story === null ? null : interests[story]
    return <div key={k} className={`card-face ${k ? 'is-back' : ''}`} aria-hidden={!here} inert={!here}>
      {interest
        ? <section id={here ? 'mind-bubble' : undefined} className="card-story" aria-label={interest.label}>
          {/* the same postcard as the front: pill and postmark, the words, a dashed rule, and a foot */}
          <div className="card-top">
            <span className="card-pill"><interest.Icon size={14} aria-hidden="true"/>On my mind</span>
            <span className="card-top-end">
              <Postmark />
              <button ref={here ? close : undefined} type="button" className="card-close" aria-label="Close interest details" onClick={back}><X size={16}/></button>
            </span>
          </div>
          <h2 className="card-title">{interest.label}</h2>
          {interest.image && <img src={interest.image} alt="Mongolian Cultural Center website I built" width="1440" height="1000" />}
          <p className="card-text">{interest.text}</p>
          <p className="card-hint">Pick another icon in my head, or close this to turn the card back.</p>
          <div className="card-foot">
            <span className="card-count">{pad(story! + 1)} / {pad(interests.length)}</span>
            <span className="card-place">Bothell, Washington</span>
          </div>
        </section>
        : children}
    </div>
  }

  return <article className="about-card" onKeyDown={e => {
    // Escape turns the card back here, before it could take the page home
    if (e.key !== 'Escape' || shown === null) return
    e.preventDefault()
    back()
  }}>
    <div className="card-turn" style={{ transform: `rotateY(${turns * 180}deg)` }}>{face(0)}{face(1)}</div>
  </article>
}
