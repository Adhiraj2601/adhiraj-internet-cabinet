import { useEffect, useRef, useMemo } from 'react'
import './LinearGallery.css'

export interface LinearGalleryItem {
  image: string
  text?: string
  title?: string
  [key: string]: any
}

export interface LinearGalleryProps {
  items: LinearGalleryItem[]
  activeIndex?: number
  onActiveChange?: (index: number) => void
  onSelect?: (item: LinearGalleryItem, index: number) => void
  autoplay?: 'drift' | 'off'
  speed?: number // pixels per second
  pauseOnHover?: boolean
  className?: string
}

export function LinearGallery({
  items,
  activeIndex = 0,
  onActiveChange,
  onSelect,
  autoplay = 'drift',
  speed = 34,
  pauseOnHover = false,
  className = ''
}: LinearGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<Map<number, HTMLElement>>(new Map())
  const isDownRef = useRef(false)
  const isHoveredRef = useRef(false)
  const isVisibleRef = useRef(true)
  const holdUntilRef = useRef(0)
  const singleSetWidthRef = useRef(0)

  // Repeat items 3 times for seamless infinite drift wrapping
  const repeatedItems = useMemo(() => {
    if (items.length === 0) return []
    return [...items, ...items, ...items]
  }, [items])

  const originalLength = items.length

  // Measure single set width dynamically
  const measureSetWidth = () => {
    if (originalLength === 0) return
    const el0 = itemElementsRef.current.get(0)
    const elN = itemElementsRef.current.get(originalLength)
    if (el0 && elN) {
      singleSetWidthRef.current = elN.offsetLeft - el0.offsetLeft
    }
  }

  // Initial centering to set 1 on mount
  useEffect(() => {
    if (originalLength === 0) return
    measureSetWidth()

    const targetIndex = originalLength + (activeIndex % originalLength)
    const targetEl = itemElementsRef.current.get(targetIndex)
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'auto',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [originalLength])

  // Pause drift loop when offscreen or tab hidden to save mobile battery
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    })
    io.observe(container)

    const handleVisChange = () => {
      if (document.hidden) {
        isVisibleRef.current = false
      } else {
        isVisibleRef.current = true
        holdUntilRef.current = performance.now() + 500
      }
    }
    document.addEventListener('visibilitychange', handleVisChange)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', handleVisChange)
    }
  }, [])

  // Touch and interaction listeners to pause drift and toggle native scroll snap
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = () => {
      isDownRef.current = true
      holdUntilRef.current = performance.now() + 2000
      container.classList.add('is-snapping')
    }

    const handleTouchMove = () => {
      if (isDownRef.current) {
        holdUntilRef.current = performance.now() + 2000
      }
    }

    const handleTouchEnd = () => {
      isDownRef.current = false
      // Keep snapping enabled during momentum fling
      holdUntilRef.current = performance.now() + 1800
    }

    const handleMouseEnter = () => {
      if (pauseOnHover) isHoveredRef.current = true
    }

    const handleMouseLeave = () => {
      if (pauseOnHover) isHoveredRef.current = false
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    container.addEventListener('mousedown', handleTouchStart)
    container.addEventListener('mousemove', handleTouchMove)
    container.addEventListener('mouseup', handleTouchEnd)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
      container.removeEventListener('mousedown', handleTouchStart)
      container.removeEventListener('mousemove', handleTouchMove)
      container.removeEventListener('mouseup', handleTouchEnd)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [pauseOnHover])

  // Continuous Autoplay Drift Loop with seamless wrapping
  useEffect(() => {
    if (autoplay !== 'drift') return

    let rafId: number
    let lastTime = performance.now()

    const step = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const isInteracting =
        isDownRef.current ||
        (pauseOnHover && isHoveredRef.current) ||
        time < holdUntilRef.current

      const container = containerRef.current

      if (container) {
        if (!isInteracting && isVisibleRef.current) {
          // Disable CSS scroll-snap during drift for buttery smooth subpixel scrolling
          if (container.classList.contains('is-snapping')) {
            container.classList.remove('is-snapping')
          }

          if (singleSetWidthRef.current <= 0) {
            measureSetWidth()
          }

          container.scrollLeft += speed * dt

          const setWidth = singleSetWidthRef.current
          if (setWidth > 0) {
            if (container.scrollLeft >= setWidth * 2) {
              container.scrollLeft -= setWidth
            } else if (container.scrollLeft < setWidth * 0.5) {
              container.scrollLeft += setWidth
            }
          }
        }
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [autoplay, speed, pauseOnHover])

  // Active book syncing with IntersectionObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container || repeatedItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          let best = visibleEntries[0]
          for (let i = 1; i < visibleEntries.length; i++) {
            if (visibleEntries[i].intersectionRatio > best.intersectionRatio) {
              best = visibleEntries[i]
            }
          }
          const origIdxStr = best.target.getAttribute('data-original-index')
          if (origIdxStr !== null) {
            const origIdx = parseInt(origIdxStr, 10)
            if (!isNaN(origIdx)) {
              onActiveChange?.(origIdx)
            }
          }
        }
      },
      {
        root: container,
        threshold: [0.5, 0.65, 0.8]
      }
    )

    itemElementsRef.current.forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [repeatedItems, onActiveChange])

  const handleCardClick = (item: LinearGalleryItem, globalIndex: number) => {
    const origIndex = globalIndex % originalLength
    onActiveChange?.(origIndex)
    onSelect?.(item, origIndex)

    const container = containerRef.current
    if (container) {
      container.classList.add('is-snapping')
    }
    holdUntilRef.current = performance.now() + 2200

    const el = itemElementsRef.current.get(globalIndex)
    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    })
  }

  return (
    <div className={`linear-gallery-wrapper ${className}`}>
      <div ref={containerRef} className="linear-gallery">
        {repeatedItems.map((item, globalIndex) => {
          const originalIndex = globalIndex % originalLength
          const title = item.text || item.title || ''
          const isActive = originalIndex === (activeIndex % originalLength)

          return (
            <figure
              key={`${item.image}-${globalIndex}`}
              ref={(el) => {
                if (el) itemElementsRef.current.set(globalIndex, el)
                else itemElementsRef.current.delete(globalIndex)
              }}
              data-index={globalIndex}
              data-original-index={originalIndex}
              className={isActive ? 'is-active' : ''}
              onClick={() => handleCardClick(item, globalIndex)}
            >
              <img
                src={item.image}
                alt={title}
                loading={globalIndex < 10 ? 'eager' : 'lazy'}
                draggable={false}
              />
              <figcaption>{title}</figcaption>
            </figure>
          )
        })}
      </div>
    </div>
  )
}

export default LinearGallery
