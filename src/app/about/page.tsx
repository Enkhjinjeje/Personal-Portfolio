import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import AboutViewport from '../../components/AboutViewport'
import VinylPlayer from '../../components/VinylPlayer'
import CuriousMind from '../../components/curious-mind/CuriousMind'
import { resume, skills } from '../../content'

export const metadata: Metadata = { title: 'About me' }

export default function AboutPage() {
  return <AboutViewport><section className="page about" aria-labelledby="about-heading">
    <div className="mind-panel"><VinylPlayer /><CuriousMind /></div>
    <div className="about-copy">
      <h1 id="about-heading" className="page-title">Good things happen when curious minds come together.</h1>
      <p className="about-lead">I’m Enkhjin. You can call me Jeje.</p>
      <p>I study Computer Science at the University of Washington (class of 2028). I build software, help students get unstuck, and bring people together around shared ideas.</p>
      <p>I also co-founded the Mongolian Cultural Center in North America and founded a fashion and culture club at UW. I like making room for people to create and belong.</p>
      <dl className="skills">{skills.map(group => <div key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl>
      <p className="about-foot"><span>Based in Bothell, Washington</span><a className="text-link inline-flex items-center gap-2" href={resume} target="_blank" rel="noreferrer">Read my résumé <ArrowUpRight size={16}/></a></p>
    </div>
  </section></AboutViewport>
}
