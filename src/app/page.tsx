import { preload } from 'react-dom'
import HomeHero from '../components/HomeHero'

export default function HomePage() {
  // the portrait is drawn into the dot field once it loads; start fetching it with the page, not after hydration
  preload('/portrait-cutout.webp', { as: 'image', fetchPriority: 'high' })
  return <HomeHero />
}
