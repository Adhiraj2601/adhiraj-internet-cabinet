import React from 'react'
import { motion } from 'framer-motion'
import { type Post } from '../../content/posts'
import { CassetteCard } from './CassetteCard'

interface TvSceneProps {
  post: Post
  allObservations: Post[]
  doorFlapOpen: boolean
  isTapeInserted: boolean
  isTapePlaying: boolean
  children?: React.ReactNode
}

export function TvScene({
  post,
  allObservations,
  doorFlapOpen,
  isTapeInserted,
  isTapePlaying,
  children,
}: TvSceneProps) {
  // TV dimensions: viewBox 0 0 760 640
  // TV body: width 690, height 535 -> 690 / 535 = 1.289 : 1 (matches 1.28 : 1)
  return (
    <div
      className="relative select-none"
      style={{
        height: 'min(76vh, 590px)',
        aspectRatio: '760 / 640',
        maxWidth: '92vw',
        margin: '0 auto',
      }}
    >
      {/* SVG TV Frame & Details */}
      <svg
        viewBox="0 0 760 640"
        className="w-full h-full block overflow-visible drop-shadow-[4px_6px_0px_#000000]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antennas at the top */}
        <g id="tv-antennas" stroke="#000000" strokeWidth="4.5" strokeLinecap="round">
          <line x1="365" y1="65" x2="240" y2="10" />
          <circle cx="240" cy="10" r="7" fill="#1A2E05" />
          <line x1="395" y1="65" x2="520" y2="6" />
          <circle cx="520" cy="6" r="7" fill="#1A2E05" />
        </g>

        {/* TV Main Body Outline and Fill: Fresh Green #A8D277 */}
        {/* 690w x 535h -> 1.289:1 ratio */}
        <path
          d="M 45 76 C 140 64, 620 62, 715 75 C 725 180, 724 470, 716 585 C 620 600, 140 602, 45 588 C 36 470, 36 180, 45 76 Z"
          fill="#A8D277"
          stroke="#000000"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#roughen)"
        />

        {/* Screen Cutout Hole (Taller, deeper CRT hole) */}
        {/* x=65, y=90, w=475, h=415 (ratio: 1.14:1) */}
        <rect
          x="65"
          y="90"
          width="475"
          height="415"
          rx="10"
          fill="#10200A"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
          filter="url(#roughen)"
        />

        {/* Speaker grille lines under the screen */}
        <g id="speaker-grille" stroke="#000000" strokeWidth="3" strokeLinecap="round">
          <line x1="110" y1="535" x2="410" y2="535" />
          <line x1="110" y1="550" x2="410" y2="550" />
        </g>

        {/* Lower-left decorative tab / flap marker */}
        <rect
          x="40"
          y="445"
          width="20"
          height="48"
          rx="3"
          fill="#8BB55C"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Right side controls panel (closer to screen) */}
        {/* Upper large filled dark-green knob #2F5A1A */}
        <circle
          cx="625"
          cy="180"
          r="36"
          fill="#2F5A1A"
          stroke="#000000"
          strokeWidth="4"
          filter="url(#roughen)"
        />
        {/* Knob indicator line */}
        <line x1="625" y1="150" x2="625" y2="166" stroke="#E8E3CE" strokeWidth="3.5" strokeLinecap="round" />

        {/* Lower empty outlined knob */}
        <circle
          cx="625"
          cy="285"
          r="26"
          fill="#A8D277"
          stroke="#000000"
          strokeWidth="3.5"
          filter="url(#roughen)"
        />
        <circle cx="625" cy="285" r="8" fill="#2F5A1A" />

        {/* Small push buttons / indicators */}
        <circle cx="605" cy="365" r="6.5" fill="#000000" />
        <circle cx="645" cy="365" r="6.5" fill="#000000" />

        {/* Right speaker vent lines */}
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
          <line x1="595" y1="415" x2="655" y2="415" />
          <line x1="595" y1="432" x2="655" y2="432" />
          <line x1="595" y1="449" x2="655" y2="449" />
        </g>
      </svg>

      {/* Hinged Tape-Door Flap on the TV's Left Side */}
      <div
        className="absolute"
        style={{
          left: '2.2%',
          top: '30%',
          width: '4.8%',
          height: '18%',
          perspective: '900px',
          zIndex: 20,
        }}
      >
        <motion.div
          animate={{
            rotateY: doorFlapOpen ? -75 : 0,
            x: doorFlapOpen ? -8 : 0,
            scale: doorFlapOpen ? 0.95 : 1,
          }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{
            transformOrigin: 'right center',
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
            backgroundColor: '#95C164',
            border: '2.5px solid #000000',
            borderRadius: '4px',
            boxShadow: '1px 1px 0px #000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            padding: '4px 2px',
          }}
        >
          <div className="w-full h-[2px] bg-black rounded-full" />
          <div className="w-full h-[2px] bg-black rounded-full" />
          <div className="w-full h-[2px] bg-black rounded-full" />
        </motion.div>
      </div>

      {/* Screen Area Portal Child Component (TV screen terminal content) */}
      {/* Position matches screen cutout: left: 8.55%, top: 14.06%, width: 62.5%, height: 64.84% */}
      <div
        className="absolute"
        style={{
          left: '8.55%',
          top: '14.06%',
          width: '62.5%',
          height: '64.84%',
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Docked Cassette at the bottom slot */}
      {/* Top ~48% hidden/occluded, bottom ~52% (No.007, date, screw holes) peeks below TV! */}
      {isTapeInserted && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '26.3%',
            bottom: '-14%',
            width: '47.4%',
            zIndex: 15,
            clipPath: 'polygon(0% 44%, 100% 44%, 100% 100%, 0% 100%)',
          }}
        >
          <CassetteCard
            post={post}
            allObservations={allObservations}
            isPlaying={isTapePlaying}
            isInteractive={false}
          />
        </div>
      )}

      {/* Black Tape Slot Bar (covers the top edge of inserted cassette) */}
      <div
        className="absolute"
        style={{
          left: '26.3%',
          bottom: '5.2%',
          width: '47.4%',
          height: '18px',
          backgroundColor: '#000000',
          borderRadius: '3px',
          border: '1.5px solid #222222',
          boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
          zIndex: 18,
        }}
      />
    </div>
  )
}
