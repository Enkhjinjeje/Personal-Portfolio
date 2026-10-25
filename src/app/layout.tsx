import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Manrope } from 'next/font/google'
import '../style.css'
import FieldProvider from '../components/field/FieldProvider'
import { preload } from 'react-dom'
import CornerNav from '../components/CornerNav'
import ThemeToggle from '../components/ThemeToggle'
import portrait from '../assets/portrait-cutout.webp'

// self-hosted and preloaded at build time, with a fallback sized to match, so the text doesn't jump when it loads
const manrope = Manrope({ subsets: ['latin', 'latin-ext'], variable: '--font-manrope', display: 'swap' })

const title = 'Jeje — Developer & community builder'
const description = 'Enkhjin ‘Jeje’ Chuluunkhuu — computer science student, developer, and community builder. Explore my work in software, culture, and connection.'

export const metadata: Metadata = {
  title: { default: title, template: '%s — Jeje' },
  description,
  icons: { icon: '/favicon.svg' },
  // the preview card when the link is shared
  openGraph: { title, description, type: 'website', siteName: 'jeje.' },
  twitter: { card: 'summary', title, description },
}

export const viewport: Viewport = { themeColor: '#0e0e0f' }

// Apply a saved theme before first paint, so there is no flash of the wrong background (night is the default),
// and mark that script runs, so the wordmark's plain text can make way for the field
const themeScript = `document.documentElement.classList.add('js');try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch{}`

// One screen, no page scroll: the field behind, the four pages in the corners, the current page between them
export default function RootLayout({ children }: { children: ReactNode }) {
  // the field loads the portrait from script; fetch it with the page instead of after the scripts have run
  preload(portrait.src, { as: 'image', type: 'image/webp', fetchPriority: 'high' })
  return <html lang="en" className={manrope.variable} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    {/* browser extensions (Grammarly, ColorZilla and others) add attributes to <body> before React loads */}
    <body suppressHydrationWarning>
      {/* covers the page until the fonts, the portrait and the page's images are in; only shown when script runs */}
      <div className="loader" aria-hidden="true"><i /><i /><i /></div>
      <FieldProvider>
        <a className="skip-link" href="#main">Skip to content</a>
        <CornerNav />
        <div className="top-center"><ThemeToggle /></div>
        <main id="main" className="stage">{children}</main>
      </FieldProvider>
    </body>
  </html>
}
