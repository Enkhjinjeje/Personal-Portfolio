import type { Metadata } from 'next'
import ProjectScroll from '../../components/projects/ProjectScroll'

export const metadata: Metadata = { title: 'Projects' }

export default function ProjectsPage() {
  return <ProjectScroll />
}
