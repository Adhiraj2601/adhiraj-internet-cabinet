import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { experiments, type ExperimentStatus } from '../../content/experiments'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

const statusStyles: Record<ExperimentStatus, { label: string; color: string }> = {
  EXPERIMENT: { label: 'EXPERIMENT', color: 'var(--accent)' },
  WIP: { label: 'WIP', color: '#E8A838' },
  IDEA: { label: 'IDEA', color: 'var(--muted)' },
  ABANDONED: { label: 'ABANDONED', color: 'rgba(23,23,23,0.35)' },
  PLAYING: { label: 'PLAYING', color: '#4CAF77' },
}

export function Lab() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section
      id="lab"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="lab-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8 md:mb-12">
            <SectionLabel>06 / Lab</SectionLabel>
            <h2
              id="lab-heading"
              className="mt-3 font-bold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              Unfinished things
            </h2>
            <p className="mt-4 text-[0.9rem] text-muted max-w-sm leading-relaxed">
              not every idea becomes a project. some become experiments. some just become notes.
            </p>
          </motion.div>

          {/* Experiments grid */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {experiments.map((exp, index) => (
              <motion.article
                key={exp.id}
                variants={fadeUp}
                custom={index}
                className="flex flex-col gap-3 p-6"
                style={{ border: '1px solid var(--border)' }}
                whileHover={{
                  borderColor: 'rgba(23,23,23,0.3)',
                  y: -3,
                  transition: { duration: 0.25 },
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-[0.65rem] font-bold tracking-[0.2em] uppercase"
                    style={{ color: statusStyles[exp.status].color }}
                  >
                    {statusStyles[exp.status].label}
                  </span>
                  <span className="text-[0.65rem] tracking-widest text-muted">{exp.year}</span>
                </div>
                <h3 className="font-semibold text-[1rem] leading-snug">{exp.title}</h3>
                <p className="text-[0.85rem] text-muted leading-relaxed flex-1">{exp.description}</p>
                {(exp.github || exp.link) && (
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {exp.github && (
                      <a
                        href={exp.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.7rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200"
                      >
                        ↗ GITHUB
                      </a>
                    )}
                    {exp.link && (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.7rem] font-semibold tracking-widest hover:text-accent transition-colors duration-200"
                      >
                        ↗ DEMO
                      </a>
                    )}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-10 font-handwritten text-[1.1rem]"
            style={{ color: 'var(--muted)', transform: 'rotate(-1deg)', display: 'inline-block' }}
            aria-hidden="true"
          >
            probably going to rebuild some of these
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
