'use client'

import { useEffect, useState } from 'react'
import { projects } from '../../content'
import { pad } from './layout'
import ProjectDetail, { ProjectBurst } from './ProjectDetail'
import './projects.css'

// The projects on a phone: a plain list that scrolls inside the stage, its top and bottom fading into the dots.
// A tap opens the project the same way the canvas does.
export default function ProjectList() {
  const [open, setOpen] = useState<number | null>(null)

  // Escape closes an open project before it can take you home
  useEffect(() => {
    if (open === null) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); setOpen(null) } }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [open])

  return <section className={`page projects project-list-page ${open !== null ? 'is-showing' : ''}`} aria-labelledby="project-list-heading">
    <div className="project-list">
      <h1 id="project-list-heading" className="page-title project-list-title">Projects.</h1>
      <ol>
        {projects.map((p, i) => <li key={p.id}>
          <button type="button" className="project-row" aria-label={`${p.title}, ${p.kind}`} onClick={() => setOpen(i)}>
            <span className="project-tile-pic">
              <img className="pic-dots" src={p.image} alt="" draggable={false} decoding="async"/>
              <img className="pic-sharp" src={p.image} alt="" draggable={false} decoding="async"/>
              <span className="project-tile-kind">{p.kind}</span>
            </span>
            <span className="project-tile-caption"><span className="project-tile-title">{p.title}</span><span className="project-tile-n">{pad(i + 1)}</span></span>
          </button>
        </li>)}
      </ol>
    </div>
    {open !== null && <ProjectBurst key={open} />}
    {open !== null && <ProjectDetail index={open} onClose={() => setOpen(null)} />}
  </section>
}
