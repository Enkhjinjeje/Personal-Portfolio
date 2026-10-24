'use client'

import { useField } from './field/FieldProvider'

// The home page: the wordmark and the portrait are both drawn in the field behind them
export default function HomeHero() {
  const { colored, wave } = useField()

  return <section className="page home" aria-labelledby="home-heading">
    <div className="home-intro">
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
