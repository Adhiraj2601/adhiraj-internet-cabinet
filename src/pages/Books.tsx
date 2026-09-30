import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { books } from '../content/books'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Arrow } from '../components/ui/Arrow'
import { fadeUp, stagger } from '../lib/animations'

type StatusFilter = 'all' | 'reading' | 'read' | 'want-to-read'
type SortOption = 'default' | 'title' | 'author'

function BookCard({ book, index }: { book: typeof books[0]; index: number }) {
  const [imgError, setImgError] = useState(false)

  const statusConfig = {
    'reading': { label: 'Reading', symbol: '→', color: 'var(--accent)' },
    'read': { label: 'Finished', symbol: '✓', color: 'var(--muted)' },
    'want-to-read': { label: 'Want to read', symbol: '○', color: 'rgba(23,23,23,0.4)' },
  }

  const currentStatus = statusConfig[book.status] || statusConfig.read

  return (
    <motion.article
      layout
      variants={fadeUp}
      custom={index % 12}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-3 group"
    >
      {/* Book Cover Frame */}
      <motion.div
        className="overflow-hidden border border-token/60 relative"
        style={{
          aspectRatio: '2/3',
          background: 'rgba(23,23,23,0.05)',
        }}
        whileHover={{
          scale: 1.03,
          boxShadow: '0 14px 35px rgba(23,23,23,0.12)',
          transition: { duration: 0.25, ease: 'easeOut' },
        }}
      >
        {book.cover && !imgError ? (
          <img
            src={book.cover}
            alt={`${book.title} cover`}
            width={200}
            height={300}
            className="w-full h-full object-cover select-none"
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-between p-4 text-center">
            <span className="text-[0.6rem] font-mono tracking-widest uppercase text-muted">
              {book.id}
            </span>
            <span className="text-[0.75rem] font-bold tracking-wider uppercase text-foreground leading-snug">
              {book.title}
            </span>
            <span className="text-[0.65rem] text-muted font-medium">
              {book.author}
            </span>
          </div>
        )}

        {/* Small subtle badge on cover */}
        <div className="absolute top-2 right-2 pointer-events-none">
          <span
            className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded-xs bg-[var(--background)]/90 backdrop-blur-xs border border-token shadow-2xs"
            style={{ color: currentStatus.color }}
            title={currentStatus.label}
          >
            {currentStatus.symbol}
          </span>
        </div>
      </motion.div>

      {/* Book Meta */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-bold text-[0.9rem] leading-snug tracking-tight text-foreground group-hover:text-accent transition-colors">
              {book.title}
            </h3>
          </div>
          <p className="text-[0.75rem] text-muted mt-0.5 font-medium">{book.author}</p>
        </div>

        {book.note && (
          <p
            className="font-handwritten text-[0.85rem] mt-2.5 leading-snug"
            style={{ color: 'var(--muted)' }}
          >
            "{book.note}"
          </p>
        )}
      </div>
    </motion.article>
  )
}

export function BooksPage() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('default')

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
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'all'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('reading')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'reading'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Reading ({counts.reading})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-xs shrink-0 ${
                filter === 'read'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-neutral-200/50'
              }`}
            >
              Finished ({counts.read})
            </button>
            <button
              onClick={() => setFilter('want-to-read')}
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, author, note..."
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

            {/* Sort Selector */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs px-2.5 py-1.5 bg-transparent border border-token rounded-xs focus:outline-none focus:border-foreground text-muted font-medium"
            >
              <option value="default">Sort: Default</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="author">Sort: Author</option>
            </select>
          </div>
        </motion.div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-7"
          >
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-20 text-center border border-dashed border-token rounded-sm">
            <p className="text-sm font-semibold text-foreground">No books found</p>
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
