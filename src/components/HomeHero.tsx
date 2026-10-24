'use client'

import { useEffect, useRef } from 'react'
import { useField } from './field/FieldProvider'

// The home page: the wordmark and the portrait are both drawn in the field behind them. Where the words end is
// kept in --intro-bottom, so on a phone the portrait can start just under them.
export default function HomeHero() {
  const { colored, wave } = useField()
  const section = useRef<HTMLElement>(null)
  const intro = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = section.current, words = intro.current
    if (!el || !words) return
    const measure = () => el.style.setProperty('--intro-bottom', `${Math.round(words.getBoundingClientRect().bottom)}px`)
    const sizes = new ResizeObserver(measure)
    sizes.observe(words)
    window.addEventListener('resize', measure)
    return () => { sizes.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return <section ref={section} className="page home" aria-labelledby="home-heading">
    <div ref={intro} className="home-intro">
      <h1 id="home-heading" className="wordmark" data-word="jeje."><span className="wordmark-text" aria-hidden="true">jeje.</span><span className="sr-only">Jeje, Enkhjin Chuluunkhuu</span></h1>
      <p className="hero-line"><strong>Enkhjin Chuluunkhuu</strong><span>Developer and community builder, studying computer science at the University of Washington.</span></p>
      <button className="color-hint" aria-pressed={colored} onClick={wave}>
        <span className="on-mouse">Move your cursor.</span>
        <span className="on-mouse">{colored ? 'Click again for black and white.' : 'Click anywhere to color me in.'}</span>
        <span className="on-touch">{colored ? 'Tap again for black and white.' : 'Tap anywhere to color me in.'}</span>
      </button>
    </div>
    <div className="hero-portrait" role="img" aria-label={`Jeje’s portrait drawn in dots, ${colored ? 'in colour' : 'in black and white'}: smiling, in glasses and a black coat`} />
  </section>
}
