import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import CopyEmail from '../../components/CopyEmail'
import { email, linkedIn, resume } from '../../content'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return <section className="page contact" aria-labelledby="contact-heading">
    <a className="contact-title" href={`mailto:${email}`}><h1 id="contact-heading" className="page-title">Let’s make<br/>something matter.</h1><ArrowUpRight aria-hidden="true"/></a>
    <p className="contact-intro">Have a project, a question, or a different perspective?</p>
    <div className="contact-links">
      <CopyEmail />
      <a href={linkedIn} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17}/></a>
      <a href={resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={17}/></a>
    </div>
    <p className="contact-foot">© {new Date().getFullYear()} Enkhjin Chuluunkhuu · Based in Bothell, Washington · Made with curiosity.</p>
  </section>
}
