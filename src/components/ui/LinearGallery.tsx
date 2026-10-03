import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import './LinearGallery.css'

export interface LinearGalleryItem {
  image: string
  text?: string
  title?: string
  [key: string]: any
}

export interface LinearGalleryProps {
  items: LinearGalleryItem[]
  autoplay?: boolean // default: true
  speed?: number // px per second, default: 28
  direction?: 'forward' | 'reverse' // default: 'forward'
  resumeDelay?: number // ms, default: 2500
  initialIndex?: number // default: 0
  activeIndex?: number
  onActiveChange?: (index: number) => void
  onSelect?: (item: LinearGalleryItem, index: number) => void
  className?: string
}

export function LinearGallery({
  items,
  autoplay = true,
  speed = 28,
  direction = 'forward',
  resumeDelay = 2500,
  initialIndex = 0,
  activeIndex,
  onActiveChange,
  onSelect,
  className = ''
}: LinearGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<Map<number, HTMLElement>>(new Map())

  // ==========================================
  // AUTOPLAY DRIFT & POSITION STATE REFS
  // ==========================================
  // Float position ref: written directly to container.scrollLeft each frame
  // to avoid Android integer rounding truncation that causes drift to stall.
  const posRef = useRef(0)
  const isDriftingRef = useRef(false)
  const isManualPausedRef = useRef(false)
  const lastTimeRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const activeRafIdRef = useRef<number | null>(null)
  const resumeTimerRef = useRef<number | null>(null)
  const visResumeTimerRef = useRef<number | null>(null)

  // Tracking refs to ensure fresh values inside RAF loops and event callbacks
  const speedRef = useRef(speed)
  const directionRef = useRef(direction)
  const resumeDelayRef = useRef(resumeDelay)
  const activeIndexRef = useRef(activeIndex ?? initialIndex)
  const singleSetWidthRef = useRef(0)
  const isIntersectingRef = useRef(true)

  speedRef.current = speed
  directionRef.current = direction
  resumeDelayRef.current = resumeDelay

  // Keep activeIndexRef in sync with prop
  useEffect(() => {
    if (activeIndex !== undefined) {
      activeIndexRef.current = activeIndex
    }
  }, [activeIndex])

  // Reduced motion support: disable autoplay entirely if user prefers reduced motion
  const prefersReducedMotion = usePrefersReducedMotion()
  const isAutoplayConfigured = autoplay && !prefersReducedMotion

  // Accessibility toggle state for Play / Pause
  const [isPlaying, setIsPlaying] = useState(isAutoplayConfigured)

  // ==========================================
  // 3X ITEM LIST REPEAT FOR INFINITE WRAPPING
  // ==========================================
  // Render item list three times: Set 0 (left), Set 1 (middle), Set 2 (right).
  // Silent resets fold scroll position across sets without any visual jump.
  const repeatedItems = useMemo(() => {
    if (items.length === 0) return []
    return [...items, ...items, ...items]
  }, [items])

  const originalLength = items.length

  // Measure the width of one complete set of items (including gap)
  const measureSetWidth = useCallback(() => {
    if (originalLength === 0) return 0
    const el0 = itemElementsRef.current.get(0)
    const elN = itemElementsRef.current.get(originalLength)
    if (el0 && elN) {
      const width = elN.offsetLeft - el0.offsetLeft
      if (width > 0) {
        singleSetWidthRef.current = width
        return width
      }
    }
    return singleSetWidthRef.current
  }, [originalLength])

  // Clean up stale element refs if items length changes
  useEffect(() => {
    const total = originalLength * 3
    for (const key of itemElementsRef.current.keys()) {
      if (key >= total) {
        itemElementsRef.current.delete(key)
      }
    }
  }, [originalLength])

  // ==========================================
  // AUTOPLAY LOGIC: START & STOP DRIFT
  // ==========================================
  const startDrift = useCallback(() => {
    if (!isAutoplayConfigured || isManualPausedRef.current) return
    if (isDriftingRef.current) return

    const container = containerRef.current
    if (!container || !isIntersectingRef.current || document.hidden) return

    // Ensure scroll position is folded into Set 1 range [setWidth, 2 * setWidth)
    const setWidth = singleSetWidthRef.current || measureSetWidth()
    if (setWidth > 0) {
      let cur = container.scrollLeft
      while (cur >= setWidth * 2) cur -= setWidth
      while (cur < setWidth) cur += setWidth
      posRef.current = cur
      container.scrollLeft = cur
    } else {
      posRef.current = container.scrollLeft
    }

    // Disable CSS scroll-snap during drift to avoid snapping resistance
    container.classList.add('is-drifting')
    isDriftingRef.current = true
    lastTimeRef.current = performance.now()

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
    }

    // Main RAF Drift Loop
    const driftLoop = (time: number) => {
      if (!isDriftingRef.current) return

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      const c = containerRef.current
      if (c) {
        const dirSign = directionRef.current === 'reverse' ? -1 : 1
        posRef.current += dirSign * speedRef.current * dt

        // Silent wrap: when crossing into Set 2 or Set 0, reset by one list-width
        const sw = singleSetWidthRef.current || measureSetWidth()
        if (sw > 0) {
          if (posRef.current >= sw * 2) {
            posRef.current -= sw
          } else if (posRef.current < sw) {
            posRef.current += sw
          }
        }

        // Write directly to container.scrollLeft; DO NOT read scrollLeft back each frame
        // because Android rounds it and stalls the drift.
        c.scrollLeft = posRef.current
      }

      rafIdRef.current = requestAnimationFrame(driftLoop)
    }

    rafIdRef.current = requestAnimationFrame(driftLoop)
  }, [isAutoplayConfigured, measureSetWidth])

  const stopDrift = useCallback(
    (allowResume = true) => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

      const container = containerRef.current
      if (container) {
        // Re-enable CSS scroll-snap so carousel settles one card at center
        container.classList.remove('is-drifting')
        posRef.current = container.scrollLeft
      }

      isDriftingRef.current = false

      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }

      // Schedule auto-resume after resumeDelay if allowed and not manually paused
      if (allowResume && isAutoplayConfigured && !isManualPausedRef.current) {
        resumeTimerRef.current = window.setTimeout(() => {
          startDrift()
        }, resumeDelayRef.current)
      }
    },
    [isAutoplayConfigured, startDrift]
  )

  // ==========================================
  // INITIAL CENTERING ON MOUNT
  // ==========================================
  useEffect(() => {
    if (originalLength === 0) return

    const targetIdx = originalLength + (initialIndex % originalLength)
    const id = requestAnimationFrame(() => {
      measureSetWidth()
      const targetEl = itemElementsRef.current.get(targetIdx)
      if (targetEl && containerRef.current) {
        targetEl.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest'
        })
        posRef.current = containerRef.current.scrollLeft
      }

      // Kick off autoplay drift after initial centering
      if (isAutoplayConfigured && !isManualPausedRef.current) {
        resumeTimerRef.current = window.setTimeout(() => {
          startDrift()
        }, 800)
      }
    })

    return () => cancelAnimationFrame(id)
  }, [originalLength, initialIndex, measureSetWidth, isAutoplayConfigured, startDrift])

  // ==========================================
  // RESIZE OBSERVER (ORIENTATION / RESIZE)
  // ==========================================
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isFirst = true
    const ro = new ResizeObserver(() => {
      measureSetWidth()
      if (isFirst) {
        isFirst = false
        return
      }
      // Do not recenter on ResizeObserver while drifting
      if (isDriftingRef.current) return

      const currentEl = itemElementsRef.current.get(
        originalLength + (activeIndexRef.current % originalLength)
      )
      if (currentEl) {
        currentEl.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest'
        })
        posRef.current = container.scrollLeft
      }
    })

    ro.observe(container)
    return () => ro.disconnect()
  }, [originalLength, measureSetWidth])

  // ==========================================
  // USER INTERACTION DETECTION
  // ==========================================
  // pointerdown, touchstart, wheel, keydown immediately stop drift
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleInteraction = () => {
      stopDrift(true)
    }

    container.addEventListener('pointerdown', handleInteraction, { passive: true })
    container.addEventListener('touchstart', handleInteraction, { passive: true })
    container.addEventListener('wheel', handleInteraction, { passive: true })
    container.addEventListener('keydown', handleInteraction, { passive: true })

    return () => {
      container.removeEventListener('pointerdown', handleInteraction)
      container.removeEventListener('touchstart', handleInteraction)
      container.removeEventListener('wheel', handleInteraction)
      container.removeEventListener('keydown', handleInteraction)
    }
  }, [stopDrift])

  // ==========================================
  // ACTIVE INDEX & SCROLL RESUME MANAGEMENT
  // ==========================================
  // Compute active index via getBoundingClientRect (card center closest to container center)
  // and reschedule resume timer on every scroll event while not drifting.
  useEffect(() => {
    const container = containerRef.current
    if (!container || originalLength === 0) return

    const computeActiveIndex = () => {
      const c = containerRef.current
      if (!c) return

      const containerRect = c.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      let closestOrigIndex = -1
      let minDistance = Infinity

      // Check on-screen items first for fast calculation
      itemElementsRef.current.forEach((el, globalIndex) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.right < containerRect.left || rect.left > containerRect.right) return

        const cardCenter = rect.left + rect.width / 2
        const distance = Math.abs(cardCenter - containerCenter)

        if (distance < minDistance) {
          minDistance = distance
          closestOrigIndex = globalIndex % originalLength
        }
      })

      // Fallback check across all items if none found
      if (closestOrigIndex === -1) {
        itemElementsRef.current.forEach((el, globalIndex) => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          const cardCenter = rect.left + rect.width / 2
          const distance = Math.abs(cardCenter - containerCenter)

          if (distance < minDistance) {
            minDistance = distance
            closestOrigIndex = globalIndex % originalLength
          }
        })
      }

      if (closestOrigIndex !== -1 && closestOrigIndex !== activeIndexRef.current) {
        activeIndexRef.current = closestOrigIndex
        onActiveChange?.(closestOrigIndex)
      }
    }

    const handleScroll = () => {
      // While not drifting, reschedule resume timer on every scroll event (drag, momentum, snap settle)
      if (!isDriftingRef.current) {
        posRef.current = container.scrollLeft
        if (resumeTimerRef.current !== null) {
          clearTimeout(resumeTimerRef.current)
          resumeTimerRef.current = null
        }
        if (isAutoplayConfigured && !isManualPausedRef.current) {
          resumeTimerRef.current = window.setTimeout(() => {
            startDrift()
          }, resumeDelayRef.current)
        }
      }

      // RAF-throttled center distance computation
      if (activeRafIdRef.current !== null) return
      activeRafIdRef.current = requestAnimationFrame(() => {
        activeRafIdRef.current = null
        computeActiveIndex()
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('scrollend', computeActiveIndex, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('scrollend', computeActiveIndex)
      if (activeRafIdRef.current !== null) {
        cancelAnimationFrame(activeRafIdRef.current)
        activeRafIdRef.current = null
      }
    }
  }, [originalLength, onActiveChange, isAutoplayConfigured, startDrift])

  // ==========================================
  // PAUSE CONDITIONS: VISIBILITY & INTERSECTION
  // ==========================================
  // Pause when off-screen (threshold 0.3) or tab is hidden, resume 500ms after visible
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const io = new IntersectionObserver(
      ([entry]) => {
        const isNowVisible = entry.isIntersecting && entry.intersectionRatio >= 0.3
        isIntersectingRef.current = isNowVisible

        if (!isNowVisible) {
          if (visResumeTimerRef.current !== null) {
            clearTimeout(visResumeTimerRef.current)
            visResumeTimerRef.current = null
          }
          stopDrift(false)
        } else {
          if (isAutoplayConfigured && !isManualPausedRef.current) {
            if (visResumeTimerRef.current !== null) {
              clearTimeout(visResumeTimerRef.current)
            }
            visResumeTimerRef.current = window.setTimeout(() => {
              if (isIntersectingRef.current && !document.hidden && !isManualPausedRef.current) {
                startDrift()
              }
            }, 500)
          }
        }
      },
      { threshold: 0.3 }
    )
    io.observe(container)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (visResumeTimerRef.current !== null) {
          clearTimeout(visResumeTimerRef.current)
          visResumeTimerRef.current = null
        }
        stopDrift(false)
      } else {
        if (isAutoplayConfigured && !isManualPausedRef.current) {
          if (visResumeTimerRef.current !== null) {
            clearTimeout(visResumeTimerRef.current)
          }
          visResumeTimerRef.current = window.setTimeout(() => {
            if (isIntersectingRef.current && !document.hidden && !isManualPausedRef.current) {
              startDrift()
            }
          }, 500)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (visResumeTimerRef.current !== null) {
        clearTimeout(visResumeTimerRef.current)
        visResumeTimerRef.current = null
      }
    }
  }, [isAutoplayConfigured, startDrift, stopDrift])

  // ==========================================
  // UNMOUNT CLEANUP
  // ==========================================
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      if (activeRafIdRef.current !== null) cancelAnimationFrame(activeRafIdRef.current)
      if (resumeTimerRef.current !== null) clearTimeout(resumeTimerRef.current)
      if (visResumeTimerRef.current !== null) clearTimeout(visResumeTimerRef.current)
    }
  }, [])

  // ==========================================
  // ACCESSIBILITY: PLAY / PAUSE BUTTON
  // ==========================================
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) {
      isManualPausedRef.current = true
      setIsPlaying(false)
      stopDrift(false)
    } else {
      isManualPausedRef.current = false
      setIsPlaying(true)
      startDrift()
    }
  }

  // ==========================================
  // CARD TAP / CLICK HANDLER
  // ==========================================
  const handleCardClick = (item: LinearGalleryItem, globalIndex: number) => {
    stopDrift(true)

    const origIndex = globalIndex % originalLength
    if (activeIndexRef.current !== origIndex) {
      activeIndexRef.current = origIndex
      onActiveChange?.(origIndex)
    }
    onSelect?.(item, origIndex)

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
          const origIndex = globalIndex % originalLength
          const title = item.text || item.title || ''
          const currentHighlight = activeIndex !== undefined ? activeIndex : activeIndexRef.current
          const isActive = origIndex === (currentHighlight % originalLength)

          return (
            <figure
              key={`${item.image}-${globalIndex}`}
              ref={(el) => {
                if (el) itemElementsRef.current.set(globalIndex, el)
                else itemElementsRef.current.delete(globalIndex)
              }}
              data-global-index={globalIndex}
              data-original-index={origIndex}
              className={isActive ? 'is-active' : ''}
              onClick={() => handleCardClick(item, globalIndex)}
            >
              <img
                src={item.image}
                alt={title}
                loading={globalIndex < originalLength + 4 ? 'eager' : 'lazy'}
                draggable={false}
              />
              <figcaption>{title}</figcaption>
            </figure>
          )
        })}
      </div>

      {/* Accessibility Play/Pause Button */}
      {autoplay && !prefersReducedMotion && (
        <button
          type="button"
          className="linear-gallery-toggle"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause gallery autoplay' : 'Play gallery autoplay'}
          title={isPlaying ? 'Pause gallery autoplay' : 'Play gallery autoplay'}
        >
          {isPlaying ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="5" y="4" width="4" height="16" rx="1" />
              <rect x="15" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}

export default LinearGallery
