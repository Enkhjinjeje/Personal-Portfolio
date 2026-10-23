'use client'

import { useRef, useState } from 'react'
import DotFieldBackground, { type PortraitControl } from '../dots/DotFieldBackground'

// The landing view: the wordmark and the portrait, both drawn in the dot field behind them
export default function Hero() {
  const [colored, setColored] = useState(false)
  const portrait = useRef<PortraitControl>(null)

  return <>
    <DotFieldBackground until=".hero" frame=".hero-portrait" mark=".wordmark" src="/portrait-cutout.webp" control={portrait} onColor={setColored} />
    <section className="hero shell" aria-labelledby="hero-heading">
      <div className="hero-intro">
        <h1 id="hero-heading" className="wordmark" data-word="jeje."><span className="wordmark-text" aria-hidden="true">jeje.</span><span className="sr-only">Jeje, Enkhjin Chuluunkhuu</span></h1>
        <p className="hero-line"><strong>Enkhjin Chuluunkhuu</strong><span>Developer and community builder, studying computer science at the University of Washington.</span></p>
      </div>
      <div className="hero-portrait" role="img" aria-label={`Jeje’s portrait drawn in dots, ${colored ? 'in colour' : 'in black and white'}: smiling, in glasses and a black coat`} />
      <div className="hero-foot">
        <button className="color-hint" aria-pressed={colored} onClick={() => portrait.current?.wave()}>
          <span className="on-mouse">Move your cursor.</span>
          <span className="on-mouse">{colored ? 'Click again for black and white.' : 'Click anywhere to color me in.'}</span>
          <span className="on-touch">{colored ? 'Tap again for black and white.' : 'Tap anywhere to color me in.'}</span>
        </button>
        <a className="scroll-cue" href="#intro"><span className="scroll-cue-track" aria-hidden="true"><i/></span>Scroll to meet me</a>
      </div>
    </section>
  </>
}
