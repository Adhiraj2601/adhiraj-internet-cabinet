import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../ui/SectionLabel'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import './Hero.css'

const heroLines = [
  { text: "hey,", delay: 0.55 },
  { text: "i'm adi.", delay: 0.7 },
]

/**
 * ADDITION 1: Interactive Hero Copy Link Component
 * Turns supporting phrases into subtle interactive gateways to /blog, /books, and /sketches.
 * - 1px underline in green accent (#7EA84D, offset 4px)
 * - 180ms hover/focus transition where text turns dark green (#477224, WCAG AA compliant)
 *   and underline thickens to 2px
 * - Small "↗" indicator slides and fades into place on hover/focus with 0 layout shift
 * - Always-visible underline on touch screens where hover does not exist
 * - High-contrast focus-visible outline for keyboard navigation accessibility
 */
interface HeroCopyLinkProps {
  to: string
  children: React.ReactNode
}

function HeroCopyLink({ to, children }: HeroCopyLinkProps) {
  return (
    <Link to={to} className="hero-copy-link group">
      <span>{children}</span>
      <span className="hero-copy-link-arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  )
}

export function Hero() {
  const [imgError, setImgError] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleImgError = () => {
    setImgError(true)
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
          <SectionLabel>Adi's Archive / 2026</SectionLabel>
        </motion.div>

        {/* 2-column editorial grid: Intro on left, Image Placeholder on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Supporting Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Large hero text */}
            <h1
              className="leading-none font-bold tracking-tighter"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 8.5rem)',
                color: 'var(--foreground)',
              }}
            >
              {heroLines.map((line) => (
                <span key={line.text} className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.75,
                      delay: line.delay,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                    className="block"
                  >
                    {line.text === "i'm adi." ? (
                      <>
                        i'm <span style={{ color: '#A8CB7C' }}>adi.</span>
                      </>
                    ) : (
                      line.text
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Supporting text with interactive section links (ADDITION 1) */}
            <div className="mt-8 md:mt-10">
              {/* Line 1: Welcome message */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9, ease: 'easeOut' }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                welcome to my Space :&gt;
              </motion.p>

              {/* Line 2: What I build */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0, ease: 'easeOut' }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                i build things,
              </motion.p>

              {/* Line 3: "collect ideas" links to /blog */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1, ease: 'easeOut' }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                <HeroCopyLink to="/blog">collect ideas</HeroCopyLink>,
              </motion.p>

              {/* Line 4: "read too many books" links to /books */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2, ease: 'easeOut' }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                <HeroCopyLink to="/books">read too many books</HeroCopyLink>
              </motion.p>

              {/* Line 5: "occasionally draw" links to /sketches */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3, ease: 'easeOut' }}
                className="text-[1.05rem] md:text-[1.15rem] leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                and <HeroCopyLink to="/sketches">occasionally draw</HeroCopyLink>.
              </motion.p>
            </div>
          </div>

          {/* Right Column: Editorial Image */}
          <motion.div
            initial={{ opacity: 0.9, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="relative group">
              {/* Handwritten tape note on top + Hand-drawn Nudge Arrow (ADDITION 2) */}
              <div className="flex justify-between items-center mb-2 px-1">
                <div className="relative inline-flex items-center">
                  <span className="font-handwritten text-[1.1rem] text-muted rotate-[-2deg] inline-block">
                    welcome to my little corner{' '}
                  </span>

                  {/* ADDITION 2: Handwritten nudge arrow toward hero copy links
                      - Hand-drawn style SVG with 1.5px stroke in green accent (#7EA84D)
                      - Swoops gently down and left from the tape note toward the hero copy links
                      - Draws in once on page load using stroke-dashoffset (pathLength) animation
                      - Hidden on narrow viewports (hidden lg:block) where columns stack vertically */}
                  <div
                    className="hidden lg:block absolute pointer-events-none -left-28 -top-3 w-28 h-16 hero-nudge-arrow-wrap"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 110 60"
                      fill="none"
                      className="w-full h-full overflow-visible"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Arrow shaft: smooth organic curve toward left column links */}
                      <motion.path
                        d="M 102 12 C 78 8, 46 22, 12 42"
                        stroke="#7EA84D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{
                          pathLength: prefersReducedMotion ? 1 : 0,
                          opacity: prefersReducedMotion ? 1 : 0,
                        }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          pathLength: prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.85, delay: 1.4, ease: [0.65, 0, 0.35, 1] },
                          opacity: prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.15, delay: 1.4 },
                        }}
                      />
                      {/* Arrowhead barbs: flicking in as the shaft completes */}
                      <motion.path
                        d="M 23 33 L 12 42 L 20 52"
                        stroke="#7EA84D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{
                          pathLength: prefersReducedMotion ? 1 : 0,
                          opacity: prefersReducedMotion ? 1 : 0,
                        }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          pathLength: prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.3, delay: 2.15, ease: 'easeOut' },
                          opacity: prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.1, delay: 2.15 },
                        }}
                      />
                    </svg>
                  </div>
                </div>

                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-medium">
                  FIG. 01 / ARTIFACT
                </span>
              </div>

              {/* Main Image Frame */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 14px 40px rgba(23,23,23,0.08)',
                  transition: { duration: 0.3, ease: 'easeOut' },
                }}
                className="overflow-hidden border border-token bg-[rgba(23,23,23,0.02)] p-2 md:p-3"
                style={{
                  aspectRatio: '4/3',
                  boxShadow: '0 4px 20px rgba(23,23,23,0.04)',
                }}
              >
                {!imgError ? (
                  <picture>
                    <source
                      type="image/avif"
                      srcSet="/images/hero-480.avif 480w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 520px"
                    />
                    <source
                      type="image/webp"
                      srcSet="/images/hero-480.webp 480w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 520px"
                    />
                    <img
                      src="/images/hero.webp"
                      alt="Adhiraj Sengar"
                      width={520}
                      height={390}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={handleImgError}
                    />
                  </picture>
                ) : (
                  <div className="w-full h-full border border-dashed border-token flex flex-col items-center justify-center p-6 text-center transition-colors group-hover:border-[rgba(23,23,23,0.35)]">
                    {/* Viewfinder icon */}
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted mb-3 opacity-60 group-hover:opacity-100 transition-opacity"
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
