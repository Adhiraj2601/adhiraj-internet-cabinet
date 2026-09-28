export function DoodleBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ backgroundColor: '#EDE8D4' }}
    >
      {/* Behind the TV: Large soft pale-green circular background */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 'min(72vh, 670px)',
          height: 'min(72vh, 670px)',
          backgroundColor: '#CCE4AB',
          zIndex: 1,
        }}
      />

      {/* Bottom-Left Corner Hatching Patch */}
      <svg
        className="absolute left-0 bottom-0 pointer-events-none"
        style={{ width: 'min(24vw, 200px)', height: 'min(22vw, 180px)', zIndex: 2 }}
        viewBox="0 0 180 160"
        fill="none"
      >
        <line x1="0" y1="40" x2="60" y2="0" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="0" y1="70" x2="105" y2="0" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="0" y1="100" x2="150" y2="0" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="0" y1="130" x2="180" y2="10" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="10" y1="160" x2="180" y2="45" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="40" y1="160" x2="180" y2="65" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="70" y1="160" x2="180" y2="85" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="100" y1="160" x2="180" y2="105" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
      </svg>

      {/* Top-Right Corner Hatching Patch */}
      <svg
        className="absolute right-0 top-0 pointer-events-none"
        style={{ width: 'min(22vw, 190px)', height: 'min(20vw, 170px)', zIndex: 2 }}
        viewBox="0 0 170 160"
        fill="none"
      >
        <line x1="30" y1="0" x2="170" y2="100" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="60" y1="0" x2="170" y2="80" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="90" y1="0" x2="170" y2="60" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="120" y1="0" x2="170" y2="38" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="15" y1="15" x2="170" y2="125" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
        <line x1="0" y1="45" x2="170" y2="160" stroke="#7A9660" strokeWidth="1.8" strokeOpacity="0.45" />
      </svg>

      {/* 1. Five-pointed star (Top-Left) */}
      <div className="floating-doodle doodle-star">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path
            d="M 17 2 L 21.5 12 L 32.5 13 L 24 20.5 L 26.5 31.5 L 17 26 L 7.5 31.5 L 10 20.5 L 1.5 13 L 12.5 12 Z"
            fill="#A8CB7C"
            stroke="#2F5A1A"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 2. Top-Left Radiating Sound Waves / Signals */}
      <div className="floating-doodle doodle-waves-left">
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" stroke="#2F5A1A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 6 25 C 10 11, 24 10, 36 15" />
          <path d="M 11 27 C 14 17, 23 17, 31 20" />
          <path d="M 17 29 C 19 23, 23 23, 27 25" />
        </svg>
      </div>

      {/* 3. Left Asterisk-like Sparkle */}
      <div className="floating-doodle doodle-asterisk-left">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2F5A1A" strokeWidth="2.4" strokeLinecap="round">
          <line x1="13" y1="3" x2="13" y2="23" />
          <line x1="3" y1="13" x2="23" y2="13" />
          <line x1="6" y1="6" x2="20" y2="20" />
          <line x1="6" y1="20" x2="20" y2="6" />
        </svg>
      </div>

      {/* 4. Musical Notes (♫ connected eighth notes) */}
      <div className="floating-doodle doodle-music">
        <svg width="28" height="30" viewBox="0 0 28 30" fill="none">
          <ellipse cx="6" cy="24" rx="4.5" ry="3.5" fill="#2F5A1A" transform="rotate(-15 6 24)" />
          <ellipse cx="20" cy="20" rx="4.5" ry="3.5" fill="#2F5A1A" transform="rotate(-15 20 20)" />
          <path d="M 9.5 23 L 9.5 6 L 23.5 3 L 23.5 19" stroke="#2F5A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 9.5 6 L 23.5 3" stroke="#2F5A1A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 5. Miniature Cassette Tape Icon (tilted ~-10°) */}
      <div className="floating-doodle doodle-mini-cassette">
        <svg width="44" height="28" viewBox="0 0 44 28" fill="none" transform="rotate(-10)">
          <rect x="1.5" y="1.5" width="41" height="25" rx="3.5" fill="#A8CB7C" stroke="#2F5A1A" strokeWidth="2" />
          <rect x="7" y="5" width="30" height="12" rx="2" fill="#E8E3CE" stroke="#2F5A1A" strokeWidth="1.5" />
          <circle cx="15" cy="11" r="3" fill="#A8CB7C" stroke="#2F5A1A" strokeWidth="1.5" />
          <circle cx="29" cy="11" r="3" fill="#A8CB7C" stroke="#2F5A1A" strokeWidth="1.5" />
          <line x1="9" y1="22" x2="35" y2="22" stroke="#2F5A1A" strokeWidth="1.5" />
        </svg>
      </div>

      {/* 6. Top-Right Radiating Sound Waves / Signals */}
      <div className="floating-doodle doodle-waves-right">
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" stroke="#2F5A1A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 6 25 C 10 11, 24 10, 36 15" />
          <path d="M 11 27 C 14 17, 23 17, 31 20" />
          <path d="M 17 29 C 19 23, 23 23, 27 25" />
        </svg>
      </div>

      {/* 7. Upper-Right Small Archimedean Spiral */}
      <div className="floating-doodle doodle-spiral">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2F5A1A" strokeWidth="2.2" strokeLinecap="round">
          <path d="M 13 13 m -2 0 a 2 2 0 1 0 4 0 a 4 4 0 1 0 -8 0 a 7 7 0 1 0 13 0 a 10 10 0 1 0 -18 0" />
        </svg>
      </div>

      {/* 8. Curved Arrow pointing up-right */}
      <div className="floating-doodle doodle-arrow">
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" stroke="#2F5A1A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 24 C 8 8, 20 5, 29 9" />
          <path d="M 21 6 L 30 9 L 26 18" />
        </svg>
      </div>

      {/* 9. Right Asterisk-like Sparkle */}
      <div className="floating-doodle doodle-asterisk-right">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2F5A1A" strokeWidth="2.4" strokeLinecap="round">
          <line x1="13" y1="3" x2="13" y2="23" />
          <line x1="3" y1="13" x2="23" y2="13" />
          <line x1="6" y1="6" x2="20" y2="20" />
          <line x1="6" y1="20" x2="20" y2="6" />
        </svg>
      </div>

      {/* 10. Sun Icon with Radiating Rays */}
      <div className="floating-doodle doodle-sun">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#2F5A1A" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="18" cy="18" r="6" fill="#A8CB7C" />
          <line x1="18" y1="3" x2="18" y2="7" />
          <line x1="18" y1="29" x2="18" y2="33" />
          <line x1="3" y1="18" x2="7" y2="18" />
          <line x1="29" y1="18" x2="33" y2="18" />
          <line x1="7.5" y1="7.5" x2="10.5" y2="10.5" />
          <line x1="25.5" y1="25.5" x2="28.5" y2="28.5" />
          <line x1="7.5" y1="28.5" x2="10.5" y2="25.5" />
          <line x1="25.5" y1="10.5" x2="28.5" y2="7.5" />
        </svg>
      </div>

      {/* 11. Small Squiggly Wavy Line */}
      <div className="floating-doodle doodle-squiggly">
        <svg width="38" height="16" viewBox="0 0 38 16" fill="none" stroke="#2F5A1A" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 3 8 Q 8 2, 13 8 T 23 8 T 33 8" />
        </svg>
      </div>

      {/* 12. Bracket Doodle */}
      <div className="floating-doodle doodle-bracket">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2F5A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 4 16 L 4 4 L 14 4 L 14 16" />
        </svg>
      </div>

      {/* 13. Bottom Cluster of Dots */}
      <div className="floating-doodle doodle-dots-bottom">
        <svg width="34" height="24" viewBox="0 0 34 24" fill="#2F5A1A">
          <circle cx="6" cy="16" r="2.5" />
          <circle cx="16" cy="10" r="2.2" />
          <circle cx="26" cy="14" r="2.8" />
          <circle cx="21" cy="20" r="2" />
        </svg>
      </div>
    </div>
  )
}
