import { ArrowUpRight, Minus, Plus } from 'lucide-react'
import { experience, resume, skills } from '../../content'

export default function Experience() {
  return <section className="experience-section shell" id="experience" aria-labelledby="experience-heading">
    <div className="section-heading"><h2 id="experience-heading">Along the way.</h2><a className="text-link inline-flex items-center gap-2" href={resume} target="_blank" rel="noreferrer">Full résumé <ArrowUpRight size={16}/></a></div>
    <div>{experience.map(item => <details className="experience-row" id={item.id} key={item.id}>
      <summary><span className="experience-date">{item.date}</span><span className="experience-role"><strong>{item.company}</strong><span>{item.role}</span></span><Plus className="expand-icon" size={21}/><Minus className="collapse-icon" size={21}/></summary>
      <div className="experience-description"><p>{item.description}</p><p>{item.detail}</p></div>
    </details>)}</div>
    <div className="education"><h3>Always learning.</h3><div><p>University of Washington</p><p className="text-secondary">Bachelor of Computer Science · Expected June 2028</p></div></div>
    <div className="skills">
      <h3>Things I work with.</h3>
      <div className="skills-grid">{skills.map(group => <div key={group.title}><h4>{group.title}</h4><p>{group.items}</p></div>)}</div>
    </div>
  </section>
}
