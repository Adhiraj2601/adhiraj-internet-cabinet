import { useEffect, useState, useRef } from 'react'

interface Burst {
  id: number
  x: number
  y: number
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const [bursts, setBursts] = useState<Burst[]>([])
  const [isFinePointer, setIsFinePointer] = useState(false)

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse / trackpad)
    const mediaQuery = window.matchMedia('(pointer: fine)')
    setIsFinePointer(mediaQuery.matches)

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches)
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    if (!mediaQuery.matches) {
      return () => mediaQuery.removeEventListener('change', handleMediaChange)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      if (!isVisible) setIsVisible(true)

      // Detect interactive elements for hover scale
      const target = e.target as HTMLElement | null
      if (target) {
        const interactive = target.closest('a, button, input, textarea, select, [role="button"], .cursor-pointer')
        setIsPointer(!!interactive)
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      setIsClicking(true)
      const id = Date.now() + Math.random()
      const newBurst: Burst = {
        id,
        x: e.clientX,
        y: e.clientY,
      }
      setBursts((prev) => [...prev.slice(-6), newBurst])

      // Fallback cleanup in case onAnimationEnd is missed
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id))
      }, 420)
    }

    const onMouseUp = () => {
      setIsClicking(false)
    }

    const onMouseLeave = () => {
      setIsVisible(false)
    }

    const onMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [isVisible])

  const removeBurst = (id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id))
  }

  if (!isFinePointer) return null

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }

        @keyframes clickRayBurst {
          0% {
            opacity: 0;
            transform: scale(0.25);
          }
          15% {
            opacity: 1;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1.4) translate(-3px, -5px);
          }
        }

        .custom-click-burst {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 999999;
          transform-origin: 0 0;
          animation: clickRayBurst 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Render 3-ray burst effect at click coordinates */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="custom-click-burst"
          style={{
            transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
          }}
          onAnimationEnd={() => removeBurst(b.id)}
        >
          <svg
            style={{ overflow: 'visible' }}
            width="1"
            height="1"
            viewBox="0 0 1 1"
          >
            <g style={{ transformOrigin: '0px 0px' }}>
              {/* Ray 1: Left ray */}
              <line
                x1="-6"
                y1="-3"
                x2="-28"
                y2="-14"
                stroke="#da6443"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Ray 2: Center ray */}
              <line
                x1="-2"
                y1="-6"
                x2="-13"
                y2="-30"
                stroke="#da6443"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {/* Ray 3: Right ray */}
              <line
                x1="4"
                y1="-6"
                x2="13"
                y2="-30"
                stroke="#da6443"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      ))}

      {/* Custom Pointer Arrow */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999998,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.15s ease-out',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            transformOrigin: '0 0',
            transform: isClicking
              ? 'scale(0.88)'
              : isPointer
              ? 'scale(1.08)'
              : 'scale(1)',
            transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg
            style={{ overflow: 'visible', display: 'block' }}
            width="26"
            height="32"
            viewBox="0 0 26 32"
          >
            <polygon
              points="0,0 22,20 9,19 0,27"
              fill="#ffffff"
              stroke="#da6443"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </>
  )
}
