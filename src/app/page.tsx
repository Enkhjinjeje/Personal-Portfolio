import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import Hero from '../components/sections/Hero'
import Intro from '../components/sections/Intro'
import Work from '../components/sections/Work'
import About from '../components/sections/About'
import Community from '../components/sections/Community'
import Experience from '../components/sections/Experience'
import Contact from '../components/sections/Contact'

// A server component: only the header, the hero, the intro's words, Curious Mind and the contact links hydrate
export default function HomePage() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main">
      <Hero />
      <Intro />
      <Work />
      <About />
      <Community />
      <Experience />
      <Contact />
    </main>
    <SiteFooter />
  </>
}
