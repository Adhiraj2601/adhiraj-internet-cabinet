import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../ui/SectionLabel'
import { PortraitFrame } from '../ui/PortraitFrame'
import { LanyardErrorBoundary } from '../ui/LanyardErrorBoundary'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import './Hero.css'

const Lanyard = lazy(() => import('../ui/Lanyard'))

const heroLines = [
  { text: "hey,", delay: 0.55 },
  { text: "i'm adi.", delay: 0.7 },
]

/**
 * Check if the browser supports WebGL
 */
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Interactive Hero Copy Link Component
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
  const heroRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(true)
  const [hasWebGL] = useState(() => checkWebGLSupport())
  const prefersReducedMotion = usePrefersReducedMotion()

  const desktopTargetRef = useRef<HTMLDivElement>(null)

  // Pause physics and rendering when hero is scrolled out of view
  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    io.observe(heroRef.current)
    return () => io.disconnect()
  }, [])

  // Only render 3D Lanyard if WebGL is available and user does not prefer reduced motion
  const canRenderLanyard = hasWebGL && !prefersReducedMotion

  return (
    <section
      ref={heroRef}
      className="hero-section relative min-h-[90vh] flex flex-col justify-end pb-16 md:pb-24 pt-20 lg:pt-36 overflow-x-clip"
      aria-label="Introduction"
    >
      {/* 3D Lanyard integration with ErrorBoundary & Fallback */}
      {canRenderLanyard ? (
        <LanyardErrorBoundary fallback={<PortraitFrame />}>
          <div className="hero-lanyard-container">
            {isInView && (
              <Suspense fallback={null}>
                <Lanyard
                  eventSource={heroRef}
                  targetRef={desktopTargetRef}
                  frameloop={isInView ? 'always' : 'never'}
                />
              </Suspense>
            )}
          </div>
        </LanyardErrorBoundary>
      ) : null}

      {/* On mobile (< 1024px), reserve space for the swinging badge above the text */}
      {canRenderLanyard && (
        <div
          className="block lg:hidden hero-lanyard-mobile-placeholder"
          aria-hidden="true"
        />
      )}

      <div className="container-main w-full">
        {/* Small metadata label (visible on desktop) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="hidden lg:block mb-8 md:mb-12"
        >
          <SectionLabel>Adi's Archive / 2026</SectionLabel>
        </motion.div>

        {/* 2-column editorial grid: Intro on left, Badge labels / Fallback portrait on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Supporting Text */}
          <div className="lg:col-span-7 flex flex-col justify-center hero-text-column relative z-30">
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

            {/* Supporting text with interactive section links */}
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

          {/* Right Column: Target anchor placeholder on desktop or fallback portrait */}
          <div className="flex flex-col justify-center lg:col-span-5 relative">
            {canRenderLanyard ? (
              <div
                ref={desktopTargetRef}
                className="hero-badge-target-placeholder w-full max-w-[420px] mx-auto aspect-[1680/1452] invisible pointer-events-none"
                aria-hidden="true"
              />
            ) : (
              <PortraitFrame />
            )}
          </div>
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
