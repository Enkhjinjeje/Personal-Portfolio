import { ArrowDown } from 'lucide-react'
import ScrollWords from '../ScrollWords'

export default function Intro() {
  return <section className="intro shell" id="intro" aria-labelledby="intro-heading">
    <ScrollWords id="intro-heading" text={'Good things happen\nwhen curious minds\ncome together.'} />
    <div className="intro-bio">
      <p>I’m Enkhjin. You can call me Jeje.</p>
      <p>A computer science student building websites, communities, and what’s next.</p>
      <p className="intro-place">Based in Bothell, Washington</p>
      <a className="text-link inline-flex items-center gap-3" href="#work">Explore my work <ArrowDown size={17}/></a>
    </div>
  </section>
}
