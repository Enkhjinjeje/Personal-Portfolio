import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import WorkDial from '../../components/WorkDial'
import { resume } from '../../content'

export const metadata: Metadata = { title: 'Work experience' }

export default function WorkPage() {
  return <section className="page work" aria-labelledby="work-heading">
    <div className="work-intro">
      <h1 id="work-heading" className="page-title">Work experience.</h1>
      <p className="work-lead">Jobs, and the communities I’ve built, newest first.</p>
    </div>
    <WorkDial />
    <div className="work-foot">
      <p className="education"><strong>University of Washington</strong> Bachelor of Computer Science · Expected June 2028</p>
      <a className="text-link inline-flex items-center gap-2" href={resume} target="_blank" rel="noreferrer">Full résumé <ArrowUpRight size={16}/></a>
    </div>
  </section>
}
