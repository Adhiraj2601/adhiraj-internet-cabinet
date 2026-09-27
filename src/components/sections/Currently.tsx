import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

const currentlyData = [
  {
    label: 'Learning',
    items: ['AI / ML', 'GenAI', 'Graph theory'],
  },
  {
    label: 'Building',
    items: ['LoreGraph', 'UNOchess', 'PyCasso'],
  },
  {
    label: 'Reading',
    items: ['The Three-Body Problem', 'Children of Time', 'Mistborn'],
  },
  {
    label: 'Exploring',
    items: ['Games', 'Worldbuilding', 'Creative coding'],
  },
]

export function Currently() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      id="currently"
      ref={ref}
      className="py-20 md:py-28"
      aria-labelledby="currently-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section header */}
          <motion.div variants={fadeUp} className="mb-12 md:mb-16">
            <SectionLabel>Right now</SectionLabel>
            <h2
              id="currently-heading"
              className="mt-3 font-bold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: 'var(--foreground)' }}
            >
              Currently
            </h2>
          </motion.div>

          {/* Four columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
            {currentlyData.map((col, i) => (
              <motion.div
                key={col.label}
                variants={fadeUp}
                custom={i}
                className="flex flex-col gap-4"
              >
                <p
                  className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
                  style={{ color: 'var(--accent)' }}
                >
                  {col.label}
                </p>
                <ul className="space-y-2" role="list">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="text-[0.95rem] md:text-[1rem] leading-snug"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Handwritten note */}
          <motion.p
            variants={fadeUp}
            className="mt-12 font-handwritten text-[1.2rem]"
            style={{ color: 'var(--muted)', transform: 'rotate(-1deg)', display: 'inline-block' }}
            aria-hidden="true"
          >
            subject to change without notice
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
