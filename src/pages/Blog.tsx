import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { posts, type Post } from '../content/posts'

// Pastel green theme tokens matching the reference image exactly
const BG_GREEN = '#c4d9ad' // Soft pastel green
const ACCENT_ORANGE = '#e08b58' // Warm orange button accent
const BORDER_DARK = '#1a1a1a' // Chunky dark outline

const CATEGORIES = [
  'All',
  'Observations',
  'Thoughts',
  'Projects',
  'Programming',
  'Books',
  'Writing',
  'Learning',
]

// Playful procedural cat doodle for posts that don't have an image
function DefaultDoodle({ index }: { index: number }) {
  const doodleTypes = ['cat-peeking', 'turtle', 'cat-laptop', 'cat-sleeping', 'cat-paint', 'sun-cat']
  const type = doodleTypes[index % doodleTypes.length]

  if (type === 'turtle') {
    return (
      <svg viewBox="0 0 100 100" className="w-16 h-16 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="55" rx="26" ry="18" fill="#d2e3be" />
        <circle cx="26" cy="55" r="9" fill="#d2e3be" />
        <circle cx="23" cy="53" r="1.5" fill="currentColor" />
        <path d="M40 70c0 4-3 7-5 7s-3-3-3-7M60 70c0 4-3 7-5 7s-3-3-3-7M72 58c4 2 8 0 8-3" />
        <path d="M38 48l12-6 12 6M38 56h24M44 62l6-4 6 4" strokeWidth="1.5" />
      </svg>
    )
  }

  if (type === 'cat-laptop') {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 45c-4-10 6-22 18-20 6-8 18-6 24 2 8-2 18 6 16 18" fill="white" />
        <path d="M28 26l-6-8 10 3M68 28l8-9-3 10" />
        <circle cx="36" cy="38" r="2.5" fill="currentColor" />
        <circle cx="56" cy="38" r="2.5" fill="currentColor" />
        <path d="M44 42q2 3 4 0" />
        {/* Laptop */}
        <path d="M68 55l16-6v16l-16 4z" fill="#f0ede6" />
        <path d="M54 68h28l-8-12H48z" fill="#e5e5e5" />
      </svg>
    )
  }

  if (type === 'cat-paint') {
    return (
      <svg viewBox="0 0 100 100" className="w-18 h-18 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="50" r="24" fill="white" />
        <path d="M32 32l-7-10 12 3M68 32l7-10-12 3" />
        <circle cx="42" cy="46" r="2" fill="currentColor" />
        <circle cx="58" cy="46" r="2" fill="currentColor" />
        <path d="M48 52q2 2 4 0" />
        {/* Paintbrush */}
        <path d="M24 72l14-22" stroke="#8b5a2b" strokeWidth="4" />
        <path d="M38 50l6-8c3-3 6-1 5 3l-3 7z" fill="#f687b3" stroke="currentColor" strokeWidth="1.5" />
        {/* Beret */}
        <ellipse cx="50" cy="28" rx="14" ry="7" fill="#b794f4" />
      </svg>
    )
  }

  // Default playful cat doodle
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 text-neutral-800" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 62c-3-18 6-36 28-36 20 0 30 18 28 36" fill="white" />
      <path d="M28 32l-9-12 14 4M72 32l9-12-14 4" />
      <ellipse cx="38" cy="48" rx="2.5" ry="3.5" fill="currentColor" />
      <ellipse cx="62" cy="48" rx="2.5" ry="3.5" fill="currentColor" />
      <circle cx="30" cy="52" r="3" fill="#fbb6ce" stroke="none" />
      <circle cx="70" cy="52" r="3" fill="#fbb6ce" stroke="none" />
      <path d="M46 54q4 5 8 0" />
      {/* Stripes on head */}
      <path d="M42 28v8M50 26v10M58 28v8" stroke="#a0aec0" strokeWidth="2.5" />
      <path d="M20 50h-8M20 56h-6M80 50h8M80 56h6" strokeWidth="1.5" />
    </svg>
  )
}

function BlogCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (index % 12) * 0.04 }}
      className="flex flex-col justify-between rounded-md p-2.5 sm:p-3 transition-all duration-200 group"
      style={{
        backgroundColor: BG_GREEN,
        border: `2px solid ${BORDER_DARK}`,
        boxShadow: `2px 2px 0px ${BORDER_DARK}`,
      }}
    >
      <div>
        {/* Top White Square Doodle/Image Box */}
        <Link
          to={`/blog/${post.slug}`}
          className="block w-full aspect-square bg-white rounded-sm overflow-hidden mb-2.5 relative flex items-center justify-center p-2"
          style={{ border: `2px solid ${BORDER_DARK}` }}
        >
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-contain select-none group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <DefaultDoodle index={index} />
          )}
        </Link>

        {/* Title */}
        <h3 className="font-mono font-bold text-[13px] leading-tight text-[#1a1a1a] line-clamp-2">
          <Link to={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="font-mono text-[11px] text-neutral-700 mt-1 line-clamp-2 leading-relaxed opacity-90">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Card Footer: Date, Read time, & Orange Arrow Button */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-neutral-700 font-medium">
            {post.date}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {post.readTime && (
              <span className="font-mono text-[9px] text-neutral-600">
                {post.readTime}
              </span>
            )}
            <span
              className="font-mono text-[8px] uppercase tracking-wider px-1 py-0.2 rounded-[2px]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                border: `1px solid ${BORDER_DARK}`,
              }}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Warm Orange Action Button */}
        <Link
          to={`/blog/${post.slug}`}
          aria-label={`Read ${post.title}`}
          className="w-7 h-7 flex items-center justify-center font-mono font-bold text-sm text-[#1a1a1a] rounded-xs transition-transform duration-150 hover:translate-x-0.5"
          style={{
            backgroundColor: ACCENT_ORANGE,
            border: `2px solid ${BORDER_DARK}`,
            boxShadow: `1px 1px 0px ${BORDER_DARK}`,
          }}
        >
          →
        </Link>
      </div>
    </motion.article>
  )
}

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category.toLowerCase() === selectedCategory.toLowerCase()

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q) ||
        post.tags?.some((t) => t.toLowerCase().includes(q))

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const scrollToGrid = () => {
    const el = document.getElementById('blog-grid')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#ebf1df', // Subtle soft pale green frame background
        backgroundImage: 'radial-gradient(#1a1a1a 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* ===================== HERO CARD ===================== */}
        <div
          className="rounded-md p-4 sm:p-6 mb-6 relative overflow-hidden"
          style={{
            backgroundColor: BG_GREEN,
            border: `2px solid ${BORDER_DARK}`,
            boxShadow: `3px 3px 0px ${BORDER_DARK}`,
          }}
        >
          {/* Top-Right Camera/Snap icon badge */}
          <div className="absolute top-4 right-4">
            <div
              className="w-7 h-7 rounded-xs flex items-center justify-center bg-white/80"
              style={{ border: `1.5px solid ${BORDER_DARK}` }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
            {/* Avatar / Doodle Circle */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-[#a3c489] flex items-center justify-center shrink-0 overflow-hidden"
              style={{ border: `2px solid ${BORDER_DARK}` }}
            >
              <img
                src="/images/blog/cat-doodle.jpg"
                alt="Adhiraj"
                className="w-full h-full object-cover select-none"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                }}
              />
            </div>

            {/* Monospace Greeting & Bio */}
            <div className="space-y-1.5 flex-1 font-mono text-neutral-900">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Helloowwww!!!
              </h1>
              <p className="text-xs sm:text-sm font-semibold">
                I am Adhiraj (Adi)
              </p>
              <p className="text-xs sm:text-sm text-neutral-800">
                Welcome to my Blog :&gt;
              </p>
              <p className="text-xs sm:text-sm text-neutral-800">
                Thoughts, project logs, book reflections & discoveries.
              </p>

              {/* Status input box */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                <span>And these days i am:</span>
                <span
                  className="bg-white px-2.5 py-0.5 rounded-xs font-mono font-medium text-xs text-neutral-900"
                  style={{
                    border: `1.5px solid ${BORDER_DARK}`,
                    boxShadow: `1px 1px 0px ${BORDER_DARK}`,
                  }}
                >
                  Building LoreGraph & drawing daily
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== CONTROL BAR: TABS & BUTTONS ===================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-xs font-mono font-bold text-xs uppercase tracking-wider transition-all duration-150 shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? ACCENT_ORANGE : '#ffffff',
                    border: `2px solid ${BORDER_DARK}`,
                    boxShadow: `2px 2px 0px ${BORDER_DARK}`,
                    color: '#1a1a1a',
                    transform: isSelected ? 'translateY(1px)' : 'none',
                  }}
                >
                  {cat === 'All' && '📁 '}
                  {cat === 'Observations' && '✏ '}
                  {cat === 'Projects' && '💡 '}
                  {cat === 'Programming' && '⚡ '}
                  {cat === 'Books' && '📚 '}
                  {cat === 'Thoughts' && '💭 '}
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Right Controls: Search & Scroll Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search notes..."
                className="w-full font-mono text-xs px-3 py-1.5 bg-white text-neutral-900 rounded-xs focus:outline-none placeholder:text-neutral-500"
                style={{
                  border: `2px solid ${BORDER_DARK}`,
                  boxShadow: `2px 2px 0px ${BORDER_DARK}`,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-500 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scroll Down Button */}
            <button
              onClick={scrollToGrid}
              className="px-3 py-1.5 bg-white font-mono text-xs font-bold text-[#1a1a1a] rounded-xs shrink-0 hover:bg-neutral-100 transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
              style={{
                border: `2px solid ${BORDER_DARK}`,
                boxShadow: `2px 2px 0px ${BORDER_DARK}`,
              }}
            >
              <span>Scroll Down</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        {/* ===================== BLOG POST GRID ===================== */}
        <div id="blog-grid">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, idx) => (
                  <BlogCard key={post.id || post.slug} post={post} index={idx} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className="p-12 text-center rounded-md font-mono"
              style={{
                backgroundColor: BG_GREEN,
                border: `2px solid ${BORDER_DARK}`,
                boxShadow: `3px 3px 0px ${BORDER_DARK}`,
              }}
            >
              <p className="font-bold text-sm text-[#1a1a1a]">
                No notes found in "{selectedCategory}"
              </p>
              <p className="text-xs text-neutral-700 mt-1">
                Try searching for something else or reset your filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="mt-4 px-4 py-1.5 font-mono text-xs font-bold uppercase rounded-xs cursor-pointer"
                style={{
                  backgroundColor: ACCENT_ORANGE,
                  border: `2px solid ${BORDER_DARK}`,
                  boxShadow: `2px 2px 0px ${BORDER_DARK}`,
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ===================== FOOTER BAR ===================== */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-700 font-mono text-xs border-t-2 border-[#1a1a1a]/20">
          <span>
            {filteredPosts.length} of {posts.length} entries shown
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-black font-semibold hover:underline">
              ← Return Home
            </Link>
            <span className="text-neutral-400">•</span>
            <Link to="/sketches" className="hover:text-black hover:underline">
              Sketches Archive →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
