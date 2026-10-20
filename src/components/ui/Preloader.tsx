/**
 * Preloader — "Hello" liquid-fill loader
 *
 * ─── Timing config ────────────────────────────────────────────────
 * Tweak any of these values in the CONFIG object below.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useLayoutEffect, useId, useRef, useState } from 'react'
import './Preloader.css'

// ─── Timing config — change here to adjust feel ──────────────────
const CONFIG = {
  /** ms before filling starts (dim word is visible, counter at 0%) */
  initialPause: 700,
  /** ms for progress 0 → 100 (liquid rises + counter counts up) */
  fillDuration: 2300,
  /** ms to hold the fully-filled word before exit zoom */
  holdDuration: 500,
  /** ms for the zoom-in dissolve exit */
  zoomDuration: 1100,
  /** ms for the final opacity fade of the overlay */
  fadeDuration: 300,
  /** Wave 1 horizontal slosh cycle duration in ms */
  sloshCycle1: 1200,
  /** Wave 2 horizontal slosh cycle duration in ms */
  sloshCycle2: 1600,
  /** Set to true to skip animation if system has reduced-motion preference */
  respectReducedMotion: false,
} as const

// ─── Easing helpers ──────────────────────────────────────────────
/** power2.inOut — cubic-bezier(.45, 0, .55, 1) */
function easeInOutPower2(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** accelerating ease-in for zoom — cubic-bezier(.7, 0, .84, 0) / power3.in */
function easeInPower3(t: number): number {
  return t * t * t
}

// ─── Seamless Wave Path Geometry ─────────────────────────────────
// Viewbox width is 260. Wavelength is 130 (2 full crests across viewBox).
// We repeat cycles from x = -260 to x = 520 (6 cycles total) so horizontal
// translation never exposes an empty side.
const WAVE_WL = 130
const WAVE_AMP = 4.5
const WAVE_PATH_D = (() => {
  const amp = WAVE_AMP
  const wl = WAVE_WL
  const half = wl / 2
  const cp = half * 0.36
  const parts = ['M -260 0']
  for (let x = -260; x < 520; x += wl) {
    const x0 = x
    const x1 = x + half
    const x2 = x + wl
    // Crest (curves upward in SVG = negative Y)
    parts.push(`C ${x0 + cp} ${-amp} ${x1 - cp} ${-amp} ${x1} 0`)
    // Trough (curves downward in SVG = positive Y)
    parts.push(`C ${x1 + cp} ${amp} ${x2 - cp} ${amp} ${x2} 0`)
  }
  parts.push('L 520 160 L -260 160 Z')
  return parts.join(' ')
})()

// ─── Fill Level Constants ────────────────────────────────────────
// Text baseline is at y = 98, cap height top is at y = 24.
// Text visible height is ~74 units.
// Below baseline: 106 (even the crest at 106 - 4.5 = 101.5 is below baseline 98)
const FILL_Y_START = 106
// Above cap: 18 (even the trough at 18 + 4.5 = 22.5 is above cap 24)
const FILL_Y_END = 18

interface PreloaderProps {
  onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const rawId = useId()
  const clipId = `preloader-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const [state, setState] = useState<'visible' | 'exiting' | 'hidden'>('visible')

  const wave1Ref = useRef<SVGPathElement>(null)
  const wave2Ref = useRef<SVGPathElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pageReadyRef = useRef(false)
  const isRunningRef = useRef(false)

  // 1. Remove initial static HTML shell cleanly once React mounts
  useLayoutEffect(() => {
    const staticEl = document.getElementById('preloader-static')
    if (staticEl) {
      staticEl.remove()
    }
  }, [])

  // 2. Lock scroll & run timeline
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Track full page readiness (window load)
    const markPageReady = () => {
      if (!pageReadyRef.current) {
        pageReadyRef.current = true
        console.log(`[Preloader] window load at ${performance.now().toFixed(1)}ms`)
      }
    }

    if (document.readyState === 'complete') {
      markPageReady()
    } else {
      window.addEventListener('load', markPageReady, { once: true })
    }
    const pageReadyFallback = setTimeout(markPageReady, 3500)

    // Track fonts ready
    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          console.log(`[Preloader] fonts-ready at ${performance.now().toFixed(1)}ms`)
        })
        .catch(() => {})
    }

    // Guard: single active RAF loop
    isRunningRef.current = true

    // Check reduced motion if enabled
    const prefersReduced =
      CONFIG.respectReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      if (counterRef.current) counterRef.current.textContent = 'loading... 100 %'
      const rmTimer = setTimeout(() => {
        if (isRunningRef.current) setState('exiting')
      }, 400)
      return () => {
        isRunningRef.current = false
        clearTimeout(rmTimer)
        clearTimeout(pageReadyFallback)
        window.removeEventListener('load', markPageReady)
      }
    }

    let phase: 'pause' | 'fill' | 'hold' | 'zoom' = 'pause'
    let phaseStartTime: number | null = null
    let hasLoggedProgressStart = false
    let hasLogged100Pct = false

    function tick(now: number) {
      if (!isRunningRef.current) return

      if (phaseStartTime === null) {
        phaseStartTime = now
      }

      const phaseElapsed = now - phaseStartTime

      // Continuous horizontal slosh for Wave 1 and Wave 2
      const slosh1 = -((now % CONFIG.sloshCycle1) / CONFIG.sloshCycle1) * WAVE_WL
      const slosh2 = -((now % CONFIG.sloshCycle2) / CONFIG.sloshCycle2) * WAVE_WL - 35

      // ── PHASE 1: Initial Pause (0.7s) ────────────────────────
      if (phase === 'pause') {
        if (wave1Ref.current) {
          wave1Ref.current.style.transform = `translate3d(${slosh1.toFixed(2)}px, ${FILL_Y_START}px, 0)`
        }
        if (wave2Ref.current) {
          wave2Ref.current.style.transform = `translate3d(${slosh2.toFixed(2)}px, ${(FILL_Y_START + 2.5).toFixed(2)}px, 0)`
        }
        if (counterRef.current) {
          counterRef.current.textContent = 'loading... 0 %'
        }

        if (phaseElapsed >= CONFIG.initialPause) {
          phase = 'fill'
          phaseStartTime = now
          if (!hasLoggedProgressStart) {
            hasLoggedProgressStart = true
            console.log(`[Preloader] progress start at ${performance.now().toFixed(1)}ms`)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // ── PHASE 2: Rise + Slosh + Counter (2.3s) ────────────────
      if (phase === 'fill') {
        const rawT = Math.min(phaseElapsed / CONFIG.fillDuration, 1)
        const progress = easeInOutPower2(rawT)

        const currentFillY = FILL_Y_START - progress * (FILL_Y_START - FILL_Y_END)

        if (wave1Ref.current) {
          wave1Ref.current.style.transform = `translate3d(${slosh1.toFixed(2)}px, ${currentFillY.toFixed(2)}px, 0)`
        }
        if (wave2Ref.current) {
          wave2Ref.current.style.transform = `translate3d(${slosh2.toFixed(2)}px, ${(currentFillY + 2.5).toFixed(2)}px, 0)`
        }

        if (counterRef.current) {
          const pct = Math.min(Math.round(progress * 100), 100)
          counterRef.current.textContent = `loading... ${pct} %`
        }

        if (rawT >= 1) {
          if (!hasLogged100Pct) {
            hasLogged100Pct = true
            console.log(`[Preloader] 100 % reached at ${performance.now().toFixed(1)}ms`)
          }
          phase = 'hold'
          phaseStartTime = now
        }

        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // ── PHASE 3: Hold fully filled word (0.5s minimum, wait for page ready) ──
      if (phase === 'hold') {
        if (wave1Ref.current) {
          wave1Ref.current.style.transform = `translate3d(${slosh1.toFixed(2)}px, ${FILL_Y_END}px, 0)`
        }
        if (wave2Ref.current) {
          wave2Ref.current.style.transform = `translate3d(${slosh2.toFixed(2)}px, ${(FILL_Y_END + 2.5).toFixed(2)}px, 0)`
        }
        if (counterRef.current) {
          counterRef.current.textContent = 'loading... 100 %'
        }

        // Only exit when both holdDuration has elapsed AND page is ready
        if (phaseElapsed >= CONFIG.holdDuration && pageReadyRef.current) {
          phase = 'zoom'
          phaseStartTime = now
        }

        rafRef.current = requestAnimationFrame(tick)
        return
      }

      // ── PHASE 4: Zoom Dissolve (1.1s) ─────────────────────────
      if (phase === 'zoom') {
        const rawT = Math.min(phaseElapsed / CONFIG.zoomDuration, 1)
        const ez = easeInPower3(rawT)

        // Scale from 1x to ~6x
        const scale = 1 + ez * 5
        // Fade opacity toward background
        const opacity = Math.max(0, 1 - ez * 0.95)

        if (innerRef.current) {
          innerRef.current.style.transform = `scale(${scale.toFixed(3)})`
          innerRef.current.style.opacity = opacity.toFixed(3)
        }

        if (wave1Ref.current) {
          wave1Ref.current.style.transform = `translate3d(${slosh1.toFixed(2)}px, ${FILL_Y_END}px, 0)`
        }
        if (wave2Ref.current) {
          wave2Ref.current.style.transform = `translate3d(${slosh2.toFixed(2)}px, ${(FILL_Y_END + 2.5).toFixed(2)}px, 0)`
        }

        if (rawT >= 1) {
          // Remove will-change when animation finishes for performance
          if (wave1Ref.current) wave1Ref.current.style.willChange = 'auto'
          if (wave2Ref.current) wave2Ref.current.style.willChange = 'auto'
          if (innerRef.current) innerRef.current.style.willChange = 'auto'

          setState('exiting')
          return
        }

        rafRef.current = requestAnimationFrame(tick)
        return
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      isRunningRef.current = false
      cancelAnimationFrame(rafRef.current)
      clearTimeout(pageReadyFallback)
      window.removeEventListener('load', markPageReady)
    }
  }, [onComplete])

  // Handle overlay exit fade (300ms) then unmount and restore scroll
  useEffect(() => {
    if (state !== 'exiting') return
    const timer = setTimeout(() => {
      setState('hidden')
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      onComplete?.()
    }, CONFIG.fadeDuration)
    return () => clearTimeout(timer)
  }, [state, onComplete])

  if (state === 'hidden') return null

  return (
    <div
      className="preloader"
      data-state={state}
      style={{
        transition: state === 'exiting' ? `opacity ${CONFIG.fadeDuration}ms ease-out` : 'none',
      }}
      aria-hidden="true"
      aria-label="Loading portfolio"
    >
      <div ref={innerRef} className="preloader__inner">
        {/* ── Responsive SVG Word ── */}
        <svg
          className="preloader__svg"
          viewBox="0 0 260 115"
          style={{
            width: 'clamp(280px, 80vw, 860px)',
            height: 'auto',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Unique clip path per instance */}
            <clipPath id={clipId}>
              <text
                x="5"
                y="98"
                fontSize="100"
                fontFamily="'Geologica', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                fontWeight="800"
                letterSpacing="-0.04em"
              >
                Hello
              </text>
            </clipPath>
          </defs>

          {/* 1. Dim (unfilled) letter outline */}
          <text
            x="5"
            y="98"
            fontSize="100"
            fontFamily="'Geologica', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            fontWeight="800"
            letterSpacing="-0.04em"
            className="preloader__text-dim"
          >
            Hello
          </text>

          {/* 2. Liquid wave body clipped by the word "Hello" — initial CSS transform is 100% EMPTY */}
          <g clipPath={`url(#${clipId})`}>
            {/* Secondary wave behind (depth layer) */}
            <path
              ref={wave2Ref}
              className="preloader__wave-2"
              d={WAVE_PATH_D}
              style={{ transform: 'translate3d(-30px, 108px, 0)' }}
            />
            {/* Primary wave in front */}
            <path
              ref={wave1Ref}
              className="preloader__liquid-fill"
              d={WAVE_PATH_D}
              style={{ transform: 'translate3d(0px, 106px, 0)' }}
            />
          </g>
        </svg>

        {/* ── Monospace Counter (right-aligned under the word's right edge) ── */}
        <span ref={counterRef} className="preloader__counter">
          loading... 0 %
        </span>
      </div>
    </div>
  )
}
