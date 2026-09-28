export function DoodleBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ backgroundColor: '#ECE8D3' }}>
      {/* Behind the TV: Large soft pale-green circular glow (~55-60% of viewport height) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 'min(62vh, 650px)',
          height: 'min(62vh, 650px)',
          backgroundColor: '#C9E0AE',
          filter: 'blur(30px)',
          opacity: 0.85,
        }}
      />

      {/* SVG Container for scattered hand-drawn doodles */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#2F5A1A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.68 }}
      >
        {/* ================= TOP-LEFT ================= */}
        {/* 4-Point Star */}
        <g className="doodle-float-1" transform="translate(60, 50)">
          <path d="M 25 0 Q 25 25 0 25 Q 25 25 25 50 Q 25 25 50 25 Q 25 25 25 0 Z" fill="#2F5A1A" fillOpacity="0.12" />
        </g>

        {/* Wifi Arcs (3 curved lines) */}
        <g className="doodle-float-2" transform="translate(140, 65)">
          <path d="M 0 35 A 40 40 0 0 1 50 35" />
          <path d="M 10 42 A 26 26 0 0 1 40 42" />
          <circle cx="25" cy="48" r="2.5" fill="#2F5A1A" />
        </g>

        {/* ================= LEFT & LEFT-MIDDLE ================= */}
        {/* Music Note */}
        <g className="doodle-float-2" transform="translate(70, 260)">
          <ellipse cx="14" cy="38" rx="8" ry="6" fill="#2F5A1A" transform="rotate(-20 14 38)" />
          <path d="M 21 36 L 21 12 C 21 12, 34 8, 38 18" />
        </g>

        {/* Small Asterisk / Sparkle */}
        <g className="doodle-float-1" transform="translate(150, 380)">
          <line x1="16" y1="4" x2="16" y2="28" />
          <line x1="4" y1="16" x2="28" y2="16" />
          <line x1="7" y1="7" x2="25" y2="25" />
          <line x1="7" y1="25" x2="25" y2="7" />
        </g>

        {/* ================= BOTTOM-LEFT ================= */}
        {/* Diagonal Hatching Patch */}
        <g transform="translate(30, calc(100% - 150px))">
          <line x1="0" y1="40" x2="40" y2="0" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="0" y1="60" x2="60" y2="0" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="10" y1="80" x2="80" y2="10" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="30" y1="90" x2="90" y2="30" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="50" y1="100" x2="100" y2="50" strokeWidth="2" strokeOpacity="0.7" />
        </g>

        {/* Tiny Cassette Doodle */}
        <g className="doodle-float-2" transform="translate(130, calc(100% - 180px))">
          <rect x="0" y="0" width="56" height="36" rx="4" fill="none" strokeWidth="2.2" />
          <rect x="12" y="10" width="32" height="16" rx="2" fill="none" strokeWidth="1.8" />
          <circle cx="20" cy="18" r="3.5" fill="#2F5A1A" />
          <circle cx="36" cy="18" r="3.5" fill="#2F5A1A" />
        </g>

        {/* Squiggle and dots near bottom */}
        <g transform="translate(240, calc(100% - 90px))">
          <path d="M 0 15 Q 20 0, 40 15 T 80 15 T 120 15" strokeWidth="2" />
          <circle cx="140" cy="15" r="2.5" fill="#2F5A1A" />
          <circle cx="155" cy="15" r="2.5" fill="#2F5A1A" />
        </g>

        {/* ================= TOP-RIGHT ================= */}
        {/* Top-Right Hatch Patch */}
        <g transform="translate(calc(100% - 120px), 25)">
          <line x1="0" y1="30" x2="30" y2="0" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="15" y1="45" x2="45" y2="15" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="30" y1="60" x2="60" y2="30" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="45" y1="75" x2="75" y2="45" strokeWidth="2" strokeOpacity="0.7" />
        </g>

        {/* Wifi Arcs */}
        <g className="doodle-float-1" transform="translate(calc(100% - 210px), 65)">
          <path d="M 0 35 A 40 40 0 0 1 50 35" />
          <path d="M 10 42 A 26 26 0 0 1 40 42" />
          <circle cx="25" cy="48" r="2.5" fill="#2F5A1A" />
        </g>

        {/* Spiral */}
        <g className="doodle-float-2" transform="translate(calc(100% - 140px), 170)">
          <path
            d="M 25 25 m -20 0 a 20 20 0 1 0 40 0 a 16 16 0 1 0 -32 0 a 12 12 0 1 0 24 0 a 8 8 0 1 0 -16 0"
            strokeWidth="2.2"
          />
        </g>

        {/* ================= RIGHT ================= */}
        {/* Sun (circle with rays) */}
        <g className="doodle-float-1" transform="translate(calc(100% - 130px), 320)">
          <circle cx="25" cy="25" r="14" fill="#2F5A1A" fillOpacity="0.1" strokeWidth="2.2" />
          <line x1="25" y1="3" x2="25" y2="8" strokeWidth="2" />
          <line x1="25" y1="42" x2="25" y2="47" strokeWidth="2" />
          <line x1="3" y1="25" x2="8" y2="25" strokeWidth="2" />
          <line x1="42" y1="25" x2="47" y2="25" strokeWidth="2" />
          <line x1="9" y1="9" x2="13" y2="13" strokeWidth="2" />
          <line x1="37" y1="37" x2="41" y2="41" strokeWidth="2" />
          <line x1="9" y1="41" x2="13" y2="37" strokeWidth="2" />
          <line x1="37" y1="9" x2="41" y2="13" strokeWidth="2" />
        </g>

        {/* Curved Arrow */}
        <g className="doodle-float-2" transform="translate(calc(100% - 190px), 460)">
          <path d="M 10 40 C 35 38, 50 20, 42 5" strokeWidth="2.2" />
          <path d="M 34 2 L 43 5 L 45 15" strokeWidth="2.2" />
        </g>

        {/* Asterisk / Sparkle */}
        <g className="doodle-float-1" transform="translate(calc(100% - 100px), calc(100% - 160px))">
          <line x1="16" y1="4" x2="16" y2="28" strokeWidth="2" />
          <line x1="4" y1="16" x2="28" y2="16" strokeWidth="2" />
          <line x1="7" y1="7" x2="25" y2="25" strokeWidth="2" />
          <line x1="7" y1="25" x2="25" y2="7" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}
