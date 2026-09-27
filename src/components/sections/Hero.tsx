import { motion } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'
import { InteractiveAvatar } from '../ui/InteractiveAvatar'

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
      className="relative min-h-[90vh] flex flex-col justify-end pb-16 md:pb-24 pt-28 md:pt-36"
      aria-label="Introduction"
    >
      <div className="container-main w-full">
        {/* Small metadata label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8 md:mb-12"
        >
          <SectionLabel>Personal Internet Cabinet / 2026</SectionLabel>
        </motion.div>

        {/* 2-column editorial grid: Intro on left, Image Placeholder on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Supporting Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
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
                      fontSize: 'clamp(3.5rem, 8vw, 8.5rem)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {line.text}
                  </motion.h1>
                </div>
              ))}
            </div>

            {/* Supporting text */}
            <div className="mt-8 md:mt-10">
              {supportingLines.map((line) => (
                <motion.p
                  key={line.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: line.delay, ease: 'easeOut' }}
                  className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                  style={{ color: 'var(--muted)' }}
                >
                  {line.text}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Right Column: Profile Picture with Interactive Easter Egg */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="relative group" style={{ overflow: 'visible' }}>
              {/* Handwritten tape note on top */}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-handwritten text-[1.1rem] text-muted rotate-[-2deg] inline-block">
                  welcome to my little corner ↗
                </span>
                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-medium">
                  FIG. 01 / ARTIFACT
                </span>
              </div>

              {/* Interactive Avatar Component */}
              <InteractiveAvatar
                initialImageSrc="/images/hero.jpg"
                alt="Adhiraj Sengar"
                videoSrc="/media/Screen%20Recording%202026-09-27%20172220.mp4"
                aspectRatio="4/3"
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 md:mt-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="flex items-center gap-2"
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
