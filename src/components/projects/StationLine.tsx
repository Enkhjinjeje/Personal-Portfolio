import { projects } from '../../content'
import { pad } from './layout'

// The line of stations along the bottom, like a transit map: one per project, the one in view lit, and a click
// travels to it
export default function StationLine({ here, go }: { here: number, go(i: number): void }) {
  return <nav className="project-line" aria-label="Projects">
    <ol>
      {projects.map((p, i) => <li key={p.id}>
        <button type="button" className={i === here ? 'is-here' : undefined} aria-current={i === here ? 'true' : undefined} onClick={() => go(i)}>
          <span className="station" aria-hidden="true" />
          <span className="station-name"><span className="station-n">{pad(i + 1)}</span>{p.title}</span>
        </button>
      </li>)}
    </ol>
  </nav>
}
