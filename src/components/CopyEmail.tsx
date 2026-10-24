'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { email } from '../content'

export default function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true); setCopyError(false)
      window.setTimeout(() => setCopied(false), 2500)
    } catch { setCopied(false); setCopyError(true) }
  }

  return <div className="email-group">
    <a href={`mailto:${email}`}>{email}</a>
    <button aria-label="Copy email address" onClick={copy}>{copied ? <Check size={17}/> : <Copy size={17}/>}</button>
    <span className="copy-status" role="status">{copied ? 'Copied!' : copyError ? 'Please copy the email above.' : ''}</span>
  </div>
}
