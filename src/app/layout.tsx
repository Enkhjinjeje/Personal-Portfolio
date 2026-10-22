import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/manrope'
import '../style.css'

export const metadata: Metadata = {
  title: 'Jeje — Developer & community builder',
  description: 'Enkhjin ‘Jeje’ Chuluunkhuu — computer science student, developer, and community builder. Explore my work in software, culture, and connection.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = { themeColor: '#ffffff' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
