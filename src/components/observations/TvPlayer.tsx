import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpFromLine, Maximize2, ArrowLeft } from 'lucide-react'
import { type Post } from '../../content/posts'
import { DoodleBackdrop } from './DoodleBackdrop'
import { TvScene } from './TvScene'
import { TvScreen, type TvScreenHandle } from './TvScreen'
import { CassetteCard, RoughenFilterDefs } from './CassetteCard'
import './observations.css'

interface TvPlayerProps {
  post: Post
  allObservations: Post[]
  onClose: () => void
  isDirectLink?: boolean
}

export function TvPlayer({ post, allObservations, onClose, isDirectLink = false }: TvPlayerProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Animation timeline phases:
  // 'initial' -> 'tv-in' -> 'flap-open' -> 'tape-flying' -> 'tape-inserted' -> 'power-on'
  const [phase, setPhase] = useState<
    'initial' | 'tv-in' | 'flap-open' | 'tape-flying' | 'tape-inserted' | 'power-on'
  >(() => (prefersReducedMotion ? 'power-on' : 'initial'))

  const [isReadMode, setIsReadMode] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const screenRef = useRef<TvScreenHandle>(null)

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 350)
  }, [isClosing, onClose])

  // Choreographed Opening Timeline (Pacing ~1.6s total)
  useEffect(() => {
    if (prefersReducedMotion) return

    const t1 = setTimeout(() => {
      setPhase('tv-in')
    }, 150)

    const t2 = setTimeout(() => {
      setPhase('flap-open')
    }, 450)

    const t3 = setTimeout(() => {
      setPhase('tape-flying')
    }, 950)

    const t4 = setTimeout(() => {
      setPhase('tape-inserted')
    }, 1500)

    const t5 = setTimeout(() => {
      setPhase('power-on')
    }, 1700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [prefersReducedMotion])

  // Lock body scroll and handle keyboard Escape
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

  // Toggle Read mode:
  // If clicked while typing is still running, complete typewriter immediately, then expand!
  const handleToggleRead = () => {
    if (!isReadMode) {
      if (screenRef.current && !screenRef.current.isDone) {
        screenRef.current.skipTyping()
      }
      setIsReadMode(true)
    } else {
      setIsReadMode(false)
    }
  }

  const doorFlapOpen = phase === 'flap-open'
  const isTapeInSlot = phase === 'tape-inserted' || phase === 'power-on'
  const isTapePlaying = phase === 'tape-inserted' || phase === 'power-on'
  const isPoweredOn = phase === 'power-on'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
      className="fixed inset-0 select-none overflow-hidden"
      style={{
        zIndex: 350,
      }}
    >
      <RoughenFilterDefs />

      {/* Full-viewport Overlay Container with Exit Crossfade */}
      <motion.div
        initial={{ opacity: 0, scale: isDirectLink ? 1 : 0.96 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.94 : 1,
        }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
      >
        {/* Doodle Backdrop & Pale-Green Glow */}
        <DoodleBackdrop />

        {/* Top-Right Control Buttons (Eject & Read) */}
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-3"
          style={{ zIndex: 100 }}
        >
          {/* Read / TV Toggle Button (Appears after tape is inserted) */}
          <AnimatePresence>
            {isTapeInSlot && (
              <motion.button
                key="read-btn"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                type="button"
                onClick={handleToggleRead}
                aria-label={isReadMode ? 'Return to TV view' : 'Read mode'}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 hover:bg-[#E3B859] hover:translate-x-0.5 hover:translate-y-0.5"
                style={{
                  border: '1.5px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                {isReadMode ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">← TV</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Read</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Eject Button (Visible throughout) */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Eject tape and close"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 hover:bg-[#E3B859] hover:translate-x-0.5 hover:translate-y-0.5"
            style={{
              border: '1.5px solid #000000',
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span className="hidden sm:inline">Eject</span>
          </button>
        </div>

        {/* Central TV Scene Wrapper with Locked Controlling Dimension */}
        <div
          className="relative flex items-center justify-center select-none"
          style={{
            height: 'min(76vh, 590px)',
            aspectRatio: '760 / 640',
            maxWidth: '92vw',
            zIndex: 10,
          }}
        >
          <TvScene
            post={post}
            allObservations={allObservations}
            doorFlapOpen={doorFlapOpen}
            isTapeInserted={isTapeInSlot}
            isTapePlaying={isTapePlaying}
          >
            {/* Single Source of Truth: ONE TvScreen instance animated with layout */}
            <motion.div
              layout
              transition={{
                type: 'spring',
                stiffness: 160,
                damping: 24,
              }}
              className={
                isReadMode
                  ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] sm:w-[62vw] h-[92dvh] sm:h-[90vh] max-w-[980px] z-50'
                  : 'w-full h-full'
              }
            >
              <TvScreen
                ref={screenRef}
                post={post}
                allObservations={allObservations}
                isPoweredOn={isPoweredOn}
                isReadMode={isReadMode}
              />
            </motion.div>
          </TvScene>
        </div>

        {/* Flying Cassette Animation (0ms -> 1500ms before it's seated in the TV slot) */}
        {!isTapeInSlot && !prefersReducedMotion && (
          <motion.div
            layoutId={`tape-${post.slug}`}
            className="fixed pointer-events-none"
            style={{ zIndex: 40 }}
            initial={{
              left: '8vw',
              bottom: '6vh',
              width: 'min(360px, 34vw)',
              rotate: -12,
              scale: 0.82,
              opacity: 1,
            }}
            animate={
              phase === 'tape-flying'
                ? {
                    left: 'calc(50% - min(180px, 17vw))',
                    bottom: 'calc(50% - min(280px, 28vh))',
                    width: 'min(330px, 32vw)',
                    rotate: 0,
                    scale: 0.52,
                    opacity: 1,
                  }
                : {
                    left: '8vw',
                    bottom: '6vh',
                    width: 'min(360px, 34vw)',
                    rotate: -12,
                    scale: 0.82,
                    opacity: 1,
                  }
            }
            transition={{
              type: 'spring',
              stiffness: 170,
              damping: 18,
            }}
          >
            <CassetteCard
              post={post}
              allObservations={allObservations}
              isPlaying={false}
              isInteractive={false}
            />
          </motion.div>
        )}
      </motion.div>
    </div>,
    document.body
  )
}
