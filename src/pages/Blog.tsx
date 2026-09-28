import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { posts, type Post } from '../content/posts'

// Retro Scrapbook theme tokens matching the reference image exactly
const BG_PISTACHIO = '#8fb87e' // Solid light pistachio green outer page background
const BG_CARD_GREEN = '#a8cb92' // Soft card green matching reference
const ACCENT_ORANGE = '#e5aa60' // Warm amber/orange accent
const BORDER_BLACK = '1px solid #000000' // Thin, harsh 1px black border
const INSTAGRAM_URL = 'https://www.instagram.com/_adhiraj_sengar_/'

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
        <path d="M24 72l14-22" stroke="#8b5a2b" strokeWidth="4" />
        <path d="M38 50l6-8c3-3 6-1 5 3l-3 7z" fill="#f687b3" stroke="currentColor" strokeWidth="1.5" />
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
      transition={{ duration: 0.3, delay: (index % 12) * 0.03 }}
      className="w-full max-w-[360px] rounded-none p-[14px] transition-all duration-200 group hover:-translate-y-0.5 justify-self-start"
      style={{
        backgroundColor: BG_CARD_GREEN,
        border: '1.5px solid #000000',
        boxShadow: '2px 2px 0px #000000',
      }}
    >
      {/* Top Square Thumbnail: aspect 1/1, 1.5px black border, object-fit: cover */}
      <Link
        to={`/blog/${post.slug}`}
        className="block w-full aspect-square bg-white rounded-none overflow-hidden relative flex items-center justify-center"
        style={{ border: '1.5px solid #000000' }}
      >
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <DefaultDoodle index={index} />
        )}
      </Link>

      {/* Below Image: Two-column row (Title/Date on left, 52x52 Arrow button on right) */}
      <div className="flex items-start justify-between gap-3 mt-[11px]">
        {/* Left Column: Title (about 16px) & Date (about 13px) + Tag (10px) */}
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-bold text-[16px] leading-[1.25] text-[#1a1a1a] line-clamp-2">
            <Link to={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>

          <div className="flex items-center gap-2 mt-[6px] flex-wrap">
            <span className="font-mono text-[13px] text-neutral-800 font-medium">
              {post.date}
            </span>
            {post.category && (
              <span
                className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase text-[#1a1a1a] bg-[#ffd166]"
                style={{ border: '1px solid #000000' }}
              >
                {post.category}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: 52x52px square, filled #D9694A, 1.5px black border, 3px 3px 0 #000 shadow */}
        <Link
          to={`/blog/${post.slug}`}
          aria-label={`Read ${post.title}`}
          className="w-[52px] h-[52px] shrink-0 flex items-center justify-center font-mono font-bold rounded-none transition-transform duration-150 hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
          style={{
            backgroundColor: '#D9694A',
            border: '1.5px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            color: '#000000',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </motion.article>
  )
}

export function Blog() {
  const [activeTab, setActiveTab] = useState<'all' | 'observations'>('all')

  const filteredPosts =
    activeTab === 'all'
      ? posts
      : posts.filter((p) => (p.category || '').toLowerCase().includes('observation'))

  return (
    <div
      className="min-h-screen pt-16 pb-16 px-4 md:px-[2.5vw]"
      style={{
        backgroundColor: BG_PISTACHIO, // Solid light pistachio green
      }}
    >
      {/* Full-bleed Centered Main Content Container with White Background & Crumpled Paper Texture */}
      <div
        className="w-full max-w-none mx-auto bg-white rounded-none relative overflow-hidden mt-[30px] sm:mt-[50px]"
        style={{
          border: BORDER_BLACK,
          boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Realistic Crumpled Paper Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none bg-[url('/images/crumpled-paper.jpg')] bg-cover bg-center mix-blend-multiply opacity-80 z-0"
        />

        {/* Content Container (z-10 relative with 35px padding) */}
        <div className="relative z-10 p-4 sm:p-6 md:p-[35px]">
          {/* ===================== HERO CARD ===================== */}
          <div
            className="w-full rounded-none p-5 sm:p-6 md:p-[30px] mb-8 relative overflow-hidden"
            style={{
              backgroundColor: BG_CARD_GREEN,
              border: BORDER_BLACK,
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            {/* Top-Right Instagram icon badge */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-none flex items-center justify-center bg-white hover:bg-neutral-50 transition-all hover:scale-105"
                style={{
                  border: BORDER_BLACK,
                  boxShadow: '1px 1px 0px #000000',
                }}
                title="Instagram Profile"
                aria-label="Instagram Profile"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#1a1a1a]"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 sm:gap-8 lg:gap-10">
              {/* Avatar / Illustration Landscape Frame (~520px wide on desktop) */}
              <div
                className="w-full xl:w-[520px] h-60 sm:h-72 md:h-80 xl:h-[300px] rounded-none bg-[#efe9d9] flex items-center justify-center shrink-0 overflow-hidden"
                style={{
                  border: BORDER_BLACK,
                  boxShadow: '1px 1px 0px #000000',
                }}
              >
                <img
                  src="/images/blog/adhiraj-avatar.jpg"
                  alt="Adhiraj"
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.src = '/images/blog/cat-doodle.jpg'
                  }}
                />
              </div>

              {/* Monospace Greeting & Bio filling remaining space */}
              <div className="space-y-2 sm:space-y-3 flex-1 min-w-0 font-mono text-[#1a1a1a]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1a1a]">
                  Helloowwww!!!
                </h1>
                <p className="text-base sm:text-lg font-semibold text-[#1a1a1a]">
                  I am Adhiraj (Adi)
                </p>
                <p className="text-base sm:text-lg text-neutral-800">
                  Welcome to my Space :&gt;
                </p>
                <p className="text-base sm:text-lg text-neutral-800">
                  I love to learn something DAILY.
                </p>

                {/* Status card matching reference */}
                <div className="pt-2">
                  <div
                    className="inline-flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-none"
                    style={{
                      border: BORDER_BLACK,
                      boxShadow: '1px 1px 0px #000000',
                    }}
                  >
                    <span className="text-sm font-mono text-[#1a1a1a] font-medium">
                      And these days i am:
                    </span>
                    <span
                      className="bg-white px-3 py-1 rounded-none font-mono font-medium text-xs sm:text-sm text-neutral-900"
                      style={{
                        border: BORDER_BLACK,
                      }}
                    >
                      Trying to find a job
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== TABS & CONTROLS BAR (Flush with header card) ===================== */}
          <div className="w-full flex items-center justify-between gap-3 mb-8">
            {/* Left: Category Tabs */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs sm:text-sm font-mono font-bold uppercase rounded-none transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-[#1a1a1a]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
                style={{
                  backgroundColor: activeTab === 'all' ? ACCENT_ORANGE : '#ffffff',
                  border: BORDER_BLACK,
                  boxShadow: '1px 1px 0px #000000',
                }}
              >
                <span>📁</span>
                <span>BLOGS</span>
              </button>

              <button
                onClick={() => setActiveTab('observations')}
                className={`px-4 py-2 text-xs sm:text-sm font-mono font-bold uppercase rounded-none transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'observations'
                    ? 'text-[#1a1a1a]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
                style={{
                  backgroundColor: activeTab === 'observations' ? ACCENT_ORANGE : '#ffffff',
                  border: BORDER_BLACK,
                  boxShadow: '1px 1px 0px #000000',
                }}
              >
                <span>✏️</span>
                <span>OBSERVATIONS</span>
              </button>
            </div>

            {/* Right: Scroll Down Button */}
            <button
              onClick={() => {
                document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-4 py-2 text-xs sm:text-sm font-mono font-bold text-neutral-800 bg-white rounded-none hover:bg-neutral-100 transition-colors flex items-center gap-2 cursor-pointer"
              style={{
                border: BORDER_BLACK,
                boxShadow: '1px 1px 0px #000000',
              }}
            >
              <span>Scroll Down</span>
              <span>↓</span>
            </button>
          </div>

          {/* ===================== BLOG POST GRID (4-per-row, 25px gap, left-aligned) ===================== */}
          <div id="blog-grid" className="w-full">
            <style>{`
              .blog-cards-grid {
                display: grid;
                grid-template-columns: repeat(1, minmax(0, 360px));
                gap: 25px;
                justify-content: start;
                width: 100%;
              }
              @media (min-width: 600px) {
                .blog-cards-grid {
                  grid-template-columns: repeat(2, minmax(0, 360px));
                }
              }
              @media (min-width: 900px) {
                .blog-cards-grid {
                  grid-template-columns: repeat(3, minmax(0, 360px));
                }
              }
              @media (min-width: 1200px) {
                .blog-cards-grid {
                  grid-template-columns: repeat(4, minmax(0, 360px));
                }
              }
            `}</style>
            {filteredPosts.length > 0 ? (
              <div className="blog-cards-grid">
                {filteredPosts.map((post, idx) => (
                  <BlogCard key={post.id || post.slug} post={post} index={idx} />
                ))}
              </div>
            ) : (
              <div
                className="p-12 text-center rounded-none font-mono"
                style={{
                  backgroundColor: BG_CARD_GREEN,
                  border: BORDER_BLACK,
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                <p className="font-bold text-sm text-[#1a1a1a]">
                  No notes found in this section :&gt;
                </p>
                <p className="text-xs text-neutral-700 mt-1">
                  You can write and publish entries from the Admin dashboard.
                </p>
                <Link
                  to="/admin"
                  className="inline-block mt-4 px-4 py-1.5 font-mono text-xs font-bold uppercase rounded-none"
                  style={{
                    backgroundColor: ACCENT_ORANGE,
                    border: BORDER_BLACK,
                    boxShadow: '1px 1px 0px #000000',
                    color: '#1a1a1a',
                  }}
                >
                  Open Admin Dashboard →
                </Link>
              </div>
            )}
          </div>

          {/* ===================== FOOTER BAR ===================== */}
          <div className="w-full mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-800 font-mono text-xs sm:text-sm border-t border-black/30">
            <span>
              {filteredPosts.length} entries published
            </span>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-black font-semibold hover:underline">
                ← Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
