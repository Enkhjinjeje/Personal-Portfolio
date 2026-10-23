'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { email, linkedIn, resume } from '../../content'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true); setCopyError(false)
      window.setTimeout(() => setCopied(false), 2500)
    } catch { setCopied(false); setCopyError(true) }
  }

  return <section className="contact-section shell" id="contact" aria-labelledby="contact-heading">
    <a className="contact-title" href={`mailto:${email}`}><h2 id="contact-heading">Let’s make<br/>something matter.</h2><ArrowUpRight aria-hidden="true"/></a>
    <p className="contact-intro">Have a project, a question, or a different perspective?</p>
    <div className="contact-links">
      <div className="email-group">
        <a href={`mailto:${email}`}>{email}</a>
        <button aria-label="Copy email address" onClick={copyEmail}>{copied ? <Check size={17}/> : <Copy size={17}/>}</button>
        <span className="copy-status" role="status">{copied ? 'Copied!' : copyError ? 'Please copy the email above.' : ''}</span>
      </div>
      <a href={linkedIn} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={17}/></a>
      <a href={resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={17}/></a>
    </div>
  </section>
}
