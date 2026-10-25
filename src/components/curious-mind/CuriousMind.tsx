'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { CodeXml, Globe2, GraduationCap, HeartHandshake, Shirt, Volleyball, Plus, Minus } from 'lucide-react'
import { useMindStory } from './mind-story'
import './curious-mind.css'

// what each icon in the head stands for; the About card turns over to tell the story behind the one picked
export const interests = [
  { Icon: CodeXml, label: 'Building with code', text: 'I built the Mongolian Cultural Center’s website with Next.js, React, Tailwind CSS, and Supabase—a place to discover programs and stay connected.', image: '/cultural-center.webp', x: -73, y: 129, angle: -14 },
  { Icon: Globe2, label: 'Connecting cultures', text: 'As a co-founder of the Mongolian Cultural Center in North America, I help create space for culture, shared experiences, and the next generation.', x: 3, y: 113, angle: 12 },
  { Icon: GraduationCap, label: 'Always learning', text: 'I’m studying Computer Science at the University of Washington, with graduation expected in June 2028. Curiosity keeps me building and trying new things.', x: 75, y: 155, angle: 18 },
  { Icon: HeartHandshake, label: 'Bringing people together', text: 'From college workshops to summer camps and campus visits, community is part of my work. I love building communities and making sure everyone in them feels they belong.', x: -8, y: 190, angle: -9 },
  { Icon: Volleyball, label: 'Campus sports', text: 'At UW, I help students connect through sport—officiating soccer, basketball, and flag football, and supporting campus events.', x: -79, y: 226, angle: -20 },
  { Icon: Shirt, label: 'Fashion and self-expression', text: 'I founded a student fashion and culture club at UW: a place for creativity and self-expression, led by a nine-member board and bringing together 50 members.', x: 65, y: 243, angle: 15 },
]

export default function CuriousMind() {
  const [open, setOpen] = useState(false)
  // which story is open is shared with the About card, which shows it; on its own the head keeps it here
  const shared = useMindStory()
  const [ownSelected, ownSelect] = useState<number | null>(null)
  const selected = shared ? shared.selected : ownSelected
  const setSelected = shared ? shared.select : ownSelect
  const root = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const ownIcons = useRef<(HTMLButtonElement | null)[]>([])
  const iconButtons = shared ? shared.icons : ownIcons

  // a press anywhere but the head or the card closes the open story
  useEffect(() => {
    if (selected === null) return
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Element
      if (!root.current?.contains(target) && !target.closest?.('.about-card')) setSelected(null)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [selected, setSelected])

  function closeStory() {
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
    if (selected !== null) closeStory()
    else { setOpen(false); trigger.current?.focus({ preventScroll: true }) }
  }}>
    <div className="mind-stage">
      <button ref={trigger} className="mind-head-trigger" aria-label="Explore what's on my mind" aria-expanded={open} aria-controls="mind-interests" onClick={toggleHead} />
      <span className="mind-opening" aria-hidden="true" />
      <span className="mind-head mind-face" aria-hidden="true"><img src="/curious-mind.webp" alt="" width="1254" height="1254" draggable={false} /></span>
      <div className="mind-objects" id="mind-interests" inert={!open}>
        {interests.map(({ Icon, label, x, y, angle }, index) => <button
          ref={element => { iconButtons.current[index] = element }}
          type="button" className={`mind-object ${selected === index ? 'is-selected' : ''}`} key={label}
          aria-label={label} aria-expanded={selected === index} aria-controls={selected === index ? 'mind-bubble' : undefined}
          onClick={() => selected === index ? closeStory() : setSelected(index)}
          style={{ '--object-x': `${x}px`, '--object-y': `${y}px`, '--object-angle': `${angle}deg`, '--object-delay': `${index * 35}ms` } as CSSProperties}
        ><Icon strokeWidth={1.65} aria-hidden="true" /><span className="mind-object-label" aria-hidden="true">{label}</span></button>)}
      </div>
      <span className="mind-head mind-crown" aria-hidden="true"><img src="/curious-mind.webp" alt="" width="1254" height="1254" draggable={false} /></span>
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
