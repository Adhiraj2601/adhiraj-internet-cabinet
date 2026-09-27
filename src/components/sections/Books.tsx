import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { books } from '../../content/books'
import { SectionLabel } from '../ui/SectionLabel'
import { Arrow } from '../ui/Arrow'
import { stagger, fadeUp } from '../../lib/animations'

function BookItem({ book, index }: { book: typeof books[0]; index: number }) {
  const [imgError, setImgError] = useState(false)

  const statusColors: Record<string, string> = {
    'reading': 'var(--accent)',
    'read': 'var(--muted)',
    'want-to-read': 'rgba(23,23,23,0.4)',
  }

  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      className="flex flex-col gap-3 group"
    >
      {/* Book cover or placeholder */}
      <motion.div
        className="overflow-hidden border border-token/60"
        style={{
          aspectRatio: '2/3',
          background: 'rgba(23,23,23,0.07)',
        }}
        whileHover={{
          scale: 1.04,
          boxShadow: '0 12px 40px rgba(23,23,23,0.14)',
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        }}
      >
        {book.cover && !imgError ? (
          <img
            src={book.cover}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover select-none"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
            <span className="text-[0.65rem] font-semibold tracking-widest text-center uppercase text-muted leading-snug">
              {book.title}
            </span>
          </div>
        )}
      </motion.div>

      {/* Book info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[0.85rem] leading-snug">{book.title}</h3>
          <span
            className="text-[0.6rem] font-bold tracking-widest uppercase shrink-0 mt-0.5"
            style={{ color: statusColors[book.status] }}
          >
            {book.status === 'reading' ? '→' : book.status === 'read' ? '✓' : '○'}
          </span>
        </div>
        <p className="text-[0.75rem] text-muted mt-0.5">{book.author}</p>
        {book.note && (
          <p className="text-[0.8rem] font-handwritten mt-2 leading-snug" style={{ color: 'var(--muted)' }}>
            "{book.note}"
          </p>
        )}
      </div>
    </motion.article>
  )
}

export function Books() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Curated 8 books for the homepage exhibition room
  const curatedBooks = books.slice(0, 8)

  return (
    <section
      id="books"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="books-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <SectionLabel>04 / Reading</SectionLabel>
              <h2
                id="books-heading"
                className="mt-3 font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              >
                Things I've read
              </h2>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <p className="text-[0.85rem] text-muted max-w-xs leading-relaxed md:text-right">
                a loose collection. not a reading list. not a review. just the books that live on my desk.
              </p>
              <Link
                to="/books"
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-accent hover:underline group"
              >
                <span>Browse Library ({books.length})</span>
                <Arrow size={12} direction="up-right" className="transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>

          {/* Books grid (curated exhibition selection) */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-5"
          >
            {curatedBooks.map((book, index) => (
              <BookItem key={book.id} book={book} index={index} />
            ))}
          </motion.div>

          {/* Subtle contextual link below */}
          <motion.div
            variants={fadeUp}
            className="mt-12 md:mt-16 pt-6 border-t border-token/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <span className="text-xs font-mono text-muted">
              Curated snapshot • {curatedBooks.length} of {books.length} titles
            </span>
            <Link
              to="/books"
              className="group inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors"
            >
              <span>View All Books ({books.length})</span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
