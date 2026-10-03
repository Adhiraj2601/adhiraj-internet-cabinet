import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { books } from '../content/books'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Arrow } from '../components/ui/Arrow'
import { useIsMobile } from '../hooks/useMediaQuery'
import CircularGallery from '../components/ui/CircularGallery'

type StatusFilter = 'all' | 'reading' | 'read' | 'want-to-read'
type SortOption = 'default' | 'title' | 'author'

const statusConfig: Record<string, { label: string; symbol: string; color: string }> = {
  reading: { label: 'Reading', symbol: '→', color: 'var(--accent)' },
  read: { label: 'Finished', symbol: '✓', color: 'var(--muted)' },
  'want-to-read': { label: 'Want to read', symbol: '○', color: 'rgba(23,23,23,0.4)' },
}

export function BooksPage() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useIsMobile()

  // Reset activeIndex when filter, search, or sort changes during interaction
  const handleFilterChange = (f: StatusFilter) => {
    setFilter(f)
    setActiveIndex(0)
  }

  const handleSearchChange = (s: string) => {
    setSearch(s)
    setActiveIndex(0)
  }

  const handleSortChange = (s: SortOption) => {
    setSort(s)
    setActiveIndex(0)
  }

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: books.length,
      reading: books.filter((b) => b.status === 'reading').length,
      read: books.filter((b) => b.status === 'read').length,
      'want-to-read': books.filter((b) => b.status === 'want-to-read').length,
    }
  }, [])

  // Filter & search & sort logic
  const filteredBooks = useMemo(() => {
    let result = [...books]

    // Status filter
    if (filter !== 'all') {
      result = result.filter((b) => b.status === filter)
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.note && b.note.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sort === 'author') {
      result.sort((a, b) => a.author.localeCompare(b.author))
    }

    return result
  }, [filter, search, sort])

  // Memoized gallery items for CircularGallery (stable reference)
  const galleryItems = useMemo(() => {
    return filteredBooks.map((b) => ({
      image: b.cover || '',
      text: b.title,
    }))
  }, [filteredBooks])

  const activeBook = filteredBooks[activeIndex] || filteredBooks[0]

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
          <SectionLabel>04 / Library Archive</SectionLabel>
          <div className="mt-3 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1
                className="font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
              >
                The Library
              </h1>
              <p className="mt-4 text-[0.95rem] text-muted max-w-xl leading-relaxed">
                An ongoing archive of books that live on my desk, in my bag, or beside my bed.
                A quiet collection of fiction, philosophy, essays, and craft.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-muted shrink-0">
              <span>{books.length} volumes indexed</span>
              <span>•</span>
              <span className="text-accent">{counts.reading} currently reading</span>
            </div>
          </div>
        </motion.div>

        {/* Scalable Controls Bar: Tabs + Search + Sort */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-token/60"
        >
          {/* Status Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'all'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => handleFilterChange('reading')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'reading'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Reading ({counts.reading})
            </button>
            <button
              onClick={() => handleFilterChange('read')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'read'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Finished ({counts.read})
            </button>
            <button
              onClick={() => handleFilterChange('want-to-read')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'want-to-read'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              To Read ({counts['want-to-read']})
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search title, author, note..."
                className="w-full text-xs px-3 py-1.5 bg-transparent border border-token rounded-xs focus:outline-none focus:border-foreground placeholder:text-muted/60"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="text-xs px-2.5 py-1.5 bg-transparent border border-token rounded-xs focus:outline-none focus:border-foreground text-muted font-medium"
            >
              <option value="default">Sort: Default</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="author">Sort: Author</option>
            </select>
          </div>
        </motion.div>

        {/* Circular Book Gallery & Active Book Details */}
        {filteredBooks.length > 0 ? (
          <div>
            <div
              className="library-gallery w-full relative"
              style={{ height: isMobile ? 420 : 600, position: 'relative' }}
            >
              <CircularGallery
                items={galleryItems}
                bend={3}
                textColor="#1a1a1a"
                borderRadius={0.05}
                scrollEase={0.05}
                font="bold 28px Manrope"
                onActiveChange={setActiveIndex}
              />
            </div>

            {/* Active Book Details Under Gallery */}
            {activeBook && (
              <div className="mt-8 md:mt-10 max-w-xl mx-auto text-center px-4 min-h-[140px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeBook.id}-${activeIndex}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-2.5"
                  >
                    {/* Status & Catalog Position */}
                    <div className="flex items-center gap-2.5 text-[0.7rem] font-mono tracking-widest uppercase">
                      <span className="text-muted/70">
                        Vol. #{activeBook.id} · {activeIndex + 1} of {filteredBooks.length}
                      </span>
                      <span className="text-muted/40">•</span>
                      <span
                        className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-xs border border-token/60 bg-[var(--background)] shadow-2xs"
                        style={{ color: (statusConfig[activeBook.status] || statusConfig.read).color }}
                      >
                        <span>{(statusConfig[activeBook.status] || statusConfig.read).symbol}</span>
                        <span>{(statusConfig[activeBook.status] || statusConfig.read).label}</span>
                      </span>
                    </div>

                    {/* Book Title */}
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                      {activeBook.title}
                    </h2>

                    {/* Author */}
                    <p className="text-xs sm:text-sm text-muted font-medium tracking-wide">
                      by {activeBook.author}
                    </p>

                    {/* Note in handwritten / italic style */}
                    {activeBook.note && (
                      <p
                        className="font-handwritten text-base sm:text-lg mt-1 text-muted max-w-lg leading-relaxed italic"
                        style={{ color: 'var(--muted)' }}
                      >
                        "{activeBook.note}"
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-token rounded-sm">
            <p className="text-sm font-semibold text-foreground">Nothing here yet</p>
            <p className="text-xs text-muted mt-1">
              No titles match your current filter and search query.
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

        {/* Scalability Footer */}
        <div className="mt-16 pt-8 border-t border-token flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span>
            Showing {filteredBooks.length} of {books.length} items
          </span>
          <div className="flex items-center gap-2">
            <Link
              to="/#books"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>Return to homepage snapshot</span>
              <Arrow size={12} direction="up-right" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
