import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpFromLine, Maximize2, ArrowLeft } from 'lucide-react'
import { type Post } from '../../content/posts'
import { DoodleBackdrop } from './DoodleBackdrop'
import { TvScene } from './TvScene'
import { TvScreen, type TvScreenHandle } from './TvScreen'
import { RoughenFilterDefs } from './CassetteCard'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import './observations.css'

interface TvPlayerProps {
  post: Post
  allObservations: Post[]
  onClose: () => void
  isDirectLink?: boolean
}

export function TvPlayer({ post, allObservations, onClose, isDirectLink = false }: TvPlayerProps) {
  const isMobile = useIsMobile()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Animation timeline phases:
  // On desktop:
  // Phase 1: 'inserting' (0ms) -> 'docked' (700ms)
  // Phase 2: 'power-on' (950ms) -> reel playback begins shortly after cassette is fully inserted
  // On mobile (Approach 2):
  // Directly activate 'power-on' so the CRT terminal starts instantly without delaying the reader
  const [phase, setPhase] = useState<'inserting' | 'docked' | 'power-on'>(
    () => (prefersReducedMotion || isMobile ? 'power-on' : 'inserting')
  )

  // On desktop, user can toggle read mode. On mobile, read mode is always active.
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

  // Choreographed Opening Timeline on Desktop:
  useEffect(() => {
    if (prefersReducedMotion || isMobile) {
      setPhase('power-on')
      return
    }

    const t1 = setTimeout(() => {
      setPhase('docked')
    }, 700)

    const t2 = setTimeout(() => {
      setPhase('power-on')
    }, 950)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [prefersReducedMotion, isMobile])

  // Lock body & html scroll and handle keyboard Escape
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

  // Toggle Read mode on Desktop:
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

  const isTapeInSlot = phase === 'docked' || phase === 'power-on'
  const isTapePlaying = phase === 'power-on'
  const isPoweredOn = phase === 'power-on'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
      className="tv-player-modal fixed inset-0 select-none overflow-hidden"
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
        className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8"
      >
        {/* Doodle Backdrop & Pale-Green Glow */}
        <DoodleBackdrop />

        {/* Top-Right Control Buttons */}
        <div
          className="fixed top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2 sm:gap-3"
          style={{ zIndex: 100 }}
        >
          {isMobile ? (
            /* On mobile, Approach 2 provides a clean Back to Tapes button */
            <button
              type="button"
              onClick={handleClose}
              aria-label="Back to cassette tapes"
              className="px-3.5 py-1.5 bg-white text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:bg-[#E3B859] hover:translate-x-0.5 hover:translate-y-0.5 focus:outline-none"
              style={{
                border: '1.5px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tapes</span>
            </button>
          ) : (
            /* On desktop: TV/Read toggle + Eject button */
            <>
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
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 hover:bg-[#E3B859] hover:translate-x-0.5 hover:translate-y-0.5 focus:outline-none focus-visible:outline-none"
                    style={{
                      border: '1.5px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                      outline: 'none',
                    }}
                  >
                    {isReadMode ? (
                      <>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">TV</span>
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

              <button
                type="button"
                onClick={handleClose}
                aria-label="Eject tape and close"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-150 hover:bg-[#E3B859] hover:translate-x-0.5 hover:translate-y-0.5 focus:outline-none focus-visible:outline-none"
                style={{
                  border: '1.5px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  outline: 'none',
                }}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="hidden sm:inline">Eject</span>
              </button>
            </>
          )}
        </div>

        {/* Central Observation Content */}
        {isMobile ? (
          /* Approach 2 (Mobile): Direct Full-Screen CRT Terminal Reader */
          <div className="fixed left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 w-[92vw] h-[83dvh] max-w-[560px] z-30">
            <TvScreen
              ref={screenRef}
              post={post}
              allObservations={allObservations}
              isPoweredOn={true}
              isReadMode={true}
            />
          </div>
        ) : (
          /* Desktop: Central TV Scene with 3D Chassis, knobs, antennas, & layout animation */
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
              isTapePlaying={isTapePlaying}
              isReadMode={isReadMode}
            >
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
        )}
      </motion.div>
    </div>,
    document.body
  )
}
