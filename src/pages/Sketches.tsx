import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { scrapItems } from '../content/scraps'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Arrow } from '../components/ui/Arrow'
import { fadeUp } from '../lib/animations'
import { useIsMobile } from '../hooks/useMediaQuery'
import CircularCarousel from '../components/ui/CircularCarousel'

const aspectRatios: Record<string, string> = {
  tall: '2/3',
  wide: '3/2',
  square: '1/1',
}

type SizeFilter = 'all' | 'tall' | 'wide' | 'square'
type ViewMode = 'grid' | 'carousel'

/** Minimum items required for the carousel ring to look sensible */
const MIN_CAROUSEL_ITEMS = 5

/** Cream background colour (matches --background CSS var) */
const CREAM = '#F4F1EA'

export function SketchesPage() {
  const [filter, setFilter] = useState<SizeFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const isMobile = useIsMobile()

  // Filtered sketches — single source of truth for both views
  const filteredSketches = useMemo(() => {
    let result = [...scrapItems]

    if (filter !== 'all') {
      result = result.filter((item) => item.size === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.note.toLowerCase().includes(q) ||
          item.alt.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.date && item.date.toLowerCase().includes(q))
      )
    }

    return result
  }, [filter, search])

  // Map sketch data to the shape CircularCarousel expects
  const carouselItems = useMemo(
    () =>
      filteredSketches.map((item) => ({
        src: item.src,
        alt: item.alt,
        title: item.note || item.alt,
        subtitle: `#${item.id}${item.date ? ' · ' + item.date : ''}`,
      })),
    [filteredSketches]
  )

  // If a filter narrows below MIN_CAROUSEL_ITEMS, fall back to grid automatically
  const effectiveView: ViewMode =
    viewMode === 'carousel' && filteredSketches.length < MIN_CAROUSEL_ITEMS ? 'grid' : viewMode

  const selectedSketch = selectedIndex !== null ? filteredSketches[selectedIndex] : null

  // Lightbox keyboard navigation (Esc, ArrowLeft, ArrowRight)
  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredSketches.length - 1))
  }, [selectedIndex, filteredSketches.length])

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev !== null && prev < filteredSketches.length - 1 ? prev + 1 : 0))
  }, [selectedIndex, filteredSketches.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, handlePrev, handleNext])

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedIndex])

  return (
    <main id="main-content" className="pt-28 md:pt-36 pb-24 min-h-screen">
      <div className="container-main">
        {/* Navigation Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors group"
          >
            <span className="transform transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>Back to Archive</span>
          </Link>
        </motion.div>

        {/* Masthead Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border-b border-token pb-10 md:pb-14 mb-10 md:mb-12"
        >
          <SectionLabel>05 / Visual Scraps Archive</SectionLabel>
          <div className="mt-3 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1
                className="font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
              >
                The Sketchbook
              </h1>
              <p className="mt-4 text-[0.95rem] text-muted max-w-xl leading-relaxed">
                An ongoing archive of drawings, digital sketches, photographs, and visual fragments.
                Raw ideas, late night scribbles, and things I wanted to hold onto.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted shrink-0">
              <span>{scrapItems.length} visual scraps</span>
              <span>•</span>
              <span>Click any piece to inspect</span>
            </div>
          </div>
        </motion.div>

        {/* Controls Bar: Filters + Search + View Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-token/60"
        >
          {/* Format / Aspect Ratio Filters */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'all'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              All Formats ({scrapItems.length})
            </button>
            <button
              onClick={() => setFilter('tall')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'tall'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Tall (2:3)
            </button>
            <button
              onClick={() => setFilter('wide')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'wide'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Wide (3:2)
            </button>
            <button
              onClick={() => setFilter('square')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'square'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Square (1:1)
            </button>
          </div>

          {/* Right side: Search + View toggle */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes or sketches..."
                className="w-full text-xs px-3 py-1.5 bg-transparent border border-token rounded-xs focus:outline-none focus:border-foreground placeholder:text-muted/60"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div
              className="flex items-center border border-token rounded-xs overflow-hidden shrink-0"
              role="group"
              aria-label="View mode"
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                  viewMode === 'grid'
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
                }`}
                aria-pressed={viewMode === 'grid'}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all border-l border-token ${
                  viewMode === 'carousel'
                    ? 'bg-foreground text-background'
                    : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
                }`}
                aria-pressed={viewMode === 'carousel'}
              >
                Carousel
              </button>
            </div>
          </div>
        </motion.div>

        {/* =================== CAROUSEL VIEW =================== */}
        {effectiveView === 'carousel' && filteredSketches.length >= MIN_CAROUSEL_ITEMS && (
          <motion.div
            key="carousel-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Carousel container — fixed height, responsive */}
            <div className="w-full relative h-[420px] md:h-[560px]">
              <CircularCarousel
                key={carouselItems.map((i) => i.src).join('|')}
                items={carouselItems}
                preset="cylinder"
                intro="rise"
                cardWidth={isMobile ? 150 : 210}
                aspectRatio={0.8}
                gap={isMobile ? 16 : 22}
                speed={8}
                autoplay="drift"
                pauseOnHover
                focusOnClick
                captions
                depthFade={0.55}
                fadeColor={CREAM}
                innerShade={0.25}
                cornerRadius={8}
                onItemClick={(_item, index) => setSelectedIndex(index)}
              />
            </div>

            {/* Showing count — visible in carousel view too */}
            <div className="mt-6 text-center text-xs text-muted font-mono">
              Showing {filteredSketches.length} of {scrapItems.length} visual fragments
              {viewMode === 'carousel' && filteredSketches.length < MIN_CAROUSEL_ITEMS && (
                <span className="ml-2 text-accent">(switching to grid — too few items for carousel)</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Fallback message when carousel is selected but too few items */}
        {viewMode === 'carousel' && filteredSketches.length < MIN_CAROUSEL_ITEMS && filteredSketches.length > 0 && (
          <div className="py-6 mb-6 text-center border border-dashed border-token rounded-sm">
            <p className="text-xs text-muted font-mono">
              Carousel needs at least {MIN_CAROUSEL_ITEMS} sketches — showing grid instead.
            </p>
          </div>
        )}

        {/* =================== GRID VIEW =================== */}
        {effectiveView === 'grid' && (
          <>
            {filteredSketches.length > 0 ? (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {filteredSketches.map((item, index) => (
                  <motion.figure
                    key={item.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={index % 8}
                    className="break-inside-avoid group cursor-pointer flex flex-col gap-2.5 p-3 rounded-xs border border-token/60 bg-[rgba(23,23,23,0.015)] hover:border-foreground/40 transition-colors"
                    onClick={() => setSelectedIndex(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedIndex(index)
                      }
                    }}
                    aria-label={`View scrap: ${item.note || item.alt}`}
                  >
                    {/* Image Container with organic rotation */}
                    <motion.div
                      className="overflow-hidden relative bg-[rgba(23,23,23,0.06)] rounded-2xs"
                      style={{
                        aspectRatio: aspectRatios[item.size] || '1/1',
                        rotate: item.rotation,
                      }}
                      whileHover={{
                        rotate: 0,
                        scale: 1.02,
                        boxShadow: '0 12px 32px rgba(23,23,23,0.14)',
                        transition: { duration: 0.25, ease: 'easeOut' },
                      }}
                    >
                      <img
                        src={item.src}
                        alt={item.alt || 'Visual scrap sketch'}
                        width={400}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover select-none"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('.img-fallback')) {
                            const span = document.createElement('span')
                            span.className = 'img-fallback text-[11px] text-muted text-center p-3 font-mono'
                            span.textContent = item.alt || 'Visual scrap'
                            parent.appendChild(span)
                          }
                        }}
                      />

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-[var(--background)]/90 backdrop-blur-xs px-2 py-1 rounded-xs border border-token text-foreground">
                          Inspect ↗
                        </span>
                      </div>
                    </motion.div>

                    {/* Caption / Note & Metadata */}
                    <figcaption className="pt-1 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-handwritten text-[0.95rem] leading-snug text-foreground/90 group-hover:text-accent transition-colors">
                          {item.note || item.alt}
                        </p>
                        {item.date && (
                          <p className="text-[0.65rem] font-mono text-muted/70 uppercase tracking-wider mt-0.5">
                            {item.date}
                          </p>
                        )}
                      </div>
                      <span className="text-[0.65rem] font-mono text-muted uppercase shrink-0 pt-0.5">
                        #{item.id}
                      </span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-token rounded-sm">
                <p className="text-sm font-semibold text-foreground">No scraps found</p>
                <p className="text-xs text-muted mt-1">
                  No sketches match your current filter and search query.
                </p>
                <button
                  onClick={() => {
                    setFilter('all')
                    setSearch('')
                  }}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-token hover:border-foreground transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Scalability Footer */}
        <div className="mt-16 pt-8 border-t border-token flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span>
            Showing {filteredSketches.length} of {scrapItems.length} visual fragments
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/#scrapbook"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>Return to homepage snapshot</span>
              <Arrow size={12} direction="up-right" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===================== LIGHTBOX MODAL ===================== */}
      <AnimatePresence>
        {selectedSketch && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Modal Content Dialog */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative max-w-4xl w-full bg-[var(--background)] text-[var(--foreground)] border border-token rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-token bg-[var(--background)] shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                    Fig. {selectedSketch.id}
                  </span>
                  <span className="text-muted/60">•</span>
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    {selectedIndex + 1} of {filteredSketches.length}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Prev / Next controls */}
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <button
                      onClick={handlePrev}
                      className="px-2 py-1 rounded-xs hover:bg-neutral-200/60 transition-colors"
                      title="Previous sketch (Left arrow)"
                      aria-label="Previous sketch"
                    >
                      ← Prev
                    </button>
                    <span>/</span>
                    <button
                      onClick={handleNext}
                      className="px-2 py-1 rounded-xs hover:bg-neutral-200/60 transition-colors"
                      title="Next sketch (Right arrow)"
                      aria-label="Next sketch"
                    >
                      Next →
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground px-2 py-1 border border-token rounded-xs hover:bg-neutral-200/60 transition-colors"
                    aria-label="Close dialog (Escape)"
                  >
                    Close (ESC)
                  </button>
                </div>
              </div>

              {/* Main Image Viewport */}
              <div className="p-6 md:p-8 flex items-center justify-center bg-[rgba(23,23,23,0.02)] overflow-y-auto max-h-[65vh]">
                <img
                  src={selectedSketch.src}
                  alt={selectedSketch.alt || 'Sketch preview'}
                  decoding="async"
                  className="max-h-[58vh] max-w-full object-contain rounded-2xs shadow-md border border-token/60"
                  style={{
                    transform: `rotate(${selectedSketch.rotation || 0}deg)`,
                  }}
                />
              </div>

              {/* Bottom Metadata & Notes Panel */}
              <div className="p-6 border-t border-token bg-[var(--background)] shrink-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h2 className="font-handwritten text-2xl text-foreground leading-tight">
                      "{selectedSketch.note || selectedSketch.alt}"
                    </h2>

                    {selectedSketch.description ? (
                      <p className="text-xs text-muted leading-relaxed max-w-2xl">
                        {selectedSketch.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted leading-relaxed max-w-2xl">
                        {selectedSketch.alt}
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-start md:items-end gap-2 text-right shrink-0">
                    {selectedSketch.date && (
                      <span className="text-xs font-mono font-medium text-foreground bg-neutral-200/60 px-2 py-0.5 rounded-xs">
                        {selectedSketch.date}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                      Aspect: {selectedSketch.size} ({selectedSketch.rotation}° tilt)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
