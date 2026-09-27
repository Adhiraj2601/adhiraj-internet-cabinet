import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface InteractiveAvatarProps {
  initialImageSrc?: string
  alt?: string
  videoSrc?: string
  className?: string
  aspectRatio?: string
  onFallbackError?: () => void
}

export function InteractiveAvatar({
  initialImageSrc = '/images/hero.jpg',
  alt = 'Adhiraj Sengar',
  videoSrc = '/media/Screen%20Recording%202026-09-27%20172220.mp4',
  className = '',
  aspectRatio = '4/3',
  onFallbackError,
}: InteractiveAvatarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentImgSrc, setCurrentImgSrc] = useState(initialImageSrc)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle fallback image formats if hero.jpg doesn't load initially
  const handleImgError = () => {
    if (currentImgSrc === '/images/hero.jpg') {
      setCurrentImgSrc('/images/hero.jpg.png')
    } else if (currentImgSrc === '/images/hero.jpg.png') {
      setCurrentImgSrc('/images/hero.png')
    } else {
      setImageError(true)
      onFallbackError?.()
    }
  }

  // Handle click on the avatar container to toggle the easter egg
  const handleToggle = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      setIsLoading(true)
    } else {
      setIsPlaying(false)
      setIsLoading(false)
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }

  // Control video playback when isPlaying changes
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsLoading(false)
        })
        .catch(() => {
          // In case of browser autoplay policy restrictions, keep muted
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play().catch(() => {})
          }
        })
    }
  }, [isPlaying])

  return (
    // Outer Container: overflow: visible and position: relative to allow peekaboo breakout
    <div
      className={`relative select-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* 🐾 The Peekaboo Animation: Small Cat Graphic sliding out from top-left */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            key="peekaboo-cat"
            initial={{ y: 35, x: 12, rotate: -22, opacity: 0, scale: 0.8 }}
            animate={{
              y: -36,
              x: -16,
              rotate: -10,
              opacity: 1,
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 340,
                damping: 18,
                mass: 0.8,
              },
            }}
            exit={{
              y: 35,
              x: 12,
              rotate: -20,
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.25, ease: 'easeIn' },
            }}
            className="absolute top-0 left-0 z-30 pointer-events-none origin-bottom-right"
            aria-hidden="true"
          >
            {/* Playful Cat SVG Illustration */}
            <div className="relative">
              <svg
                width="72"
                height="68"
                viewBox="0 0 72 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-md"
              >
                {/* Cat Head */}
                <ellipse cx="36" cy="42" rx="26" ry="22" fill="#1C1B1A" />

                {/* Left Ear */}
                <polygon points="14,30 20,4 32,24" fill="#1C1B1A" />
                <polygon points="17,27 21,9 29,23" fill="#E88B97" />

                {/* Right Ear */}
                <polygon points="40,24 52,4 58,30" fill="#1C1B1A" />
                <polygon points="43,23 51,9 55,27" fill="#E88B97" />

                {/* Eyes */}
                <circle cx="26" cy="38" r="5" fill="#F4F1EA" />
                <circle cx="27" cy="38" r="2.8" fill="#171717" />
                <circle cx="25.5" cy="36.5" r="1.2" fill="#FFFFFF" />

                <circle cx="46" cy="38" r="5" fill="#F4F1EA" />
                <circle cx="45" cy="38" r="2.8" fill="#171717" />
                <circle cx="44.5" cy="36.5" r="1.2" fill="#FFFFFF" />

                {/* Cute Nose */}
                <polygon points="34,44 38,44 36,47" fill="#E88B97" />

                {/* Mouth */}
                <path
                  d="M33 48 C34 50, 36 50, 36 48 C36 50, 38 50, 39 48"
                  stroke="#F4F1EA"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />

                {/* Whiskers */}
                <line x1="8" y1="41" x2="20" y2="43" stroke="#F4F1EA" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="9" y1="46" x2="20" y2="46" stroke="#F4F1EA" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="52" y1="43" x2="64" y2="41" stroke="#F4F1EA" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="52" y1="46" x2="63" y2="46" stroke="#F4F1EA" strokeWidth="1.2" strokeLinecap="round" />

                {/* Little White Paws peeking over the frame */}
                <rect x="18" y="55" width="10" height="9" rx="5" fill="#F4F1EA" stroke="#1C1B1A" strokeWidth="1.5" />
                <rect x="44" y="55" width="10" height="9" rx="5" fill="#F4F1EA" stroke="#1C1B1A" strokeWidth="1.5" />
              </svg>

              {/* Little handwritten meow badge */}
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="absolute -top-3 -right-6 font-handwritten text-[0.95rem] font-bold text-accent bg-[#F4F1EA] px-1.5 py-0.5 rounded shadow-xs rotate-12 border border-token"
              >
                meow! ✦
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Avatar Clickable Card */}
      <motion.div
        onClick={handleToggle}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 16px 40px rgba(23,23,23,0.1)',
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        whileTap={{ scale: 0.99 }}
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? 'Pause video and show avatar' : 'Click for interactive easter egg'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        className="cursor-pointer group relative overflow-hidden border border-token bg-[rgba(23,23,23,0.02)] p-2 md:p-3 focus-visible:outline-2 focus-visible:outline-accent"
        style={{
          aspectRatio,
          boxShadow: '0 4px 20px rgba(23,23,23,0.04)',
        }}
      >
        {/* Inner Media Container — Fixed exact dimensions prevent layout shift */}
        <div className="relative w-full h-full overflow-hidden bg-neutral-900/5">
          {/* Static Image State */}
          <motion.div
            initial={false}
            animate={{
              opacity: isPlaying ? 0 : 1,
              scale: isPlaying ? 1.05 : 1,
            }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
          >
            {!imageError ? (
              <img
                src={currentImgSrc}
                alt={alt}
                className="w-full h-full object-cover"
                onError={handleImgError}
              />
            ) : (
              <div className="w-full h-full border border-dashed border-token flex flex-col items-center justify-center p-6 text-center transition-colors group-hover:border-[rgba(23,23,23,0.35)]">
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
                  click to trigger easter egg ✦
                </p>
              </div>
            )}
          </motion.div>

          {/* HTML5 Video Easter Egg Element */}
          <motion.div
            initial={false}
            animate={{
              opacity: isPlaying ? 1 : 0,
            }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: isPlaying ? 'auto' : 'none' }}
          >
            <video
              ref={videoRef}
              playsInline
              loop
              muted
              preload="auto"
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onPlaying={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              className="w-full h-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
              <source src="/media/easter-egg.mp4" type="video/mp4" />
              <source src="/media/hero.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>

          {/* Loading Spinner State */}
          <AnimatePresence>
            {isPlaying && isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-xs z-20"
              >
                <div className="w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-muted mt-3">
                  Buffering...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle Interaction Pills */}
          <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wider uppercase backdrop-blur-md rounded-full shadow-xs transition-all duration-300"
              style={{
                backgroundColor: isPlaying ? 'rgba(23,23,23,0.85)' : 'rgba(244,241,234,0.9)',
                color: isPlaying ? '#F4F1EA' : '#171717',
                border: '1px solid var(--border)',
              }}
            >
              {isPlaying ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>PLAYING • CLICK TO RESET</span>
                </>
              ) : (
                <>
                  <span>✦ CLICK ME</span>
                </>
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
