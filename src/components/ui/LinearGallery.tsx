import { useEffect, useRef } from 'react'
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
  className?: string
}

export function LinearGallery({
  items,
  activeIndex = 0,
  onActiveChange,
  onSelect,
  autoplay = 'off',
  className = ''
}: LinearGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<Map<number, HTMLElement>>(new Map())
  const rafIdRef = useRef<number | null>(null)
  const activeIndexRef = useRef(activeIndex)
  const isInteractingRef = useRef(false)
  const isVisibleRef = useRef(true)

  // Keep activeIndexRef in sync with prop
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  // Center initial activeIndex on mount
  useEffect(() => {
    if (items.length === 0) return
    const id = requestAnimationFrame(() => {
      const initialEl = itemElementsRef.current.get(activeIndex)
      if (initialEl) {
        initialEl.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest'
        })
      }
    })
    return () => cancelAnimationFrame(id)
  }, [])

  // Recenter on resize / orientation change with a ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isFirst = true
    const ro = new ResizeObserver(() => {
      if (isFirst) {
        isFirst = false
        return
      }
      const currentEl = itemElementsRef.current.get(activeIndexRef.current)
      if (currentEl) {
        currentEl.scrollIntoView({
          behavior: 'auto',
          inline: 'center',
          block: 'nearest'
        })
      }
    })

    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Prune deleted items from map if items list shrinks
  useEffect(() => {
    for (const key of itemElementsRef.current.keys()) {
      if (key >= items.length) {
        itemElementsRef.current.delete(key)
      }
    }
  }, [items.length])

  // Visibility tracking to pause autoplay when off-screen or tab hidden
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting
    })
    io.observe(container)

    const handleVis = () => {
      isVisibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVis)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', handleVis)
    }
  }, [])

  // Compute active index via getBoundingClientRect (closest card center to container center)
  useEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const computeActiveIndex = () => {
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2

      let closestIndex = -1
      let minDistance = Infinity

      itemElementsRef.current.forEach((el, index) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const distance = Math.abs(cardCenter - containerCenter)

        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== -1 && closestIndex !== activeIndexRef.current) {
        activeIndexRef.current = closestIndex
        onActiveChange?.(closestIndex)
      }
    }

    const handleScroll = () => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        computeActiveIndex()
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('scrollend', computeActiveIndex, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('scrollend', computeActiveIndex)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [items.length, onActiveChange])

  // Track touch/interaction to pause autoplay if enabled
  useEffect(() => {
    const container = containerRef.current
    if (!container || autoplay !== 'drift') return

    let touchTimeout: number

    const handleTouchStart = () => {
      isInteractingRef.current = true
      clearTimeout(touchTimeout)
    }

    const handleTouchEnd = () => {
      clearTimeout(touchTimeout)
      touchTimeout = window.setTimeout(() => {
        isInteractingRef.current = false
      }, 3500)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
      clearTimeout(touchTimeout)
    }
  }, [autoplay])

  // Autoplay auto-advance loop (discrete smooth scroll-snap steps without resting between cards)
  useEffect(() => {
    if (autoplay !== 'drift' || items.length <= 1) return

    const interval = setInterval(() => {
      if (isInteractingRef.current || !isVisibleRef.current) return
      const nextIndex = (activeIndexRef.current + 1) % items.length
      const el = itemElementsRef.current.get(nextIndex)
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        })
      }
    }, 4500)

    return () => clearInterval(interval)
  }, [autoplay, items.length])

  // Tapping any card scrolls it to center (smooth) and selects it
  const handleCardClick = (item: LinearGalleryItem, index: number) => {
    if (activeIndexRef.current !== index) {
      activeIndexRef.current = index
      onActiveChange?.(index)
    }
    onSelect?.(item, index)

    const el = itemElementsRef.current.get(index)
    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    })
  }

  return (
    <div className={`linear-gallery-wrapper ${className}`}>
      <div ref={containerRef} className="linear-gallery">
        {items.map((item, index) => {
          const title = item.text || item.title || ''
          const isActive = index === activeIndex

          return (
            <figure
              key={`${item.image}-${index}`}
              ref={(el) => {
                if (el) itemElementsRef.current.set(index, el)
                else itemElementsRef.current.delete(index)
              }}
              data-index={index}
              className={isActive ? 'is-active' : ''}
              onClick={() => handleCardClick(item, index)}
            >
              <img
                src={item.image}
                alt={title}
                loading={index < 4 ? 'eager' : 'lazy'}
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
