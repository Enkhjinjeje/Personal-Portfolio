import type { CSSProperties } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { projects } from '../../content'
import { pad } from './layout'

// the burst when a project opens: rings of dots that spin out from the middle
const BURST = [{ n: 14, r: 70 }, { n: 22, r: 130 }, { n: 30, r: 200 }, { n: 36, r: 270 }]

export function ProjectBurst() {
  return <div className="project-burst" aria-hidden="true">
    {BURST.flatMap((ring, r) => Array.from({ length: ring.n }, (_, k) =>
      <i key={`${r}-${k}`} style={{ '--a': `${k / ring.n * 360 + r * 9}deg`, '--r': `${ring.r}px`, '--d': `${r * 60}ms` } as CSSProperties} />))}
  </div>
}

// A project opened in the middle of the screen: its site on the left, what it is and what it did on the right
export default function ProjectDetail({ index, onClose }: { index: number, onClose(): void }) {
  const p = projects[index]
  return <div className="project-detail" role="dialog" aria-modal="false" aria-labelledby="project-detail-title">
    <button type="button" className="project-detail-close" aria-label="Close project" onClick={onClose} autoFocus><X size={18}/></button>
    <img className="project-detail-shot" src={p.image} alt={`The ${p.title} home page`} width="960" height="600" decoding="async"/>
    <div className="project-detail-body">
      <p className="projects-label">{pad(index + 1)} · {p.kind}</p>
      <h2 id="project-detail-title">{p.title}</h2>
      <p className="project-detail-text">{p.text}</p>
      <dl className="project-detail-figures">{p.figures.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
      <dl className="project-detail-meta">
        {p.details.map(d => <div key={d.label}><dt>{d.label}</dt><dd>{d.items.join(', ')}</dd></div>)}
        {p.stack && <div><dt>Built with</dt><dd>{p.stack.join(', ')}</dd></div>}
      </dl>
      {p.link && <a className="text-link inline-flex items-center gap-2" href={p.link.href} target="_blank" rel="noreferrer">
        {p.link.label} <ArrowUpRight size={15} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>}
    </div>
  </div>
}
