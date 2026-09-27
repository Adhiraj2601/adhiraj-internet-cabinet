import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { projects } from '../../content/projects'
import { ProjectCard } from './ProjectCard'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

const layouts = ['text-left', 'text-right', 'full-width', 'large-text', 'text-left', 'text-right', 'large-text'] as const

export function Projects() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.05 })

  return (
    <section
      id="work"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="projects-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="mb-6 md:mb-10">
            <SectionLabel>02 / Work</SectionLabel>
            <h2
              id="projects-heading"
              className="mt-3 font-bold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              Things I've made
            </h2>
          </motion.div>

          {/* Projects list */}
          <motion.div variants={stagger}>
            {projects.map((project, index) => (
              <motion.div key={project.id} variants={fadeUp}>
                <ProjectCard
                  project={project}
                  index={index}
                  layout={layouts[index % layouts.length]}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
