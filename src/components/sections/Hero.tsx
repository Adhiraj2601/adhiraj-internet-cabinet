import { motion } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'

const heroLines = [
  { text: "hey,", delay: 0.55 },
  { text: "i'm adi.", delay: 0.7 },
]

const supportingLines = [
  { text: "i build things,", delay: 0.9 },
  { text: "collect ideas,", delay: 1.0 },
  { text: "read too many books", delay: 1.1 },
  { text: "and occasionally draw.", delay: 1.2 },
]

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex flex-col justify-end pb-16 md:pb-24"
      aria-label="Introduction"
    >
      <div className="container-main w-full">
        {/* Small metadata label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-12 md:mb-16"
        >
          <SectionLabel>Personal Internet Cabinet / 2026</SectionLabel>
        </motion.div>

        {/* Large hero text */}
        <div className="overflow-hidden">
          {heroLines.map((line) => (
            <div key={line.text} className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.75,
                  delay: line.delay,
                  ease: [0.76, 0, 0.24, 1],
                }}
                className="leading-none font-bold tracking-tighter"
                style={{
                  fontSize: 'clamp(3.5rem, 10vw, 10rem)',
                  color: 'var(--foreground)',
                }}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Supporting text + scroll indicator */}
        <div className="mt-10 md:mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            {supportingLines.map((line) => (
              <motion.p
                key={line.text}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: line.delay, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                {line.text}
              </motion.p>
            ))}
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="flex items-center gap-2 self-end md:self-auto"
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[0.75rem] tracking-widest text-muted font-medium"
            >
              scroll ↓
            </motion.span>
          </motion.div>
        </div>

        {/* Decorative handwritten annotation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="absolute right-8 top-[30%] hidden xl:block"
          aria-hidden="true"
        >
          <span
            className="font-handwritten text-[1.1rem] rotate-[-4deg] inline-block"
            style={{ color: 'var(--muted)', transform: 'rotate(-4deg)' }}
          >
            welcome to my little corner ↗
          </span>
        </motion.div>
      </div>

      {/* Bottom border rule */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3, ease: [0.76, 0, 0.24, 1] }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left"
        style={{ background: 'var(--border)' }}
        aria-hidden="true"
      />
    </section>
  )
}
