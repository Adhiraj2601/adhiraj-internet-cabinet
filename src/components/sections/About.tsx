import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

export function About() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="about-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
            {/* Left: heading */}
            <motion.div variants={fadeUp} className="md:col-span-4">
              <SectionLabel>01 / About</SectionLabel>
              <h2
                id="about-heading"
                className="mt-3 font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              >
                About
              </h2>
            </motion.div>

            {/* Right: text */}
            <div className="md:col-span-8">
              <motion.p
                variants={fadeUp}
                className="text-[1.15rem] md:text-[1.3rem] leading-relaxed font-light"
                style={{ color: 'var(--foreground)' }}
              >
                I'm Adhiraj.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-6 space-y-4 max-w-xl">
                <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  I'm a computer science student interested in AI, creative coding, games, books and strange ideas.
                </p>
                <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Sometimes I build useful things.
                </p>
                <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Sometimes I build things just because I want to know if I can.
                </p>
                <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  I tend to get obsessed with things — graphs, worldbuilding, chess engines, procedural generation, whatever book I'm reading — and then build something because of it.
                </p>
                <p className="text-[1rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  This website is a collection of those obsessions.
                </p>
              </motion.div>

              {/* Handwritten annotation */}
              <motion.p
                variants={fadeUp}
                className="mt-10 font-handwritten text-[1.3rem]"
                style={{ color: 'var(--muted)', transform: 'rotate(-1deg)', display: 'inline-block' }}
                aria-hidden="true"
              >
                currently based somewhere with good wifi
              </motion.p>

              {/* Contact links */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-6">
                <a
                  href="https://github.com/adhirajsengar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-[0.8rem] font-semibold tracking-widest uppercase hover:text-accent transition-colors duration-200"
                >
                  <span>GitHub</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">↗</span>
                </a>
                <a
                  href="https://linkedin.com/in/adhirajsengar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-[0.8rem] font-semibold tracking-widest uppercase hover:text-accent transition-colors duration-200"
                >
                  <span>LinkedIn</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">↗</span>
                </a>
                <a
                  href="mailto:adhiraj@example.com"
                  className="group flex items-center gap-2 text-[0.8rem] font-semibold tracking-widest uppercase hover:text-accent transition-colors duration-200"
                >
                  <span>Email</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
