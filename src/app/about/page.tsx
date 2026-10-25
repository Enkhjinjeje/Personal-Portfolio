import type { Metadata } from 'next'
import { FileText, Linkedin, Mail } from 'lucide-react'
import AboutViewport from '../../components/AboutViewport'
import VinylPlayer from '../../components/VinylPlayer'
import CuriousMind from '../../components/curious-mind/CuriousMind'
import { MindStoryProvider } from '../../components/curious-mind/mind-story'
import AboutCard, { Postmark } from '../../components/AboutCard'
import { email, linkedIn, resume, skills } from '../../content'

export const metadata: Metadata = { title: 'About me' }

// Three things side by side: the record playing on the left, my face in the middle of the page, and the words on the
// right as a card, set like a postcard (a postmark, dashed rules, a stamp of where I am) in the site's black and white.
// Picking an icon in the head turns the card over to the story behind it.
export default function AboutPage() {
  return <AboutViewport><MindStoryProvider><section className="page about" aria-labelledby="about-heading">
    <VinylPlayer autoplay />
    <CuriousMind />
    <AboutCard>
      <div className="card-top">
        <span className="card-pill">About me</span>
        <Postmark />
      </div>
      <h1 id="about-heading" className="card-title">Building communities, deploying potential.</h1>
      <p className="card-lead">I’m Enkhjin. You can call me Jeje.</p>
      <p className="card-text">I study Computer Science at the University of Washington (class of 2028). I build software, teach others to code, and bring people together around shared ideas.</p>
      <p className="card-text">I also co-founded the Mongolian Cultural Center in North America and founded a fashion and culture club at UW. I love building communities and making sure everyone in them feels they belong.</p>
      <dl className="card-skills">{skills.map(group => <div key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl>
      <div className="card-foot">
        <span className="card-links">
          <a href={`mailto:${email}`} aria-label="Email me"><Mail size={18}/></a>
          <a href={linkedIn} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18}/></a>
          <a href={resume} target="_blank" rel="noreferrer" aria-label="Read my résumé"><FileText size={18}/></a>
        </span>
        <span className="card-place">Bothell, Washington</span>
      </div>
    </AboutCard>
  </section></MindStoryProvider></AboutViewport>
}
