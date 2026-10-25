'use client'

import { useEffect, useRef } from 'react'
import { ArrowUpRight, BriefcaseBusiness, Download, X } from 'lucide-react'
import { education, email, experience, linkedIn, profile, projects, resume, resumeSkills } from '../content'

const HASH = '#recruiter'

// Recruiter mode: the whole résumé, and what the site adds to it, as one plain page to read top to bottom. It opens
// over the site from the button beside the theme switch, or straight away from a link ending in #recruiter, and
// Escape or the close button returns to the site.
export default function RecruiterMode() {
  const sheet = useRef<HTMLDialogElement>(null)

  const open = () => {
    const d = sheet.current!
    if (d.open) return
    d.showModal()
    d.scrollTop = 0
    history.replaceState(null, '', HASH)
  }
  const close = () => sheet.current?.close()

  useEffect(() => {
    const d = sheet.current!
    // leaving it, by any way, takes the #recruiter off the address
    const closed = () => { if (location.hash === HASH) history.replaceState(null, '', location.pathname + location.search) }
    d.addEventListener('close', closed)
    if (location.hash === HASH) open()
    return () => d.removeEventListener('close', closed)
  }, [])

  const work = experience.filter(item => item.section === 'Work')
  const leadership = experience.filter(item => item.section === 'Leadership')

  return <>
    <button type="button" className="recruiter-toggle" onClick={open} aria-haspopup="dialog">
      <BriefcaseBusiness size={15} aria-hidden="true"/><span>Recruiter</span>
    </button>
    <dialog ref={sheet} className="recruiter" aria-labelledby="recruiter-name">
      <div className="recruiter-page">
        <header className="recruiter-head">
          <div>
            <p className="recruiter-kicker">Recruiter view</p>
            <h1 id="recruiter-name">{profile.name}</h1>
            <p className="recruiter-headline">{profile.headline}</p>
          </div>
          <button type="button" className="recruiter-close" onClick={close} aria-label="Close recruiter view" autoFocus><X size={18}/></button>
        </header>

        <ul className="recruiter-contact">
          <li><a href={`mailto:${email}`}>{email}</a></li>
          <li><a href={linkedIn} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true"/></a></li>
          <li><a href={resume} target="_blank" rel="noreferrer" download>Résumé PDF <Download size={14} aria-hidden="true"/></a></li>
          <li>{profile.location}</li>
        </ul>

        <section aria-labelledby="r-summary">
          <h2 id="r-summary">Summary</h2>
          <p>{profile.summary}</p>
        </section>

        <section aria-labelledby="r-education">
          <h2 id="r-education">Education</h2>
          <div className="recruiter-entry">
            <div className="recruiter-line"><h3>{education.school}</h3><span>{education.date}</span></div>
            <div className="recruiter-line recruiter-sub"><span>{education.degree} · GPA {education.gpa}</span><span>{education.place}</span></div>
          </div>
        </section>

        <section aria-labelledby="r-work">
          <h2 id="r-work">Work experience</h2>
          {work.map(item => <Entry key={item.id} title={`${item.role} — ${item.org}`} date={item.date} place={item.place} points={item.points} />)}
        </section>

        <section aria-labelledby="r-leadership">
          <h2 id="r-leadership">Leadership and community</h2>
          {leadership.map(item => <Entry key={item.id} title={`${item.role} — ${item.org}`} date={item.date} place={item.place} points={item.points} />)}
        </section>

        <section aria-labelledby="r-projects">
          <h2 id="r-projects">Projects</h2>
          {projects.map(p => {
            const when = p.details.find(d => d.label === 'When')?.items.join(', ')
            return <div key={p.id} className="recruiter-entry">
              <div className="recruiter-line"><h3>{p.title}</h3>{when && <span>{when}</span>}</div>
              <div className="recruiter-line recruiter-sub">
                <span>{p.kind}{p.stack && ` · ${p.stack.join(', ')}`}</span>
                {p.link && <a href={p.link.href} target="_blank" rel="noreferrer">{p.link.label} <ArrowUpRight size={13} aria-hidden="true"/></a>}
              </div>
              {p.points ? <ul>{p.points.map(point => <li key={point}>{point}</li>)}</ul> : <p>{p.text}</p>}
              <p className="recruiter-figures">{p.figures.map(f => `${f.value} ${f.label}`).join(' · ')}</p>
            </div>
          })}
        </section>

        <section aria-labelledby="r-skills">
          <h2 id="r-skills">Skills</h2>
          <dl className="recruiter-skills">{resumeSkills.map(group => <div key={group.title}><dt>{group.title}</dt><dd>{group.items}</dd></div>)}</dl>
        </section>

        <footer className="recruiter-foot">
          <a href={`mailto:${email}`}>Get in touch <ArrowUpRight size={14} aria-hidden="true"/></a>
          <button type="button" onClick={close}>Back to the site</button>
        </footer>
      </div>
    </dialog>
  </>
}

function Entry({ title, date, place, points }: { title: string, date: string, place: string, points: string[] }) {
  return <div className="recruiter-entry">
    <div className="recruiter-line"><h3>{title}</h3><span>{date}</span></div>
    <div className="recruiter-line recruiter-sub"><span>{place}</span></div>
    <ul>{points.map(point => <li key={point}>{point}</li>)}</ul>
  </div>
}
