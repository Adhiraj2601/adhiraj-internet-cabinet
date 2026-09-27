import { Hero } from '../components/sections/Hero'
import { About } from '../components/sections/About'
import { Currently } from '../components/sections/Currently'
import { Projects } from '../components/sections/Projects'
import { Notes } from '../components/sections/Notes'
import { Books } from '../components/sections/Books'
import { Scrapbook } from '../components/sections/Scrapbook'
import { Lab } from '../components/sections/Lab'

export function Home() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <Currently />
      <Projects />
      <Notes />
      <Books />
      <Scrapbook />
      <Lab />
    </main>
  )
}
