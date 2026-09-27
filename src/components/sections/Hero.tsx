import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'

const heroLines = [
  { text: "hey,", delay: 0.55 },
  { text: "i'm adi.", delay: 0.7 },
]

const supportingLines = [
  { text: "welcome to my Space :>", delay: 0.9 },
  { text: "i build things,", delay: 1.0 },
  { text: "collect ideas,", delay: 1.1 },
  { text: "read too many books", delay: 1.2 },
  { text: "and occasionally draw.", delay: 1.3 },
]

// Animation phases:
// 0 = idle (showing hero image, cat hidden)
// 1 = cat peeks in from top-left corner
// 2 = cat slides/rotates toward center
// 3 = cat taps image (bounce)
// 4 = image replaced by YouTube video, cat hides

const YOUTUBE_ID = 'IxX_QHay02M'

export function Hero() {
  const [heroSrc, setHeroSrc] = useState('/images/hero.jpg')
  const [imgError, setImgError] = useState(false)
  const [phase, setPhase] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const handleImgError = () => {
    if (heroSrc === '/images/hero.jpg') {
      setHeroSrc('/images/hero.jpg.png')
    } else if (heroSrc === '/images/hero.jpg.png') {
      setHeroSrc('/images/hero.png')
    } else {
      setImgError(true)
    }
  }

  // Auto-start the cat sequence after 2.5s (after page load animations settle)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500)   // cat peeks in
    const t2 = setTimeout(() => setPhase(2), 4000)   // cat glides to center
    const t3 = setTimeout(() => setPhase(3), 5800)   // cat taps image
    const t4 = setTimeout(() => {                     // video replaces image
      setPhase(4)
      setShowVideo(true)
    }, 6800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  // Cat position / transform per phase
  const catVariants = {
    hidden: {
      opacity: 0,
      x: '-120%',
      y: '-120%',
      rotate: -120,
      scale: 0.4,
    },
    peek: {
      opacity: 1,
      x: '-45%',
      y: '-42%',
      rotate: -75,
      scale: 0.65,
      transition: { duration: 1.1, ease: 'easeOut' as const },
    },
    glide: {
      opacity: 1,
      x: '-8%',
      y: '-10%',
      rotate: -15,
      scale: 0.9,
      transition: { type: 'spring' as const, stiffness: 80, damping: 14 },
    },
    tap: {
      opacity: 1,
      x: '-8%',
      y: '2%',
      rotate: -8,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 320, damping: 18 },
    },
    hide: {
      opacity: 0,
      x: '120%',
      y: '-80%',
      rotate: 40,
      scale: 0.3,
      transition: { duration: 0.5, ease: 'easeIn' as const },
    },
  }

  const phaseMap: Record<number, string> = {
    0: 'hidden',
    1: 'peek',
    2: 'glide',
    3: 'tap',
    4: 'hide',
  }

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

        {/* 2-column editorial grid: Intro on left, Image on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
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

          {/* Right Column: Image + Cat Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="relative group">
              {/* Handwritten tape note */}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-handwritten text-[1.1rem] text-muted rotate-[-2deg] inline-block">
                  welcome to my little corner{' '}
                </span>
                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-medium">
                  FIG. 01 / ARTIFACT
                </span>
              </div>

              {/* Main Image Frame — position:relative so cat is anchored to it */}
              <motion.div
                whileHover={
                  !showVideo
                    ? {
                        scale: 1.02,
                        boxShadow: '0 14px 40px rgba(23,23,23,0.08)',
                        transition: { duration: 0.3, ease: 'easeOut' },
                      }
                    : {}
                }
                className="relative overflow-visible border border-token bg-[rgba(23,23,23,0.02)] p-2 md:p-3"
                style={{
                  aspectRatio: '4/3',
                  boxShadow: '0 4px 20px rgba(23,23,23,0.04)',
                }}
              >
                {/* Inner clipped frame */}
                <div className="w-full h-full overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {!showVideo ? (
                      /* ── HERO IMAGE ── */
                      <motion.div
                        key="hero-img"
                        className="w-full h-full"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.04 }}
                        transition={{ duration: 0.5 }}
                      >
                        {!imgError ? (
                          <img
                            src={heroSrc}
                            alt="Adhiraj Sengar"
                            className="w-full h-full object-cover"
                            onError={handleImgError}
                          />
                        ) : (
                          <div className="w-full h-full border border-dashed border-token flex flex-col items-center justify-center p-6 text-center">
                            <svg
                              width="36"
                              height="36"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted mb-3 opacity-60"
                            >
                              <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                              <circle cx="12" cy="12" r="3" />
                              <path d="M12 9v6M9 12h6" />
                            </svg>
                            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-foreground">
                              Photo / Portrait
                            </p>
                            <p className="text-[0.7rem] text-muted font-mono mt-1">
                              public/images/hero.jpg
                            </p>
                            <p className="font-handwritten text-[0.95rem] text-muted mt-2">
                              photo, sketch, or artifact
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* ── YOUTUBE VIDEO ── */
                      <motion.div
                        key="youtube"
                        className="w-full h-full"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                          title="YouTube video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          style={{ border: 'none' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── CAT ── positioned absolute relative to the outer frame div */}
                <motion.div
                  className="absolute pointer-events-none"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: '55%',
                    zIndex: 20,
                    transformOrigin: 'center center',
                  }}
                  variants={catVariants}
                  animate={phaseMap[phase]}
                  initial="hidden"
                >
                  <img
                    src="/images/cat.png"
                    alt="sneaky cat"
                    className="w-full h-auto drop-shadow-lg"
                    style={{
                      mixBlendMode: 'multiply', // removes white background naturally
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Click-to-replay hint after video plays */}
              {showVideo && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => {
                    setShowVideo(false)
                    setPhase(0)
                    setTimeout(() => {
                      setPhase(1)
                      setTimeout(() => setPhase(2), 1500)
                      setTimeout(() => setPhase(3), 3300)
                      setTimeout(() => { setPhase(4); setShowVideo(true) }, 4300)
                    }, 800)
                  }}
                  className="mt-3 w-full text-center text-[0.7rem] font-mono text-muted hover:text-foreground transition-colors"
                >
                  ↺ replay cat animation
                </motion.button>
              )}
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
