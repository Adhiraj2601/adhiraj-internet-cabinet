import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { SectionLabel } from '../ui/SectionLabel'

// ─── VIDEO CONFIG ─────────────────────────────────────────────────────────────
// Drop your video file in public/media/ and set the path here.
// e.g. '/media/my-video.mp4'
// Leave empty ('') to fall back to the YouTube embed below.
const LOCAL_VIDEO_SRC = ''
const YOUTUBE_ID = 'IxX_QHay02M'
// YouTube embed with controls/branding minimised (still shows logo on hover)
const YT_SRC = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1`
// ──────────────────────────────────────────────────────────────────────────────

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

/**
 * The rolling cat animation:
 *
 *  ┌────────────────────────┐
 *  │🐱← peeking at corner  │
 *  │    ↘ rolls diagonally  │
 *  │        ↘               │
 *  │           🐱 ← center │
 *  └────────────────────────┘
 *
 * We animate x / y from the top-left quadrant to 0 (the cat's own center)
 * while rotate goes from -360° → 0° so it spins exactly once as it travels.
 * The cat is positioned at the visual centre of the image frame via CSS,
 * then x/y offsets move it relative to that anchor.
 *
 * "Behind the corner" illusion: the outer image wrapper has overflow:visible
 * so the cat is physically outside the clipped image area at the start,
 * then rolls INTO the visible frame.
 */

type CatState = 'idle' | 'rolling' | 'arrived' | 'exiting'

export function Hero() {
  const [heroSrc, setHeroSrc] = useState('/images/hero.jpg')
  const [imgError, setImgError] = useState(false)
  const [catState, setCatState] = useState<CatState>('idle')
  const [showVideo, setShowVideo] = useState(false)
  const catControls = useAnimation()
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sequenceTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimers = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    sequenceTimers.current.forEach(clearTimeout)
    sequenceTimers.current = []
  }

  const handleImgError = () => {
    if (heroSrc === '/images/hero.jpg') setHeroSrc('/images/hero.jpg.png')
    else if (heroSrc === '/images/hero.jpg.png') setHeroSrc('/images/hero.png')
    else setImgError(true)
  }

  // ── Rolling sequence ────────────────────────────────────────────────────────
  const startCatSequence = useCallback(async () => {
    if (catState !== 'idle') return
    setCatState('rolling')

    // PHASE 1 — peek from behind the top-left corner
    // Cat emerges from fully outside the frame (top-left) and slowly becomes visible
    await catControls.start({
      opacity: [0, 0.6, 1],
      // Start far outside top-left, roll to just inside the corner
      x: ['-200%', '-140%', '-90%'],
      y: ['-200%', '-140%', '-90%'],
      rotate: [-360, -270, -210],
      scale: [0.3, 0.5, 0.65],
      transition: {
        duration: 1.0,
        ease: 'easeOut' as const,
        times: [0, 0.5, 1],
      },
    })

    // PHASE 2 — roll from corner toward center (the main rolling motion)
    // Continuous spin proportional to distance traveled — simulates a ball rolling
    await catControls.start({
      opacity: 1,
      x: ['-90%', '-55%', '-20%', '0%'],
      y: ['-90%', '-55%', '-20%', '0%'],
      rotate: [-210, -120, -40, 0],
      scale: [0.65, 0.82, 0.98, 1.1],
      transition: {
        duration: 1.6,
        ease: [0.25, 0.1, 0.25, 1] as unknown as 'easeOut',
        times: [0, 0.35, 0.75, 1],
      },
    })

    setCatState('arrived')

    // PHASE 3 — cat settles with a small bounce at center
    await catControls.start({
      scale: [1.1, 0.92, 1.04, 1.0],
      rotate: [0, 4, -3, 0],
      transition: { duration: 0.55, ease: 'easeInOut' as const, times: [0, 0.3, 0.65, 1] },
    })

    // PHASE 4 — pause at centre, then cat exits by rolling off bottom-right
    const t1 = setTimeout(async () => {
      setCatState('exiting')
      catControls.start({
        opacity: [1, 1, 0],
        x: ['0%', '40%', '120%'],
        y: ['0%', '40%', '120%'],
        rotate: [0, 90, 200],
        scale: [1.0, 0.8, 0.3],
        transition: { duration: 0.6, ease: 'easeIn' as const, times: [0, 0.5, 1] },
      })
    }, 700)

    // PHASE 5 — image fades out, video appears
    const t2 = setTimeout(() => {
      setShowVideo(true)
      setCatState('idle')
    }, 1350)

    sequenceTimers.current.push(t1, t2)
  }, [catState, catControls])

  // ── Hover handlers ──────────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (catState !== 'idle' || showVideo) return
    hoverTimerRef.current = setTimeout(() => {
      startCatSequence()
    }, 2000) // 2-second hover threshold
  }

  const handleMouseLeave = () => {
    // Cancel the pending trigger if user didn't hold long enough
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }

  // ── Reset / replay ──────────────────────────────────────────────────────────
  const handleReset = () => {
    clearAllTimers()
    setShowVideo(false)
    setCatState('idle')
    catControls.set({ opacity: 0, x: '-200%', y: '-200%', rotate: -360, scale: 0.3 })
  }

  useEffect(() => () => clearAllTimers(), [])

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

        {/* 2-column editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Supporting Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="overflow-hidden">
              {heroLines.map((line) => (
                <div key={line.text} className="overflow-hidden">
                  <motion.h1
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.75, delay: line.delay, ease: [0.76, 0, 0.24, 1] }}
                    className="leading-none font-bold tracking-tighter"
                    style={{ fontSize: 'clamp(3.5rem, 8vw, 8.5rem)', color: 'var(--foreground)' }}
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

          {/* Right Column: Image / Video with Cat Easter Egg */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col justify-center"
          >
            <div className="relative">
              {/* Handwritten tape note */}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-handwritten text-[1.1rem] text-muted rotate-[-2deg] inline-block">
                  welcome to my little corner{' '}
                </span>
                <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-medium">
                  FIG. 01 / ARTIFACT
                </span>
              </div>

              {/*
               * Outer wrapper: overflow:visible lets the cat peek from outside
               * the image boundary before rolling in.
               */}
              <div
                className="relative border border-token bg-[rgba(23,23,23,0.02)] p-2 md:p-3"
                style={{
                  aspectRatio: '4/3',
                  boxShadow: '0 4px 20px rgba(23,23,23,0.04)',
                  overflow: 'visible',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Inner frame — clips image/video but NOT the cat */}
                <div
                  className="absolute inset-2 md:inset-3 overflow-hidden"
                  style={{ borderRadius: 1 }}
                >
                  <AnimatePresence mode="wait">
                    {!showVideo ? (
                      /* ── Hero Image ── */
                      <motion.div
                        key="hero-img"
                        className="w-full h-full"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.03, filter: 'blur(2px)' }}
                        transition={{ duration: 0.55 }}
                      >
                        {!imgError ? (
                          <img
                            src={heroSrc}
                            alt="Adhiraj Sengar"
                            className="w-full h-full object-cover select-none"
                            onError={handleImgError}
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full border border-dashed border-token flex flex-col items-center justify-center p-6 text-center">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
                              strokeLinejoin="round" className="text-muted mb-3 opacity-60">
                              <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                              <circle cx="12" cy="12" r="3" />
                              <path d="M12 9v6M9 12h6" />
                            </svg>
                            <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-foreground">Photo / Portrait</p>
                            <p className="text-[0.7rem] text-muted font-mono mt-1">public/images/hero.jpg</p>
                            <p className="font-handwritten text-[0.95rem] text-muted mt-2">photo, sketch, or artifact</p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* ── Video (local HTML5 or YouTube nocookie) ── */
                      <motion.div
                        key="video"
                        className="w-full h-full bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {LOCAL_VIDEO_SRC ? (
                          /* Local video — no YouTube branding at all */
                          <video
                            src={LOCAL_VIDEO_SRC}
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                            style={{ border: 'none', outline: 'none' }}
                          />
                        ) : (
                          /* YouTube nocookie embed with controls hidden */
                          <iframe
                            width="100%"
                            height="100%"
                            src={YT_SRC}
                            title="Video"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{ border: 'none', display: 'block' }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/*
                 * ── THE CAT ──
                 * Anchored to the visual centre of the outer frame.
                 * x/y offsets move it relative to that anchor.
                 * At start: x/y deeply negative → cat is outside top-left corner.
                 * At end: x/y = 0 → cat is at centre.
                 * mix-blend-mode:multiply removes the white background.
                 */}
                <motion.div
                  className="pointer-events-none absolute"
                  style={{
                    // Anchor to centre of the frame
                    top: '50%',
                    left: '50%',
                    width: '52%',
                    marginLeft: '-26%',   // visual centering offset (half of width)
                    marginTop: '-18%',    // visual centering offset (approximate for 4:3 cat)
                    zIndex: 30,
                    transformOrigin: 'center center',
                  }}
                  animate={catControls}
                  initial={{ opacity: 0, x: '-200%', y: '-200%', rotate: -360, scale: 0.3 }}
                >
                  <img
                    src="/images/cat.png"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-auto"
                    style={{
                      mixBlendMode: 'multiply',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
                    }}
                    draggable={false}
                  />
                </motion.div>

                {/* Subtle hover hint — fades in after 1.5s if not yet triggered */}
                {catState === 'idle' && !showVideo && (
                  <motion.div
                    className="absolute bottom-3 right-3 pointer-events-none z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                  >
                    <span className="font-handwritten text-[0.72rem] text-white/60 bg-black/20 backdrop-blur-xs px-1.5 py-0.5 rounded">
                      hover me…
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Replay link — appears after video starts */}
              <AnimatePresence>
                {showVideo && (
                  <motion.button
                    key="replay"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    onClick={handleReset}
                    className="mt-2.5 w-full text-center text-[0.68rem] font-mono text-muted hover:text-foreground transition-colors"
                  >
                    ↺ replay
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 md:mt-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
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
