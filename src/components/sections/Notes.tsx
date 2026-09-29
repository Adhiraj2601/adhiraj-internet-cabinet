import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { posts, isObservation } from '../../content/posts'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

export function Notes() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [activeTab, setActiveTab] = useState<'articles' | 'observations'>('articles')

  const articlePosts = posts.filter((p) => !isObservation(p))
  const observationPosts = posts.filter((p) => isObservation(p))

  const activePosts = activeTab === 'articles' ? articlePosts : observationPosts
  // Show the latest 4 items on the homepage to avoid clutter
  const displayPosts = activePosts.slice(0, 4)

  return (
    <section
      id="notes"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="notes-heading"
    >
      <div className="container-main">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Header Row: Title & Dual Segmented Tab Switcher */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 md:mb-12"
          >
            <div>
              <SectionLabel>03 / Notes</SectionLabel>
              <h2
                id="notes-heading"
                className="mt-3 font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              >
                Things I've been
                <br />
                thinking about
              </h2>
            </div>

            {/* Segmented Tab Switcher */}
            <div
              role="tablist"
              aria-label="Notes categories"
              className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center p-1 rounded-none select-none shrink-0"
              style={{
                border: '1.5px solid #171717',
                backgroundColor: '#FAF8F5',
                boxShadow: '2px 2px 0px #171717',
              }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'articles'}
                onClick={() => setActiveTab('articles')}
                className={`justify-center px-4 py-2 font-mono text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer focus:outline-none ${
                  activeTab === 'articles'
                    ? 'bg-[#171717] text-[#F4F1EA]'
                    : 'text-[#171717] hover:bg-black/5'
                }`}
              >
                <span>Articles</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-none font-mono ${
                    activeTab === 'articles'
                      ? 'bg-[#315CFF] text-white'
                      : 'bg-black/10 text-muted'
                  }`}
                >
                  {articlePosts.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'observations'}
                onClick={() => setActiveTab('observations')}
                className={`justify-center px-4 py-2 font-mono text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer focus:outline-none ${
                  activeTab === 'observations'
                    ? 'bg-[#171717] text-[#F4F1EA]'
                    : 'text-[#171717] hover:bg-black/5'
                }`}
              >
                <span>Observations</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-none font-mono ${
                    activeTab === 'observations'
                      ? 'bg-[#4E7A2E] text-white'
                      : 'bg-black/10 text-muted'
                  }`}
                >
                  {observationPosts.length}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Posts list with AnimatePresence */}
          <div className="relative min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.ul
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                role="list"
                className="divide-y"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {displayPosts.length > 0 ? (
                  displayPosts.map((post) => (
                    <NoteRow
                      key={post.id || post.slug}
                      post={post}
                      isObservationTab={activeTab === 'observations'}
                    />
                  ))
                ) : (
                  <li className="py-8 text-center text-xs font-mono text-muted">
                    No entries in this section yet.
                  </li>
                )}
              </motion.ul>
            </AnimatePresence>
          </div>

          {/* Footer Bar: Handwritten thought & View All link */}
          <motion.div
            variants={fadeUp}
            className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <motion.p
              key={activeTab + '-note'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-handwritten text-[1.1rem]"
              style={{
                color: 'var(--muted)',
                transform: 'rotate(-0.8deg)',
                display: 'inline-block',
              }}
              aria-hidden="true"
            >
              {activeTab === 'articles'
                ? 'more thoughts forming...'
                : 'more tapes recording...'}
            </motion.p>

            <Link
              to={activeTab === 'articles' ? '/blog' : '/blog?tab=observations'}
              className="group inline-flex items-center gap-2 text-xs font-bold font-mono tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors"
            >
              <span>
                {activeTab === 'articles'
                  ? `View All Articles (${articlePosts.length})`
                  : `Explore All Tapes (${observationPosts.length})`}
              </span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function NoteRow({
  post,
  isObservationTab,
}: {
  post: typeof posts[0]
  isObservationTab: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const destination = isObservationTab
    ? `/blog?tab=observations&tape=${post.slug}`
    : `/blog/${post.slug}`

  const tapeNumber = post.number.replace(/^No\./i, '').trim()

  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={destination}
        className="flex items-start md:items-center justify-between gap-4 py-5 md:py-6 group"
        style={{ borderColor: 'var(--border)' }}
        aria-label={`${post.title} — ${post.date}`}
      >
        <div className="flex items-start md:items-center gap-3.5 md:gap-8 flex-1 min-w-0">
          {/* Index Number: Clean 01/02 for articles, Tape Badge for observations */}
          {isObservationTab ? (
            <span
              className="text-[0.68rem] font-mono font-bold tracking-wider text-[#355B1B] bg-[#E1EDD5] px-2 py-0.5 shrink-0 mt-0.5 md:mt-0 flex items-center gap-1.5"
              style={{ border: '1px solid rgba(53,91,27,0.25)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#52872D] animate-pulse" />
              <span>TAPE {tapeNumber}</span>
            </span>
          ) : (
            <span className="text-[0.75rem] font-mono font-bold tracking-[0.2em] text-muted shrink-0 mt-1 md:mt-0">
              {post.number}
            </span>
          )}

          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 min-w-0">
            <motion.h3
              className="font-semibold text-[1rem] md:text-[1.1rem] leading-snug group-hover:text-black transition-colors"
              animate={{ x: hovered ? 6 : 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {post.title}
            </motion.h3>
            <span className="text-[0.7rem] tracking-widest text-muted uppercase shrink-0">
              {post.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[0.7rem] tracking-widest text-muted hidden md:block">
            {post.date}
          </span>
          <motion.span
            className="text-[0.9rem] text-muted group-hover:text-black transition-colors"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </div>
      </Link>
    </li>
  )
}
