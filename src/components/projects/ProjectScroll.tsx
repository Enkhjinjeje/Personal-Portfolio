'use client'

import { ArrowUpRight } from 'lucide-react'
import { projects } from '../../content'
import { useStageLoop } from './useStageLoop'
import ScrollNumber from './ScrollNumber'
import './projects.css'

const pad = (n: number) => String(n).padStart(2, '0')

// The Imagescroll layout with project cards in place of images: scrolling turns the list, the cards travel along
// a diagonal, the descriptions on the right roll with them, and the details of the project in view sit on the left
export default function ProjectScroll() {
  const count = projects.length
  const { rootRef, stageRef, activeIndex: active, progress, reducedMotion: reduced, width, offsetFor, onKeyDown, span, next, previous } =
    useStageLoop({ count, scrollPerItem: .9 })
  const mobile = width > 0 && width < 768
  const current = projects[active]

  return <section ref={rootRef} className="projects" style={{ height: `calc(var(--stage-h) * ${span})` }} aria-labelledby="projects-heading">
    <div ref={stageRef} className="projects-stage" tabIndex={0} onKeyDown={onKeyDown} aria-roledescription="carousel" aria-label="Projects, scroll or use the arrow keys">
      <h1 id="projects-heading" className="page-title projects-title">Projects.</h1>
      <p className="projects-hint" aria-hidden="true">Scroll to explore</p>

      <aside className="projects-meta" aria-live="polite" aria-atomic="true">
        {current.details.map(d => <div key={d.label}><p className="projects-label">{d.label}</p>{d.items.map(item => <p key={item}>{item}</p>)}</div>)}
        {current.stack && <div><p className="projects-label">Built with</p><p>{current.stack.join(', ')}</p></div>}
      </aside>

      <div className="projects-cards">
        {projects.map((p, i) => {
          const offset = offsetFor(i), on = i === active
          return <article key={p.id} className={`project-card ${on ? 'is-active' : ''}`} aria-hidden={!on}
            style={{
              transform: `translate(-50%, -50%) translate(${offset * (mobile ? -60 : -150)}px, ${offset * (mobile ? 330 : 400)}px) rotate(${reduced ? 0 : offset * 7}deg)`,
              visibility: Math.abs(offset) > 2.35 || (reduced && !on) ? 'hidden' : 'visible',
            }}>
            <p className="project-card-top"><span>{pad(i + 1)}</span><span>{p.kind}</span></p>
            <h2 className="project-card-title">{p.title}</h2>
            <dl className="project-card-figures">{p.figures.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
            {p.link && <a className="project-card-link" href={p.link.href} target="_blank" rel="noreferrer" tabIndex={on ? 0 : -1}>
              {p.link.label} <ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>}
          </article>
        })}
      </div>

      <div className="projects-text">
        {projects.map((p, i) => {
          const offset = offsetFor(i), on = i === active
          return <article key={p.id} aria-hidden={!on}
            style={{
              transform: `translateY(calc(-50% + ${offset * 170}px))`,
              opacity: reduced ? Number(on) : Math.max(.14, 1 - Math.abs(offset) * .86),
              visibility: Math.abs(offset) > 2.4 || (mobile && !on) ? 'hidden' : 'visible',
            }}>
            <p className="projects-label">{p.kind}</p><p className="projects-text-title">{p.title}</p><p className="projects-dash" aria-hidden="true">—</p><p>{p.text}</p>
          </article>
        })}
      </div>

      <div className="projects-count">
        <span className="projects-label">Selected work</span>
        <ScrollNumber count={count} progress={progress} className="projects-number" />
        <span className="projects-label">/{pad(count)}</span>
      </div>
      <div className="projects-steps">
        <button type="button" onClick={previous}>← Previous</button>
        <button type="button" onClick={next}>Next →</button>
      </div>
    </div>
  </section>
}
