// Pre-computed wavy lines for the background circle
const WAVY_CIRCLE_STRIPES = Array.from({ length: 65 }, (_, i) => {
  const x = -80 + i * 16
  const isDark = i % 2 === 0
  const color = isDark ? '#A2C872' : '#DCF2B7'
  const opacity = isDark ? 0.6 : 0.45
  let d = `M ${x} -30 `
  for (let y = 0; y < 920; y += 100) {
    const offset = (y / 100) % 2 === 0 ? 7 : -7
    d += `Q ${x + offset} ${y + 50}, ${x} ${y + 100} `
  }
  return { d, color, opacity, id: i }
})

// Pre-computed bottom-left hatched lines (slanted top-left to bottom-right ~60°)
const BL_HATCH_LINES = Array.from({ length: 36 }, (_, i) => {
  const offset = -110 + i * 11
  return {
    x1: offset,
    y1: 0,
    x2: offset + 125,
    y2: 220,
    id: i,
  }
})

// Pre-computed top-right hatched lines (slanted top-left to bottom-right ~60°)
const TR_HATCH_LINES = Array.from({ length: 36 }, (_, i) => {
  const offset = -50 + i * 11
  return {
    x1: offset,
    y1: 0,
    x2: offset + 125,
    y2: 220,
    id: i,
  }
})

export function DoodleBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ backgroundColor: '#EDE8D4' }}
    >
      {/* Area 1: Behind the TV - Large pale-green circle with alternating wavy lines */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none overflow-hidden"
        style={{
          width: 'min(96vh, 880px)',
          height: 'min(96vh, 880px)',
          backgroundColor: '#CCE4AB',
          zIndex: 1,
        }}
      >
        <svg viewBox="0 0 880 880" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <filter id="circle-doodle-wobble" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <rect width="880" height="880" fill="#CCE4AB" />
          <g filter="url(#circle-doodle-wobble)" transform="rotate(18 440 440)">
            {WAVY_CIRCLE_STRIPES.map((stripe) => (
              <path
                key={stripe.id}
                d={stripe.d}
                stroke={stripe.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeOpacity={stripe.opacity}
                fill="none"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Area 2: Bottom-Left Corner Hatching Patch (slanted top-left to bottom-right, dense & bold) */}
      <div
        className="absolute left-0 bottom-0 pointer-events-none overflow-hidden"
        style={{ width: 'min(28vw, 250px)', height: 'min(26vw, 220px)', zIndex: 2 }}
      >
        <svg viewBox="0 0 250 220" className="w-full h-full">
          <defs>
            <clipPath id="bl-corner-clip">
              <polygon points="0,75 160,25 225,105 225,220 0,220" />
            </clipPath>
            <filter id="bl-hatch-rough" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g clipPath="url(#bl-corner-clip)" filter="url(#bl-hatch-rough)">
            {BL_HATCH_LINES.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#527330"
                strokeWidth="3"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Area 3: Top-Right Corner Hatching Patch (slanted top-left to bottom-right, dense & bold, behind spiral) */}
      <div
        className="absolute right-0 top-0 pointer-events-none overflow-hidden"
        style={{ width: 'min(28vw, 250px)', height: 'min(26vw, 210px)', zIndex: 2 }}
      >
        <svg viewBox="0 0 250 210" className="w-full h-full">
          <defs>
            <clipPath id="tr-corner-clip">
              <polygon points="35,0 250,0 250,210 95,120" />
            </clipPath>
            <filter id="tr-hatch-rough" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <g clipPath="url(#tr-corner-clip)" filter="url(#tr-hatch-rough)">
            {TR_HATCH_LINES.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#527330"
                strokeWidth="3"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* 1. Scaled 5-pointed star (Top-Left) with bold stroke & vibrant green fill */}
      <div className="floating-doodle doodle-star">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" transform="rotate(-10)">
          <path
            d="M 24 3 L 30 17 L 45 18 L 33 28 L 37 43 L 24 35 L 11 43 L 15 28 L 3 18 L 18 17 Z"
            fill="#A4CC74"
            stroke="#244912"
            strokeWidth="3.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 2. Scaled Radiating Sound Waves (Top-Left) with bold sweeping arcs */}
      <div className="floating-doodle doodle-waves-left">
        <svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="#244912" strokeWidth="3.6" strokeLinecap="round">
          <path d="M 8 36 C 14 15, 34 14, 50 20" />
          <path d="M 16 38 C 20 23, 33 23, 44 27" />
          <path d="M 24 40 C 27 31, 33 31, 39 34" />
        </svg>
      </div>

      {/* 3. Scaled Left Asterisk with bold spokes */}
      <div className="floating-doodle doodle-asterisk-left">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round">
          <line x1="19" y1="4" x2="19" y2="34" />
          <line x1="4" y1="19" x2="34" y2="19" />
          <line x1="8" y1="8" x2="30" y2="30" />
          <line x1="8" y1="30" x2="30" y2="8" />
        </svg>
      </div>

      {/* 4. Scaled Musical Notes (♫) with chunky filled heads and bold beam */}
      <div className="floating-doodle doodle-music">
        <svg width="38" height="46" viewBox="0 0 38 46" fill="none">
          <ellipse cx="9" cy="37" rx="6.5" ry="5" fill="#244912" transform="rotate(-15 9 37)" />
          <ellipse cx="29" cy="31" rx="6.5" ry="5" fill="#244912" transform="rotate(-15 29 31)" />
          <path d="M 13.5 35 L 13.5 9 L 33.5 4.5 L 33.5 29" stroke="#244912" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 13.5 9 L 33.5 4.5" stroke="#244912" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 5. Scaled Miniature Cassette Tape with bold outer border and hollow spools */}
      <div className="floating-doodle doodle-mini-cassette">
        <svg width="64" height="42" viewBox="0 0 64 42" fill="none" transform="rotate(-12)">
          <rect x="2" y="2" width="60" height="38" rx="4.5" fill="#A4CC74" stroke="#244912" strokeWidth="3.4" />
          <circle cx="21" cy="18" r="6" stroke="#244912" strokeWidth="3" fill="#A4CC74" />
          <circle cx="43" cy="18" r="6" stroke="#244912" strokeWidth="3" fill="#A4CC74" />
          <line x1="13" y1="31" x2="51" y2="31" stroke="#244912" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 6. Scaled Radiating Sound Waves (Top-Right) */}
      <div className="floating-doodle doodle-waves-right">
        <svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="#244912" strokeWidth="3.6" strokeLinecap="round">
          <path d="M 8 36 C 14 15, 34 14, 50 20" />
          <path d="M 16 38 C 20 23, 33 23, 44 27" />
          <path d="M 24 40 C 27 31, 33 31, 39 34" />
        </svg>
      </div>

      {/* 7. Scaled Archimedean Spiral with bold hand-drawn coil */}
      <div className="floating-doodle doodle-spiral">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round">
          <path d="M 19 19 m -3 0 a 3 3 0 1 0 6 0 a 6 6 0 1 0 -12 0 a 10 10 0 1 0 19 0 a 14 14 0 1 0 -26 0" />
        </svg>
      </div>

      {/* 8. Scaled Curved Arrow pointing up-right with bold barb */}
      <div className="floating-doodle doodle-arrow">
        <svg width="50" height="40" viewBox="0 0 50 40" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 6 34 C 12 12, 29 8, 42 13" />
          <path d="M 31 9 L 43 13 L 38 25" />
        </svg>
      </div>

      {/* 9. Scaled Right Asterisk */}
      <div className="floating-doodle doodle-asterisk-right">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round">
          <line x1="19" y1="4" x2="19" y2="34" />
          <line x1="4" y1="19" x2="34" y2="19" />
          <line x1="8" y1="8" x2="30" y2="30" />
          <line x1="8" y1="30" x2="30" y2="8" />
        </svg>
      </div>

      {/* 10. Scaled Sun Icon with bold filled center and radiating ray dashes */}
      <div className="floating-doodle doodle-sun">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round">
          <circle cx="26" cy="26" r="9" fill="#A4CC74" />
          <line x1="26" y1="4" x2="26" y2="10" />
          <line x1="26" y1="42" x2="26" y2="48" />
          <line x1="4" y1="26" x2="10" y2="26" />
          <line x1="42" y1="26" x2="48" y2="26" />
          <line x1="10.5" y1="10.5" x2="15" y2="15" />
          <line x1="37" y1="37" x2="41.5" y2="41.5" />
          <line x1="10.5" y1="41.5" x2="15" y2="37" />
          <line x1="37" y1="15" x2="41.5" y2="10.5" />
        </svg>
      </div>

      {/* 11. Scaled Squiggly Wavy Line with bold stroke */}
      <div className="floating-doodle doodle-squiggly">
        <svg width="56" height="24" viewBox="0 0 56 24" fill="none" stroke="#244912" strokeWidth="3.6" strokeLinecap="round">
          <path d="M 4 12 Q 11 3, 18 12 T 32 12 T 46 12" />
        </svg>
      </div>

      {/* 12. Scaled Bracket Doodle (П) */}
      <div className="floating-doodle doodle-bracket">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#244912" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 5 23 L 5 6 L 21 6 L 21 23" />
        </svg>
      </div>

      {/* 13. Scaled Cluster of Bold Dots */}
      <div className="floating-doodle doodle-dots-bottom">
        <svg width="46" height="34" viewBox="0 0 46 34" fill="#244912">
          <circle cx="8" cy="23" r="4.2" />
          <circle cx="22" cy="14" r="3.8" />
          <circle cx="36" cy="20" r="4.5" />
          <circle cx="29" cy="28" r="3.5" />
        </svg>
      </div>
    </div>
  )
}
