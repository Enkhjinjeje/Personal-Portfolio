import type { Metadata } from 'next'
import ProjectField from '../../components/projects/ProjectField'

export const metadata: Metadata = { title: 'Projects' }

export default function ProjectsPage() {
  return <ProjectField />
}
