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
  className?: string
}

export function LinearGallery({
  items,
  activeIndex = 0,
  onActiveChange,
  onSelect,
  className = ''
}: LinearGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemElementsRef = useRef<Map<number, HTMLElement>>(new Map())

  // Use IntersectionObserver on each card to set the active centered book
  useEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          // Select entry closest to center (highest intersection ratio)
          let best = visibleEntries[0]
          for (let i = 1; i < visibleEntries.length; i++) {
            if (visibleEntries[i].intersectionRatio > best.intersectionRatio) {
              best = visibleEntries[i]
            }
          }
          const idxStr = best.target.getAttribute('data-index')
          if (idxStr !== null) {
            const idx = parseInt(idxStr, 10)
            if (!isNaN(idx)) {
              onActiveChange?.(idx)
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
  }, [items, onActiveChange])

  // Center initial active index if specified
  useEffect(() => {
    if (activeIndex > 0) {
      const el = itemElementsRef.current.get(activeIndex)
      el?.scrollIntoView({
        behavior: 'auto',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [activeIndex])

  const handleCardClick = (item: LinearGalleryItem, index: number) => {
    onActiveChange?.(index)
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
                loading={index < 5 ? 'eager' : 'lazy'}
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
