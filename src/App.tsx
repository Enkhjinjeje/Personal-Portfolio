'use client'

import { useState, type CSSProperties } from 'react'
import { ArrowUpRight, ArrowDown, ArrowUp, Plus, Minus, Menu, X, Copy, Check, RotateCcw } from 'lucide-react'

const email = 'enkhjinjeje@gmail.com'
const experience = [
  { company: 'University of Washington', role: 'Intramural Staff', date: 'Jan 2026 – Present', description: 'Helping students connect through sport. Officiating soccer, basketball, and flag football, supporting campus events, and collaborating on social content.', detail: 'Contributed to 36 pop-up events, 7 leagues, and 3 tournaments serving 730 unique participants and 2,279 check-ins in 2025–26. Collaborated on social content driving approximately 32,000 monthly Instagram page visits.' },
  { company: 'Pinecone Solutions', role: 'Software Development Intern', date: 'Jun – Aug 2022', description: 'Built features for a mobile app mapping commercial and residential addresses in Mongolia, using React, Java, and CSS.', detail: 'The app collected 1,000+ addresses. Implemented Firebase authentication for 5 admin accounts and a React Dropzone image-upload flow handling 100 uploads per day.' },
  { company: 'Pinecone Academy', role: 'Assistant Teacher', date: 'Jan – May 2022', description: 'Helped 8 students, ages 13–18, turn their first lines of HTML and CSS into working projects.', detail: 'Students completed 20+ projects, from front-end websites to full-stack applications and games. Provided individual CSS guidance and taught students to research solutions independently.' },
]

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [remixed, setRemixed] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true); setCopyError(false)
      window.setTimeout(() => setCopied(false), 2500)
    } catch { setCopied(false); setCopyError(true) }
  }
  const closeMenu = () => setMenuOpen(false)
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header shell" id="top">
      <a className="brand" href="#top" aria-label="Jeje, home">jeje<span className="brand-dot">.</span></a>
      <nav className="desktop-nav flex items-center gap-8" aria-label="Main navigation">
        <a href="#work">Work</a><a href="#about">About</a><a href="#experience">Experience</a>
      </nav>
      <a className="header-contact inline-flex items-center gap-3" href="#contact">Let’s talk <ArrowUpRight size={18}/></a>
      <button className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={e => { if(e.key === 'Escape') { closeMenu(); document.querySelector<HTMLButtonElement>('.menu-button')?.focus() } }}>
        {['Work','About','Experience','Contact'].map(label=><a key={label} href={`#${label.toLowerCase()}`} onClick={closeMenu}>{label}<ArrowUpRight size={20}/></a>)}
      </nav>}
    </header>

    <main id="main">
      <section className="hero shell" aria-labelledby="intro-heading">
        <div className="hero-intro">
          <h1 id="intro-heading">Good things happen<br/>when curious minds<br/>come together.</h1>
          <div className="hero-bio">
            <p>I’m Enkhjin. You can call me Jeje.</p>
            <p>A computer science student building<br className="hidden lg:block"/> websites, communities, and what’s next.</p>
            <a className="text-link inline-flex items-center gap-3" href="#work">Explore my work <ArrowDown size={17}/></a>
          </div>
        </div>
        <div className="signature-wrap">
          <button className={`signature ${remixed ? 'is-remixed' : ''}`} aria-label="Remix the Jeje lettering" aria-pressed={remixed}
            onClick={() => { setRemixed(!remixed); setPointer({x:0,y:0}) }}
            onPointerMove={e => { if(e.pointerType !== 'mouse') return; const r=e.currentTarget.getBoundingClientRect(); setPointer({x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}) }}
            onPointerLeave={() => setPointer({x:0,y:0})}
            style={{'--pointer-x': pointer.x, '--pointer-y': pointer.y} as CSSProperties}>
            <span aria-hidden="true" className="letter letter-j">j</span><span aria-hidden="true" className="letter letter-e">e</span><span aria-hidden="true" className="letter letter-j2">j</span><span aria-hidden="true" className="letter letter-e2">e</span><span aria-hidden="true" className="signature-period">.</span>
          </button>
          <div className="hero-foot flex items-center justify-between gap-4">
            <p>Based in Bothell, Washington</p>
            <button className="remix-label inline-flex items-center gap-2" onClick={()=>setRemixed(!remixed)}>{remixed ? <><RotateCcw size={14}/> Put things back</> : <>A little room to play. Tap my name <Plus size={14}/></>}</button>
          </div>
        </div>
      </section>

      <section className="work-section shell" id="work" aria-labelledby="work-heading">
        <div className="section-heading"><h2 id="work-heading">Built with purpose.</h2><p>Software with people at the center.</p></div>
        <article className="featured-work">
          <a className="project-visual" href="https://www.mongolianculturalcenterna.org/" target="_blank" rel="noreferrer" aria-label="Visit the Mongolian Cultural Center website (opens in a new tab)">
            <div className="browser-frame"><div className="browser-toolbar"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>mongolianculturalcenterna.org</span><ArrowUpRight size={13}/></div><img src="/cultural-center.png" alt="The live Mongolian Cultural Center website showing its community celebration and cultural programs" width="1440" height="960" loading="lazy"/></div>
            <span className="visit-project">Visit website <ArrowUpRight size={19}/></span>
          </a>
          <div className="project-info">
            <h3>A digital home<br/>for our culture.</h3>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-secondary"><span>Full-stack development</span><span>2025 – Present</span></div>
            <p>I built the Mongolian Cultural Center’s website to give our community a place to discover programs, find events, and stay connected.</p>
            <p>A custom admin dashboard lets staff publish updates themselves, moving the organization beyond Facebook-only posting.</p>
            <dl className="project-metrics grid grid-cols-2 gap-6"><div><dt>Visitors</dt><dd>400+</dd></div><div><dt>Page views</dt><dd>2,000</dd></div></dl>
            <ul className="tech-list flex flex-wrap gap-x-5 gap-y-2" aria-label="Project technologies">{['Next.js','React','Tailwind CSS','Supabase','Vercel'].map(t=><li key={t}>{t}</li>)}</ul>
            <details className="project-details"><summary>Behind the build <Plus size={18}/></summary><div><p><strong>My contribution.</strong> Responsive interfaces, the full-stack site, and the publishing dashboard. The website brings together 6 programs and 22 events.</p><p><strong>Why it matters.</strong> Staff can keep the community informed without requesting code changes for each update.</p></div></details>
          </div>
        </article>
        <a className="earlier-work" href="#pinecone"><span>Earlier work</span><div><h3>Mapping places in Mongolia.</h3><p>Address discovery, authentication, and image uploads at Pinecone Solutions.</p></div><ArrowUpRight size={28}/></a>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-heading">
        <div className="shell about-layout">
          <div><h2 id="about-heading">More than<br/>a screen.</h2><div className="connection-mark" aria-hidden="true"><svg viewBox="0 0 240 180" fill="none"><ellipse cx="95" cy="90" rx="65" ry="65" stroke="currentColor" strokeWidth="2"/><ellipse cx="145" cy="90" rx="65" ry="65" stroke="currentColor" strokeWidth="2"/><circle cx="120" cy="90" r="7" fill="currentColor"/></svg></div></div>
          <div className="about-copy"><p className="about-lead">I like connecting things.<br/>Ideas to code. People to culture.<br/>Curiosity to something real.</p><p>I’m studying Computer Science at the University of Washington, with graduation expected in June 2028. My work lives between software and community: building a website, helping a student get unstuck, or bringing people together around a shared idea.</p><p>Alongside development, I co-founded the Mongolian Cultural Center in North America and founded a student fashion and culture club at UW. Different spaces, the same instinct: make room for people to create and belong.</p><a className="light-link inline-flex items-center gap-3" href="/JejeResume.pdf" target="_blank" rel="noreferrer">Read my résumé <ArrowUpRight size={18}/></a></div>
        </div>
      </section>

      <section className="community-section shell" aria-labelledby="community-heading">
        <div className="section-heading"><h2 id="community-heading">Building beyond code.</h2><p>Community is part of the work.</p></div>
        <div className="community-grid">
          <article><h3>Mongolian Cultural<br/>Center in NA</h3><span className="role-caption">Co-founder · May 2024 – Present</span><p>Preserving culture and opening doors for the next generation through workshops, campus visits, and shared experiences.</p><div className="community-facts"><span><strong>10+</strong> college workshops</span><span><strong>300+</strong> total attendees</span></div><p className="community-note">8 summer camps. Tech campus tours. A cultural exploration program for 12 high schoolers.</p></article>
          <article><h3>Fashion, culture,<br/>and a place to belong.</h3><span className="role-caption">Founder & President · Jun 2024 – Present</span><p>Founded a student-led club at the University of Washington for creativity and self-expression, led by a 9-member board.</p><div className="community-facts"><span><strong>50</strong> members</span><span><strong>8</strong> workshops & events</span></div><p className="community-note">Collaborations with Stitched and the UW Seattle Mongolian Student Association.</p></article>
        </div>
      </section>

      <section className="experience-section shell" id="experience" aria-labelledby="experience-heading">
        <div className="section-heading"><h2 id="experience-heading">Along the way.</h2><a className="text-link inline-flex items-center gap-2" href="/JejeResume.pdf" target="_blank" rel="noreferrer">Full résumé <ArrowUpRight size={16}/></a></div>
        <div>{experience.map((item,i)=><details className="experience-row" id={i===1 ? 'pinecone' : undefined} key={item.company}>
          <summary><span className="experience-date">{item.date}</span><span className="experience-role"><strong>{item.company}</strong><span>{item.role}</span></span><Plus className="expand-icon" size={21}/><Minus className="collapse-icon" size={21}/></summary>
          <div className="experience-description"><p>{item.description}</p><p>{item.detail}</p></div>
        </details>)}</div>
        <div className="education"><h3>Always learning.</h3><div><p>University of Washington</p><p className="text-secondary">Bachelor of Computer Science · Expected June 2028</p></div></div>
        <div className="skills"><h3>Things I work with.</h3><div className="skills-grid"><div><h4>On the screen</h4><p>React, Next.js, TypeScript, JavaScript, Tailwind CSS, Three.js, HTML & CSS</p></div><div><h4>Under the surface</h4><p>Java, Python, C++, R, Firebase, Supabase, MongoDB, MySQL, AWS</p></div><div><h4>From idea to release</h4><p>Git, GitHub, Figma, UI/UX prototyping, Vercel, Bash</p></div></div></div>
      </section>

      <section className="contact-section shell" id="contact" aria-labelledby="contact-heading">
        <a className="contact-title" href={`mailto:${email}`}><h2 id="contact-heading">Let’s make<br/>something matter.</h2><ArrowUpRight aria-hidden="true"/></a>
        <p className="contact-intro">Have a project, a question, or a different perspective?</p>
        <div className="contact-links"><div className="email-group"><a href={`mailto:${email}`}>{email}</a><button aria-label="Copy email address" onClick={copyEmail}>{copied ? <Check size={17}/> : <Copy size={17}/>}</button><span className="copy-status" role="status">{copied ? 'Copied!' : copyError ? 'Please copy the email above.' : ''}</span></div><a href="https://www.linkedin.com/in/enkhjinjeje/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href="/JejeResume.pdf" target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={17}/></a></div>
      </section>
    </main>
    <footer className="shell footer"><p>© {new Date().getFullYear()} Enkhjin Chuluunkhuu</p><p>Made with curiosity.</p><a href="#top">Back to top <ArrowUp size={15}/></a></footer>
  </>
}
