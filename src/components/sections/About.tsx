import { ArrowUpRight } from 'lucide-react'
import CuriousMind from '../curious-mind/CuriousMind'
import { resume } from '../../content'

export default function About() {
  return <section id="about" className="about-section" aria-labelledby="about-heading">
    <div className="shell about-layout">
      <div className="about-portrait-column"><h2 id="about-heading">More than<br/>a screen.</h2><CuriousMind /></div>
      <div className="about-copy">
        <p className="about-lead">I like connecting things.<br/>Ideas to code. People to culture.<br/>Curiosity to something real.</p>
        <p>I’m studying Computer Science at the University of Washington, with graduation expected in June 2028. My work lives between software and community: building a website, helping a student get unstuck, or bringing people together around a shared idea.</p>
        <p>Alongside development, I co-founded the Mongolian Cultural Center in North America and founded a student fashion and culture club at UW. Different spaces, the same instinct: make room for people to create and belong.</p>
        <a className="light-link inline-flex items-center gap-3" href={resume} target="_blank" rel="noreferrer">Read my résumé <ArrowUpRight size={18}/></a>
      </div>
    </div>
  </section>
}
