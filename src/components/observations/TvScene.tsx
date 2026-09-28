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
  return (
    <div className="relative w-full max-w-[940px] aspect-[940/700] mx-auto select-none">
      {/* SVG TV Frame & Details */}
      <svg
        viewBox="0 0 940 700"
        className="w-full h-full block overflow-visible drop-shadow-[4px_6px_0px_#000000]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antennas at the top */}
        <g id="tv-antennas" stroke="#000000" strokeWidth="4.5" strokeLinecap="round">
          <line x1="455" y1="75" x2="310" y2="15" />
          <circle cx="310" cy="15" r="7.5" fill="#1A2E05" />
          <line x1="485" y1="75" x2="640" y2="5" />
          <circle cx="640" cy="5" r="7.5" fill="#1A2E05" />
        </g>

        {/* TV Main Body Outline and Fill: Fresh Green #A8D277 */}
        <path
          d="M 52 92 C 160 76, 780 74, 888 90 C 896 220, 895 480, 886 595 C 780 610, 160 612, 54 598 C 45 480, 44 220, 52 92 Z"
          fill="#A8D277"
          stroke="#000000"
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#roughen)"
        />

        {/* Screen Cutout (Dark greenish-black #10200A background) */}
        <rect
          x="75"
          y="105"
          width="580"
          height="430"
          rx="12"
          fill="#10200A"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
          filter="url(#roughen)"
        />

        {/* Speaker grille lines under the screen */}
        <g id="speaker-grille" stroke="#000000" strokeWidth="3" strokeLinecap="round">
          <line x1="120" y1="560" x2="480" y2="560" />
          <line x1="120" y1="575" x2="480" y2="575" />
        </g>

        {/* Lower-left decorative tab / flap marker */}
        <rect
          x="44"
          y="470"
          width="24"
          height="52"
          rx="4"
          fill="#8BB55C"
          stroke="#000000"
          strokeWidth="3"
        />

        {/* Right side controls panel */}
        {/* Upper large filled dark-green knob #2F5A1A */}
        <circle
          cx="768"
          cy="200"
          r="40"
          fill="#2F5A1A"
          stroke="#000000"
          strokeWidth="4"
          filter="url(#roughen)"
        />
        {/* Knob indicator line */}
        <line x1="768" y1="168" x2="768" y2="185" stroke="#E8E3CE" strokeWidth="3.5" strokeLinecap="round" />

        {/* Lower empty outlined knob */}
        <circle
          cx="768"
          cy="315"
          r="30"
          fill="#A8D277"
          stroke="#000000"
          strokeWidth="3.5"
          filter="url(#roughen)"
        />
        <circle cx="768" cy="315" r="10" fill="#2F5A1A" />

        {/* Small push buttons / indicators */}
        <circle cx="738" cy="410" r="7" fill="#000000" />
        <circle cx="798" cy="410" r="7" fill="#000000" />

        {/* Right speaker vent lines */}
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
          <line x1="720" y1="465" x2="816" y2="465" />
          <line x1="720" y1="485" x2="816" y2="485" />
          <line x1="720" y1="505" x2="816" y2="505" />
        </g>
      </svg>

      {/* Hinged Tape-Door Flap on the TV's Left Side */}
      {/* Opens outward to the left with rotateY from 0° -> -75° -> 0° */}
      <div
        className="absolute"
        style={{
          left: '2.5%',
          top: '32%',
          width: '4.5%',
          height: '18%',
          perspective: '900px',
          zIndex: 20,
        }}
      >
        <motion.div
          animate={{
            rotateY: doorFlapOpen ? -75 : 0,
            x: doorFlapOpen ? -10 : 0,
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
          {/* 3 horizontal lines */}
          <div className="w-full h-[2px] bg-black rounded-full" />
          <div className="w-full h-[2px] bg-black rounded-full" />
          <div className="w-full h-[2px] bg-black rounded-full" />
        </motion.div>
      </div>

      {/* Screen Area Portal Child Component (TV screen terminal content) */}
      <div
        className="absolute"
        style={{
          left: '7.98%',
          top: '15.0%',
          width: '61.7%',
          height: '61.4%',
          zIndex: 10,
        }}
      >
        {children}
      </div>

      {/* Docked Cassette at the bottom slot */}
      {/* Positioned so top ~half is behind the TV bottom slot bar, and bottom half peeks out! */}
      {isTapeInserted && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '30%',
            bottom: '-12%',
            width: '40%',
            zIndex: 15,
          }}
        >
          <div className="relative">
            {/* Cassette Card rendered with spinning reels */}
            <CassetteCard
              post={post}
              allObservations={allObservations}
              isPlaying={isTapePlaying}
              isInteractive={false}
            />
          </div>
        </div>
      )}

      {/* Black Tape Slot Bar (covers top half of the inserted cassette) */}
      <div
        className="absolute"
        style={{
          left: '32%',
          bottom: '12%',
          width: '36%',
          height: '18px',
          backgroundColor: '#000000',
          borderRadius: '4px',
          border: '1.5px solid #222222',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
          zIndex: 18,
        }}
      />
    </div>
  )
}
