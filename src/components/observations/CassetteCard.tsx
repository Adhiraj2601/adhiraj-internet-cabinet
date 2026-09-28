import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { type Post } from '../../content/posts'
import { formatTapeDate, formatTapeNumber } from '../../lib/utils'
import './observations.css'

interface CassetteCardProps {
  post: Post
  allObservations?: Post[]
  index?: number
  onClick?: () => void
  isPlaying?: boolean
  className?: string
  isInteractive?: boolean
}

export function RoughenFilterDefs() {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="roughen" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="42" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

export function CassetteCard({
  post,
  allObservations = [],
  index = 0,
  onClick,
  isPlaying = false,
  className = '',
  isInteractive = true,
}: CassetteCardProps) {
  const textRef = useRef<SVGTextElement>(null)
  const [fontSize, setFontSize] = useState(32)

  const tapeNumber = formatTapeNumber(post, allObservations)
  const tapeDate = formatTapeDate(post.date || '')

  // Measure title and scale down smoothly to fit on one line (18px - 38px)
  useLayoutEffect(() => {
    if (!textRef.current) return
    const maxW = 415
    const baseSize = 34
    textRef.current.style.fontSize = `${baseSize}px`
    try {
      const currentW = textRef.current.getComputedTextLength?.() || textRef.current.getBBox().width
      if (currentW > maxW) {
        const scale = maxW / currentW
        const computed = Math.max(18, Math.min(36, Math.floor(baseSize * scale)))
        setFontSize(computed)
      } else {
        // For short titles like "Chot", keep large ~36px
        if (post.title.length < 10) {
          setFontSize(36)
        } else {
          setFontSize(32)
        }
      }
    } catch {
      const len = post.title.length
      if (len > 36) setFontSize(19)
      else if (len > 25) setFontSize(24)
      else if (len > 12) setFontSize(30)
      else setFontSize(36)
    }
  }, [post.title])

  const content = (
    <div
      className={`cassette-card w-full relative select-none ${
        isPlaying ? 'cassette-playing' : ''
      } ${isInteractive ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-1' : ''} ${className}`}
    >
      <svg
        viewBox="0 0 520 345"
        className="w-full h-auto block drop-shadow-[2px_2px_0px_#000000]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 1. Body Outline and Fill: #A8CB7C */}
        <path
          d="M 22 20 C 130 15, 390 15, 498 21 C 504 90, 503 240, 498 326 C 390 330, 130 330, 22 325 C 16 240, 16 90, 22 20 Z"
          fill="#A8CB7C"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#roughen)"
        />

        {/* 2. Top Label Strip: Cream rectangle #E8E3CE */}
        <rect
          x="36"
          y="28"
          width="448"
          height="94"
          rx="6"
          fill="#E8E3CE"
          stroke="#000000"
          strokeWidth="2.5"
          filter="url(#roughen)"
        />

        {/* Two horizontal ruled lines */}
        <line
          x1="52"
          y1="82"
          x2="468"
          y2="82"
          stroke="#1A2E05"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          filter="url(#roughen)"
        />
        <line
          x1="52"
          y1="106"
          x2="468"
          y2="106"
          stroke="#1A2E05"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          filter="url(#roughen)"
        />

        {/* Single-line Auto-fitted Title sitting on top line */}
        <text
          ref={textRef}
          x="260"
          y="74"
          textAnchor="middle"
          fill="#2F5A1A"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {post.title}
        </text>

        {/* 3. Tape Window (middle): Cream cutout #DDD8C2 */}
        <rect
          x="88"
          y="136"
          width="344"
          height="94"
          rx="16"
          fill="#DDD8C2"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
          filter="url(#roughen)"
        />

        {/* Left Reel */}
        <g id="left-reel">
          {/* Reel Outer Rim */}
          <circle cx="164" cy="183" r="32" fill="#DDD8C2" stroke="#000000" strokeWidth="2.5" />
          <circle cx="164" cy="183" r="14" fill="#DDD8C2" stroke="#000000" strokeWidth="2" />
          <circle cx="164" cy="183" r="5" fill="#1A2E05" />

          {/* Dedicated wrapper group positioning at reel center (164, 183) */}
          <g transform="translate(164, 183)">
            {/* 6 Radial Spokes (spinning clockwise on hover) */}
            <g className="cassette-reel-left">
              <line x1="0" y1="-32" x2="0" y2="-14" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="14" x2="0" y2="32" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-28" y1="-16" x2="-12" y2="-7" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="7" x2="28" y2="16" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-28" y1="16" x2="-12" y2="7" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="-7" x2="28" y2="-16" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* Center Green Window #8AA468 with dashed line */}
        <rect
          x="234"
          y="166"
          width="52"
          height="34"
          rx="3"
          fill="#8AA468"
          stroke="#000000"
          strokeWidth="2"
        />
        <line
          x1="242"
          y1="183"
          x2="278"
          y2="183"
          stroke="#1A2E05"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />

        {/* Right Reel */}
        <g id="right-reel">
          {/* Reel Outer Rim */}
          <circle cx="356" cy="183" r="32" fill="#DDD8C2" stroke="#000000" strokeWidth="2.5" />
          <circle cx="356" cy="183" r="14" fill="#DDD8C2" stroke="#000000" strokeWidth="2" />
          <circle cx="356" cy="183" r="5" fill="#1A2E05" />

          {/* Dedicated wrapper group positioning at reel center (356, 183) */}
          <g transform="translate(356, 183)">
            {/* 6 Radial Spokes (spinning counter-clockwise on hover) */}
            <g className="cassette-reel-right">
              <line x1="0" y1="-32" x2="0" y2="-14" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="14" x2="0" y2="32" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-28" y1="-16" x2="-12" y2="-7" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="7" x2="28" y2="16" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-28" y1="16" x2="-12" y2="7" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="-7" x2="28" y2="-16" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* 4. Text on the body (above trapezoid): Dark Green #2F5A1A */}
        {/* Left: No.### */}
        <text
          x="38"
          y="256"
          fill="#2F5A1A"
          style={{
            fontSize: '30px',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
          }}
        >
          {tapeNumber}
        </text>

        {/* Right: Date */}
        <text
          x="482"
          y="256"
          textAnchor="end"
          fill="#2F5A1A"
          style={{
            fontSize: '22px',
            fontFamily: "'Space Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {tapeDate}
        </text>

        {/* 5. Bottom Trapezoid */}
        <path
          d="M 68 266 L 452 266 L 476 325 L 44 325 Z"
          fill="#A8CB7C"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
          filter="url(#roughen)"
        />

        {/* 5 Screw/Head circles in a shallow arc */}
        <circle cx="108" cy="298" r="6.5" fill="#E8E3CE" stroke="#000000" strokeWidth="2" />
        <circle cx="184" cy="292" r="6.5" fill="#E8E3CE" stroke="#000000" strokeWidth="2" />
        <circle cx="260" cy="285" r="6.5" fill="#E8E3CE" stroke="#000000" strokeWidth="2" />
        <circle cx="336" cy="292" r="6.5" fill="#E8E3CE" stroke="#000000" strokeWidth="2" />
        <circle cx="412" cy="298" r="6.5" fill="#E8E3CE" stroke="#000000" strokeWidth="2" />
      </svg>
    </div>
  )

  if (!isInteractive) {
    return content
  }

  return (
    <motion.button
      type="button"
      layoutId={`tape-${post.slug}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: (index % 12) * 0.04 }}
      onClick={onClick}
      aria-label={`Play observation: ${post.title}`}
      className="cassette-button group w-full text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      {content}
    </motion.button>
  )
}
