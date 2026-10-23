import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/manrope'
import '../style.css'

export const metadata: Metadata = {
  title: 'Jeje — Developer & community builder',
  description: 'Enkhjin ‘Jeje’ Chuluunkhuu — computer science student, developer, and community builder. Explore my work in software, culture, and connection.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = { themeColor: '#121211' }

// Apply a saved theme before first paint, so there is no flash of the wrong background (night is the default)
const themeScript = `try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch{}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    {/* browser extensions (Grammarly, ColorZilla and others) add attributes to <body> before React loads */}
    <body suppressHydrationWarning>{children}</body>
  </html>
}
