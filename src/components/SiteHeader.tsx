'use client'

import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { navigation } from '../content'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return <header className="site-header shell" id="top">
    <a className="brand" href="#top" aria-label="Jeje, home">jeje<span className="brand-dot">.</span></a>
    <nav className="desktop-nav flex items-center gap-8" aria-label="Main navigation">
      {navigation.map(label => <a key={label} href={`#${label.toLowerCase()}`}>{label}</a>)}
    </nav>
    <div className="header-actions">
      <a className="header-contact inline-flex items-center gap-3" href="#contact">Let’s talk <ArrowUpRight size={18}/></a>
      <ThemeToggle />
      <button className="menu-button" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div>
    {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" onKeyDown={e => { if (e.key === 'Escape') { closeMenu(); document.querySelector<HTMLButtonElement>('.menu-button')?.focus() } }}>
      {[...navigation, 'Contact'].map(label => <a key={label} href={`#${label.toLowerCase()}`} onClick={closeMenu}>{label}<ArrowUpRight size={20}/></a>)}
    </nav>}
  </header>
}
