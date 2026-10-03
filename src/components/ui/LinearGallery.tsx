import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { GALLERY_ENTRANCE, preloadGalleryImages } from '../../lib/galleryEntrance'
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
  onDetailsReady?: () => void
  onIntroComplete?: () => void
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
  onDetailsReady,
  onIntroComplete,
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
  const isTouchingRef = useRef(false)
  const lastTimeRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)
  const activeRafIdRef = useRef<number | null>(null)
  const resumeTimerRef = useRef<number | null>(null)
  const visResumeTimerRef = useRef<number | null>(null)

  // ==========================================
  // ENTRANCE ANIMATION STATE & REFS
  // ==========================================
  const [introPhase, setIntroPhase] = useState<'initial' | 'animating' | 'done'>('initial')
  const introPhaseRef = useRef<'initial' | 'animating' | 'done'>('initial')
  introPhaseRef.current = introPhase
  const onDetailsReadyRef = useRef(onDetailsReady)
  const onIntroCompleteRef = useRef(onIntroComplete)
  onDetailsReadyRef.current = onDetailsReady
  onIntroCompleteRef.current = onIntroComplete
  const detailsTimerRef = useRef<number | null>(null)
  const introTimerRef = useRef<number | null>(null)

  // Drag vs Tap detection refs (ignore clicks if finger moved > 8px)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const isDragRef = useRef(false)

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
    if (introPhaseRef.current !== 'done') return
    if (!isAutoplayConfigured || isTouchingRef.current) return
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
      // Guard: never write scrollLeft when drift stopped or finger is active on track
      if (!isDriftingRef.current || isTouchingRef.current) return

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
        // Re-enable CSS scroll-snap immediately so user touch or momentum settles properly
        container.classList.remove('is-drifting')
        posRef.current = container.scrollLeft
      }

      isDriftingRef.current = false

      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }

      // Schedule auto-resume after resumeDelay if allowed and finger is not down
      if (allowResume && isAutoplayConfigured && !isTouchingRef.current) {
        resumeTimerRef.current = window.setTimeout(() => {
          startDrift()
        }, resumeDelayRef.current)
      }
    },
    [isAutoplayConfigured, startDrift]
  )

  // ==========================================
  // IMAGE PRELOAD & ENTRANCE ANIMATION LIFECYCLE
  // ==========================================
  useEffect(() => {
    if (originalLength === 0) return
    let isMounted = true

    // Center the track silently while cards are still at opacity 0
    const targetIdx = originalLength + (initialIndex % originalLength)
    requestAnimationFrame(() => {
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
    })

    // Preload all cover images before starting entrance
    setIntroPhase('initial')
    const imageUrls = items.map(item => item.image)

    preloadGalleryImages(imageUrls).then(() => {
      if (!isMounted) return

      // Preload complete: trigger staggered entrance on next frame
      requestAnimationFrame(() => {
        if (!isMounted) return
        setIntroPhase('animating')

        const isReduced = prefersReducedMotion
        const animDuration = isReduced ? GALLERY_ENTRANCE.reducedMotionDuration : 950
        const maxStagger = isReduced ? 0 : 4 * GALLERY_ENTRANCE.staggerMs // up to 300ms
        const totalDuration = animDuration + maxStagger
        const detailsDelay = Math.round(totalDuration * GALLERY_ENTRANCE.detailsThreshold)

        // Fade in details block once cards are 60% into travel
        detailsTimerRef.current = window.setTimeout(() => {
          if (!isMounted) return
          onDetailsReadyRef.current?.()
        }, detailsDelay)

        // Complete entrance intro and enable full interactions + autoplay drift
        introTimerRef.current = window.setTimeout(() => {
          if (!isMounted) return
          setIntroPhase('done')
          onIntroCompleteRef.current?.()
          if (isAutoplayConfigured) {
            resumeTimerRef.current = window.setTimeout(() => {
              if (isMounted) startDrift()
            }, resumeDelayRef.current)
          }
        }, totalDuration)
      })
    })

    return () => {
      isMounted = false
      if (detailsTimerRef.current !== null) clearTimeout(detailsTimerRef.current)
      if (introTimerRef.current !== null) clearTimeout(introTimerRef.current)
    }
  }, [items, originalLength, initialIndex, measureSetWidth, prefersReducedMotion, isAutoplayConfigured, startDrift, resumeDelay])

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
  // USER TOUCH & DRAG INTERACTION HANDLERS
  // ==========================================
  // 1:1 native scroll drag: On touchstart / pointerdown, immediately stop drift
  // and re-enable scroll-snap (remove is-drifting) so the drift loop never writes
  // scrollLeft while the finger is down.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handlePointerDown = (e: PointerEvent) => {
      if (introPhaseRef.current !== 'done') return
      isTouchingRef.current = true
      pointerStartRef.current = { x: e.clientX, y: e.clientY }
      isDragRef.current = false
      stopDrift(false) // Stop drift, remove is-drifting, don't resume while finger is down
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (introPhaseRef.current !== 'done') return
      if (pointerStartRef.current) {
        const dx = e.clientX - pointerStartRef.current.x
        const dy = e.clientY - pointerStartRef.current.y
        if (Math.hypot(dx, dy) > 8) {
          isDragRef.current = true
        }
      }
    }

    const handlePointerUp = () => {
      if (introPhaseRef.current !== 'done') return
      isTouchingRef.current = false
      // Schedule resume only after finger release
      if (isAutoplayConfigured) {
        if (resumeTimerRef.current !== null) {
          clearTimeout(resumeTimerRef.current)
        }
        resumeTimerRef.current = window.setTimeout(() => {
          startDrift()
        }, resumeDelayRef.current)
      }
      setTimeout(() => {
        pointerStartRef.current = null
        isDragRef.current = false
      }, 50)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (introPhaseRef.current !== 'done') return
      isTouchingRef.current = true
      if (e.touches[0]) {
        pointerStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      isDragRef.current = false
      stopDrift(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (pointerStartRef.current && e.touches[0]) {
        const dx = e.touches[0].clientX - pointerStartRef.current.x
        const dy = e.touches[0].clientY - pointerStartRef.current.y
        if (Math.hypot(dx, dy) > 8) {
          isDragRef.current = true
        }
      }
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      if (isAutoplayConfigured) {
        if (resumeTimerRef.current !== null) {
          clearTimeout(resumeTimerRef.current)
        }
        resumeTimerRef.current = window.setTimeout(() => {
          startDrift()
        }, resumeDelayRef.current)
      }
      setTimeout(() => {
        pointerStartRef.current = null
        isDragRef.current = false
      }, 50)
    }

    const handleWheel = () => {
      stopDrift(true)
    }

    const handleKeyDown = () => {
      stopDrift(true)
    }

    container.addEventListener('pointerdown', handlePointerDown, { passive: true })
    container.addEventListener('pointermove', handlePointerMove, { passive: true })
    container.addEventListener('pointerup', handlePointerUp, { passive: true })
    container.addEventListener('pointercancel', handlePointerUp, { passive: true })

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('keydown', handleKeyDown, { passive: true })

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
      container.removeEventListener('pointercancel', handlePointerUp)

      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)

      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [stopDrift, isAutoplayConfigured, startDrift])

  // ==========================================
  // ACTIVE INDEX & SCROLL RESUME MANAGEMENT
  // ==========================================
  // Compute active index via getBoundingClientRect (card center closest to container center)
  // and reschedule resume timer on every scroll event while not drifting.
  useEffect(() => {
    const container = containerRef.current
    if (!container || originalLength === 0) return

    const computeActiveIndex = () => {
      if (introPhaseRef.current !== 'done') return
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
      if (introPhaseRef.current !== 'done') return
      // While not drifting, reschedule resume timer on every scroll event
      // (drag, momentum fling, snap settle). Wait until all scroll events stop for resumeDelay.
      if (!isDriftingRef.current) {
        posRef.current = container.scrollLeft
        if (resumeTimerRef.current !== null) {
          clearTimeout(resumeTimerRef.current)
          resumeTimerRef.current = null
        }
        if (isAutoplayConfigured && !isTouchingRef.current) {
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
          if (isAutoplayConfigured) {
            if (visResumeTimerRef.current !== null) {
              clearTimeout(visResumeTimerRef.current)
            }
            visResumeTimerRef.current = window.setTimeout(() => {
              if (isIntersectingRef.current && !document.hidden && !isTouchingRef.current) {
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
        if (isAutoplayConfigured) {
          if (visResumeTimerRef.current !== null) {
            clearTimeout(visResumeTimerRef.current)
          }
          visResumeTimerRef.current = window.setTimeout(() => {
            if (isIntersectingRef.current && !document.hidden && !isTouchingRef.current) {
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
      if (detailsTimerRef.current !== null) clearTimeout(detailsTimerRef.current)
      if (introTimerRef.current !== null) clearTimeout(introTimerRef.current)
    }
  }, [])

  // ==========================================
  // CARD TAP / CLICK HANDLER (DRAG-SAFE)
  // ==========================================
  const handleCardClick = (item: LinearGalleryItem, globalIndex: number) => {
    if (introPhaseRef.current !== 'done') {
      return
    }
    // If the pointer moved more than 8px, it was a drag gesture — do not count as a tap!
    if (isDragRef.current) {
      return
    }

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
      <div
        ref={containerRef}
        className={`linear-gallery ${
          introPhase === 'initial'
            ? 'intro-initial'
            : introPhase === 'animating'
            ? 'intro-animating'
            : 'intro-done'
        }`}
      >
        {repeatedItems.map((item, globalIndex) => {
          const origIndex = globalIndex % originalLength
          const title = item.text || item.title || ''
          const currentHighlight = activeIndex !== undefined ? activeIndex : activeIndexRef.current
          const isActive = origIndex === (currentHighlight % originalLength)

          // Stagger calculation: center card (slot in middle repeated set) has 0ms delay,
          // adjacent cards outward get 75ms delay per step.
          const centerGlobal = originalLength + (initialIndex % originalLength)
          const diffFromCenter = Math.abs(globalIndex - centerGlobal)
          const staggerStep = Math.min(diffFromCenter, 4)
          const staggerDelay =
            introPhase === 'animating' && !prefersReducedMotion
              ? staggerStep * GALLERY_ENTRANCE.staggerMs
              : 0

          return (
            <figure
              key={`${item.image}-${globalIndex}`}
              ref={(el) => {
                if (el) itemElementsRef.current.set(globalIndex, el)
                else itemElementsRef.current.delete(globalIndex)
              }}
              data-global-index={globalIndex}
              data-original-index={origIndex}
              className={`${isActive ? 'is-active' : ''} ${
                introPhase === 'initial'
                  ? 'card-intro-hidden'
                  : introPhase === 'animating'
                  ? 'card-intro-animating'
                  : 'card-intro-settled'
              }`}
              style={
                introPhase === 'animating' && staggerDelay > 0
                  ? { transitionDelay: `${staggerDelay}ms` }
                  : undefined
              }
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
    </div>
  )
}

export default LinearGallery
