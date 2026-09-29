import { useId, useMemo } from 'react'

/**
 * Animated diagonal wavy-stripe background (recreated from the "Scene.mp4" loop).
 *
 * Pure SVG + CSS: no video file, resolution-independent, ~0 KB, no watermark.
 * Drop it as the FIRST child of any `relative overflow-hidden` container and
 * give the real content `relative z-10` so it sits on top.
 *
 * Measured from the source video (1280x720 @ 30fps, 10s loop):
 *  - stripes run "/" at 45deg, colour pair #9CE868 (dark) / #B8F88C (light)
 *  - stripe spacing (dark+light)   ~26.5px
 *  - ripple wavelength along stripe ~105px, amplitude ~4.5px
 *  - ripple slides down-left along the stripes at ~168px/s (one wavelength per 0.625s)
 */

type Props = {
  /** Colour of the darker stripe. */
  dark?: string
  /** Colour of the lighter stripe. */
  light?: string
  /** Scales the whole pattern (1 = same pixel size as the video at 1280w). */
  scale?: number
  /** Seconds for the ripple to travel one wavelength. Bigger = slower. */
  duration?: number
  className?: string
}

const PERIOD = 26.5 // distance between two stripes of the same colour
const WAVELENGTH = 105 // length of one ripple along the stripe
const AMPLITUDE = 5 // how far the stripe edges wobble
const STEPS = 36 // polyline resolution per wavelength (smooth enough)

/** Path for one light band whose top/bottom edges follow a sine wave. */
function bandPath(yOffset: number): string {
  const top = PERIOD * 0.25 + yOffset
  const bottom = PERIOD * 0.75 + yOffset
  const wave = (x: number) => AMPLITUDE * Math.sin((2 * Math.PI * x) / WAVELENGTH)

  let d = ''
  for (let i = 0; i <= STEPS; i++) {
    const x = (i / STEPS) * WAVELENGTH
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${(top + wave(x)).toFixed(2)} `
  }
  for (let i = STEPS; i >= 0; i--) {
    const x = (i / STEPS) * WAVELENGTH
    d += `L${x.toFixed(2)} ${(bottom + wave(x)).toFixed(2)} `
  }
  return d + 'Z'
}

export function WavyStripes({
  dark = '#9CE868',
  light = '#B8F88C',
  scale = 1,
  duration = 0.625,
  className = '',
}: Props) {
  const id = useId().replace(/:/g, '')
  // Three copies (-1, 0, +1 period) so the wavy band never gets clipped at tile edges.
  const paths = useMemo(() => [-PERIOD, 0, PERIOD].map(bandPath), [])

  return (
    <div
      aria-hidden="true"
      className={`wavy-stripes pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ containerType: 'size' }}
    >
      {/* Square big enough to cover the parent after a 45deg rotation */}
      <svg
        className="wavy-stripes__canvas"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 'calc(100cqw + 100cqh)',
          height: 'calc(100cqw + 100cqh)',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
        }}
      >
        <defs>
          <pattern
            id={`${id}-p`}
            width={WAVELENGTH}
            height={PERIOD}
            patternUnits="userSpaceOnUse"
            patternTransform={`scale(${scale})`}
          >
            <rect width={WAVELENGTH} height={PERIOD} fill={dark} />
            {paths.map((d, i) => (
              <path key={i} d={d} fill={light} />
            ))}
          </pattern>
        </defs>
        {/* Extra WAVELENGTH on the left so the slide never reveals an empty edge */}
        <g
          className="wavy-stripes__slide"
          style={{
            animationDuration: `${duration}s`,
            ['--wave-shift' as string]: `${-WAVELENGTH * scale}px`,
          }}
        >
          <rect
            x={-WAVELENGTH * scale * 2}
            y="0"
            width="200%"
            height="100%"
            fill={`url(#${id}-p)`}
          />
        </g>
      </svg>
    </div>
  )
}
