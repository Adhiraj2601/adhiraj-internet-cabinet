/**
 * Preloader — "Hello" liquid-fill loader
 *
 * Stack: React 19 + Vite, framer-motion already in project.
 * Animation is done with requestAnimationFrame (no extra deps).
 *
 * ─── Timing config ────────────────────────────────────────────────
 * Tweak any of these values in the CONFIG object below.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from 'react'
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
  /** Vertical slosh cycle duration in ms */
  sloshCycle: 1200,
} as const

// ─── Easing helpers ──────────────────────────────────────────────
/** power2.inOut — cubic-bezier(.45,0,.55,1) */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/** accelerating ease-in for zoom — cubic-bezier(.7,0,.84,0) */
function easeIn(t: number): number {
  return t * t * (0.84 + t * (1 - 0.84)) // approximate
}

// ─── Wave path builder ───────────────────────────────────────────
/**
 * Build an SVG path for the liquid wave.
 * The shape is wider than viewBox (200%) so horizontal scrolling
 * creates a seamless looping surface.
 *
 * @param vbW  viewBox width
 * @param vbH  viewBox height (cap height of text)
 * @param amp  wave amplitude in viewBox units
 * @param offsetX  horizontal scroll offset (0–vbW)
 * @param fillY  current top of liquid in viewBox units (descends from vbH to 0)
 */
function buildWavePath(
  vbW: number,
  vbH: number,
  amp: number,
  offsetX: number,
  fillY: number,
): string {
  // Two full wave panels side-by-side for seamless loop
  const W = vbW * 2
  const crests = 2 // visible crests across one panel

  // Start from the left with horizontal offset applied
  const x0 = -vbW - offsetX

  // Build the wavy top edge using cubic bezier segments
  // We split the width into (crests * 2) half-wave segments
  const segs = crests * 2
  const segW = W / segs

  let d = `M ${x0} ${fillY}`

  for (let i = 0; i < segs; i++) {
    const x1 = x0 + i * segW
    const x2 = x1 + segW
    const cpOffset = segW * 0.45
    // Alternating crest/trough
    const sign = i % 2 === 0 ? -1 : 1
    d += ` C ${x1 + cpOffset} ${fillY + sign * amp}, ${x2 - cpOffset} ${fillY + sign * amp}, ${x2} ${fillY}`
  }

  // Close path: go down past the bottom, back left, close
  d += ` L ${x0 + W} ${vbH + 20} L ${x0} ${vbH + 20} Z`
  return d
}

// ─── Component ───────────────────────────────────────────────────
interface PreloaderProps {
  onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [state, setState] = useState<'visible' | 'exiting' | 'hidden'>('visible')
  const [counter, setCounter] = useState(0)

  const svgRef = useRef<SVGSVGElement>(null)
  const wave1Ref = useRef<SVGPathElement>(null)
  const wave2Ref = useRef<SVGPathElement>(null)
  const clipRectRef = useRef<SVGRectElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pageReadyRef = useRef(false)
  const animCompleteRef = useRef(false)

  // Respect prefers-reduced-motion
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // Lock scroll
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Wait for page ready (fonts + window load)
    let pageReady = false
    const markReady = () => {
      if (pageReady) return
      pageReady = true
      pageReadyRef.current = true
    }

    if (document.readyState === 'complete') {
      // Already loaded — mark after a tick so fonts settle
      Promise.resolve().then(() => document.fonts.ready).then(markReady)
    } else {
      window.addEventListener('load', () => {
        document.fonts.ready.then(markReady)
      }, { once: true })
    }

    // ── Reduced motion: quick fade ──────────────────────────────
    if (reducedMotion) {
      setCounter(100)
      const t = setTimeout(() => {
        setState('exiting')
        const t2 = setTimeout(() => {
          setState('hidden')
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          onComplete?.()
        }, 400)
        return () => clearTimeout(t2)
      }, 600)
      return () => clearTimeout(t)
    }

    // ── Full animation ──────────────────────────────────────────
    // SVG viewBox dimensions — measured after first render via getBBox or fixed
    // We'll use a reference size. The SVG text is absolutely positioned in the SVG
    // and we measure it at runtime.
    let vbW = 600
    let vbH = 120
    let amp = 6  // wave amplitude in viewBox units

    // Start time tracking
    let fillStart: number | null = null
    let phase: 'pause' | 'fill' | 'hold' | 'zoom' = 'pause'
    const pauseEnd = CONFIG.initialPause
    let fillProgress = 0

    function tick(now: number) {
      if (!fillStart) fillStart = now

      const elapsed = now - fillStart

      if (phase === 'pause') {
        // Dim word visible, counter 0%
        if (elapsed >= pauseEnd) {
          phase = 'fill'
          fillStart = now
        }
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (phase === 'fill') {
        const t = Math.min(elapsed / CONFIG.fillDuration, 1)
        fillProgress = easeInOut(t)

        // Hold at ~95% until page is ready
        const clampedProgress = (!pageReadyRef.current && fillProgress > 0.95)
          ? 0.95
          : fillProgress

        // Update counter text
        setCounter(Math.round(clampedProgress * 100))

        // Wave geometry
        const svg = svgRef.current
        const w1 = wave1Ref.current
        const w2 = wave2Ref.current
        const cr = clipRectRef.current

        if (svg && w1 && w2 && cr) {
          // Dynamic viewBox sizing on first valid frame
          if (vbW === 600 && svg.viewBox.baseVal.width) {
            vbW = svg.viewBox.baseVal.width
            vbH = svg.viewBox.baseVal.height
            amp = vbH * 0.055
          }

          // Rise: fillY goes from vbH+amp (below) to -amp (above cap)
          const fillY = (vbH + amp) - clampedProgress * (vbH + amp * 2)

          // Slosh horizontal offset cycles continuously
          const sloshT = (now % CONFIG.sloshCycle) / CONFIG.sloshCycle
          const offsetX = sloshT * vbW

          const path1 = buildWavePath(vbW, vbH, amp, offsetX, fillY)
          const path2 = buildWavePath(vbW, vbH, amp * 0.7, (offsetX + vbW * 0.4) % vbW, fillY + amp * 0.8)

          w1.setAttribute('d', path1)
          w2.setAttribute('d', path2)

          // Clip rect height just needs to cover full viewBox
          cr.setAttribute('y', String(fillY - amp - 2))
          cr.setAttribute('height', String(vbH - fillY + amp + 200))
        }

        if (t >= 1 && pageReadyRef.current) {
          phase = 'hold'
          fillStart = now
        }

        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (phase === 'hold') {
        if (elapsed >= CONFIG.holdDuration) {
          phase = 'zoom'
          fillStart = now
        }
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (phase === 'zoom') {
        const t = Math.min(elapsed / CONFIG.zoomDuration, 1)
        const ez = easeIn(t)

        // Scale word from 1 → 6 from center
        const scale = 1 + ez * 5
        // Fade fill color toward background as it zooms
        const opacity = 1 - ez * 0.9

        const inner = innerRef.current
        if (inner) {
          inner.style.transform = `scale(${scale})`
          inner.style.opacity = String(opacity)
        }

        if (t >= 1) {
          // Final fade of overlay
          animCompleteRef.current = true
          setState('exiting')
          return
        }

        rafRef.current = requestAnimationFrame(tick)
        return
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle the exiting → hidden transition (CSS opacity fade)
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

  // ── SVG layout constants ─────────────────────────────────────
  // We use a fixed viewBox; the SVG scales via CSS to fill clamp() font-size.
  // "Hello" in Geologica 800 at 120px ≈ 550 wide, cap height ≈ 90
  const VBW = 590
  const VBH = 100
  const FONT_SIZE = 112       // within the viewBox
  const TEXT_Y = VBH - 5      // baseline

  // Clip path ID must be unique
  const CLIP_ID = 'preloader-clip-hello'
  const CLIP2_ID = 'preloader-clip-hello-2'

  return (
    <div
      className="preloader"
      data-state={state}
      data-reduced={reducedMotion ? '' : undefined}
      style={{
        opacity: state === 'exiting' ? 0 : 1,
        transition: state === 'exiting' ? `opacity ${CONFIG.fadeDuration}ms ease` : 'none',
      }}
      aria-hidden="true"
      aria-label="Page loading"
    >
      <div
        ref={innerRef}
        className="preloader__inner"
        style={{ transformOrigin: 'center center' }}
      >
        {/* ── SVG with clamp-responsive width ── */}
        <svg
          ref={svgRef}
          className="preloader__svg"
          viewBox={`0 0 ${VBW} ${VBH}`}
          style={{
            width: 'clamp(280px, 82vw, 860px)',
            height: 'auto',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Clip by "Hello" text shape — for wave 1 */}
            <clipPath id={CLIP_ID}>
              <text
                x="0"
                y={TEXT_Y}
                fontSize={FONT_SIZE}
                fontFamily="'Geologica', system-ui, sans-serif"
                fontWeight="800"
                letterSpacing="-0.04em"
              >
                Hello
              </text>
            </clipPath>

            {/* Clip by "Hello" text shape — for wave 2 */}
            <clipPath id={CLIP2_ID}>
              <text
                x="0"
                y={TEXT_Y}
                fontSize={FONT_SIZE}
                fontFamily="'Geologica', system-ui, sans-serif"
                fontWeight="800"
                letterSpacing="-0.04em"
              >
                Hello
              </text>
            </clipPath>
          </defs>

          {/* ── Dim (unfilled) text layer ── */}
          <text
            x="0"
            y={TEXT_Y}
            fontSize={FONT_SIZE}
            fontFamily="'Geologica', system-ui, sans-serif"
            fontWeight="800"
            letterSpacing="-0.04em"
            className="preloader__text-dim"
          >
            Hello
          </text>

          {/* ── Wave 2 (depth layer, lower opacity, slightly offset) ── */}
          <g clipPath={`url(#${CLIP2_ID})`}>
            <path
              ref={wave2Ref}
              className="preloader__wave-2"
              d={`M -${VBW} ${VBH + 20} L ${VBW * 2} ${VBH + 20} Z`}
            />
          </g>

          {/* ── Wave 1 (primary liquid) ── */}
          <g clipPath={`url(#${CLIP_ID})`}>
            <path
              ref={wave1Ref}
              className="preloader__liquid-fill"
              d={`M -${VBW} ${VBH + 20} L ${VBW * 2} ${VBH + 20} Z`}
            />
          </g>
        </svg>

        {/* ── Counter ── */}
        <span className="preloader__counter">
          loading... {counter} %
        </span>
      </div>
    </div>
  )
}
