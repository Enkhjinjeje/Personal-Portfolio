'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

// keep in step with the pre-paint script in app/layout.tsx
const themeStorageKey = 'theme'

// Night is the default; a saved choice (data-theme on <html>) overrides it
const currentTheme = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

// Light/dark switch, as in the dualscroll demo: sets data-theme on <html> and remembers the choice. The icons
// swap in CSS, so the first paint already shows the right one.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null)

  useEffect(() => { setTheme(currentTheme()) }, [])

  function toggle() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(themeStorageKey, next) } catch {}
    setTheme(next)
  }

  return <button className="theme-toggle" type="button" onClick={toggle}
    aria-label={theme ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Switch color theme'}>
    <Moon className="icon-moon" size={17}/><Sun className="icon-sun" size={17}/>
  </button>
}
