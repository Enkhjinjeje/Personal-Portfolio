'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { CodeXml, Globe2, GraduationCap, HeartHandshake, Shirt, Volleyball, Plus, Minus, X } from 'lucide-react'
import './curious-mind.css'

const interests = [
  { Icon: CodeXml, label: 'Building with code', text: 'I built the Mongolian Cultural Center’s website with Next.js, React, Tailwind CSS, and Supabase—a place to discover programs and stay connected.', image: '/cultural-center.png', x: -73, y: 129, angle: -14 },
  { Icon: Globe2, label: 'Connecting cultures', text: 'As a co-founder of the Mongolian Cultural Center in North America, I help create space for culture, shared experiences, and the next generation.', x: 3, y: 113, angle: 12 },
  { Icon: GraduationCap, label: 'Always learning', text: 'I’m studying Computer Science at the University of Washington, with graduation expected in June 2028. Curiosity keeps me building and trying new things.', x: 75, y: 155, angle: 18 },
  { Icon: HeartHandshake, label: 'Bringing people together', text: 'From college workshops to summer camps and campus visits, community is part of my work. I like making room for people to create and belong.', x: -8, y: 190, angle: -9 },
  { Icon: Volleyball, label: 'Campus sports', text: 'At UW, I help students connect through sport—officiating soccer, basketball, and flag football, and supporting campus events.', x: -79, y: 226, angle: -20 },
  { Icon: Shirt, label: 'Fashion and self-expression', text: 'I founded a student fashion and culture club at UW: a place for creativity and self-expression, led by a nine-member board and bringing together 50 members.', x: 65, y: 243, angle: 15 },
]

export default function CuriousMind() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [displayed, setDisplayed] = useState<number | null>(null)
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const iconButtons = useRef<(HTMLButtonElement | null)[]>([])
  const closeButton = useRef<HTMLButtonElement>(null)
  const interest = displayed === null ? null : interests[displayed]

  // Keep the old story mounted through its exit. Rapid clicks replace the
  // pending selection, so only the last requested story enters.
  useEffect(() => {
    if (selected === displayed) { setPhase('enter'); return }
    if (displayed === null) { setDisplayed(selected); setPhase('enter'); return }
    setPhase('exit')
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 580
    const timer = window.setTimeout(() => {
      setDisplayed(selected)
      setPhase('enter')
    }, delay)
    return () => window.clearTimeout(timer)
  }, [selected, displayed])

  useEffect(() => {
    if (displayed !== null) closeButton.current?.focus({ preventScroll: true })
  }, [displayed])

  useEffect(() => {
    if (selected === null) return
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setSelected(null)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [selected])

  function closeBubble() {
    if (selected !== null) iconButtons.current[selected]?.focus({ preventScroll: true })
    setSelected(null)
  }

  function toggleHead() {
    setSelected(null)
    setOpen(value => !value)
  }

  return <figure ref={root} className={`curious-mind ${open ? 'is-open' : ''}`} onKeyDown={event => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    if (selected !== null) closeBubble()
    else { setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  }}>
    <div className="mind-story-slot" aria-live="polite">
      {interest && <section key={displayed} id="mind-bubble" className={`mind-bubble mind-story-${phase}`} aria-label={interest.label}
        onAnimationEnd={event => { if (event.target === event.currentTarget && phase === 'enter') setPhase('idle') }}>
        <button ref={closeButton} className="mind-bubble-close" aria-label="Close interest details" onClick={closeBubble}><X size={18} /></button>
        <h3>{interest.label}</h3>
        {interest.image && <img src={interest.image} alt="Mongolian Cultural Center website I built" width="1440" height="960" />}
        <p>{interest.text}</p>
      </section>}
    </div>
    <div className="mind-stage">
      <button ref={trigger} className="mind-head-trigger" aria-label="Explore what's on my mind" aria-expanded={open} aria-controls="mind-interests" onClick={toggleHead} />
      <span className="mind-opening" aria-hidden="true" />
      <span className="mind-head mind-face" aria-hidden="true"><img src="/curious-mind.png" alt="" width="1024" height="1024" draggable={false} /></span>
      <div className="mind-objects" id="mind-interests" inert={!open}>
        {interests.map(({ Icon, label, x, y, angle }, index) => <button
          ref={element => { iconButtons.current[index] = element }}
          type="button" className="mind-object" key={label}
          aria-label={label} aria-expanded={selected === index} aria-controls={selected === index ? 'mind-bubble' : undefined}
          onClick={() => selected === index ? closeBubble() : setSelected(index)}
          style={{ '--object-x': `${x}px`, '--object-y': `${y}px`, '--object-angle': `${angle}deg`, '--object-delay': `${index * 35}ms` } as CSSProperties}
        ><Icon strokeWidth={1.65} aria-hidden="true" /><span className="mind-object-label" aria-hidden="true">{label}</span></button>)}
      </div>
      <span className="mind-head mind-crown" aria-hidden="true"><img src="/curious-mind.png" alt="" width="1024" height="1024" draggable={false} /></span>
      <span className="mind-spark mind-spark-one" aria-hidden="true" />
      <span className="mind-spark mind-spark-two" aria-hidden="true" />
    </div>
    <button className="mind-trigger" onClick={toggleHead} aria-expanded={open} aria-controls="mind-interests">
      <span className="mind-invitation">{open ? 'Close my mind' : 'Curious? Open my mind.'}<span className="mind-toggle">{open ? <Minus size={16} /> : <Plus size={16} />}</span></span>
    </button>
    <figcaption className="mind-caption" aria-live="polite">
      {open ? 'Pick an icon. There’s a story behind each one.' : 'There’s more going on in here.'}
    </figcaption>
  </figure>
}
