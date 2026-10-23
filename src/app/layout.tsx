import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/manrope'
import '../style.css'

const title = 'Jeje — Developer & community builder'
const description = 'Enkhjin ‘Jeje’ Chuluunkhuu — computer science student, developer, and community builder. Explore my work in software, culture, and connection.'

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: '/favicon.svg' },
  // the preview card when the link is shared
  openGraph: { title, description, type: 'website', siteName: 'jeje.' },
  twitter: { card: 'summary', title, description },
}

export const viewport: Viewport = { themeColor: '#121211' }

// Apply a saved theme before first paint, so there is no flash of the wrong background (night is the default),
// and mark that script runs, so the wordmark's plain text can make way for its dots
const themeScript = `document.documentElement.classList.add('js');try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch{}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    {/* browser extensions (Grammarly, ColorZilla and others) add attributes to <body> before React loads */}
    <body suppressHydrationWarning>{children}</body>
  </html>
}
