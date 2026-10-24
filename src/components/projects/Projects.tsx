'use client'

import { useEffect, useState } from 'react'
import ProjectField from './ProjectField'
import ProjectList from './ProjectList'

const PHONE = '(max-width:700px)'

// A phone gets the list, anything wider the canvas. The first render has both and the stylesheet shows the one that
// fits, so there is no flash before script runs; after that only the one in use stays mounted.
export default function Projects() {
  const [phone, setPhone] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia(PHONE)
    const update = () => setPhone(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return <>
    {phone !== true && <ProjectField />}
    {phone !== false && <ProjectList />}
  </>
}
