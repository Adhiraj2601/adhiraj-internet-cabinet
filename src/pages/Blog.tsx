import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { posts, isObservation, type Post } from '../content/posts'
import { ObservationsGrid } from '../components/observations/ObservationsGrid'

const TvPlayer = lazy(() =>
  import('../components/observations/TvPlayer').then((m) => ({ default: m.TvPlayer }))
)

// Retro Scrapbook theme tokens
const BG_PAGE_GREEN = '#A9CB8B' // Lighter pastel green outer page background
const BG_HEADER_GREEN = '#AFD080' // Fresh, slightly yellower light green for profile header
const BG_CARD_GREEN = '#A8CB8C' // Fresh yellow-green for blog cards
const ACCENT_ORANGE = '#e5aa60' // Warm amber/orange accent
const BORDER_BLACK = '1.5px solid #000000' // Thin, harsh 1.5px black border
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

function NewspaperIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer folded paper outline with left spine roll */}
      <path d="M5 2h15a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 4 4.5h1.5v13.5" />
      {/* Two headline lines */}
      <line x1="9.5" y1="7.5" x2="17.5" y2="7.5" />
      <line x1="9.5" y1="12.5" x2="17.5" y2="12.5" />
    </svg>
  )
}

function PenIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Tilted drawing pen with sharp nib and cap */}
      <path d="M18 2.5l3.5 3.5-13 13L3 21l2-5.5L18 2.5z" />
      <path d="M14.5 6l3.5 3.5" />
      <path d="M6 14.5l3.5 3.5" />
    </svg>
  )
}

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tapeParam = searchParams.get('tape')
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'all' | 'observations'>(
    tapeParam || tabParam === 'observations' ? 'observations' : 'all'
  )
  const [isAvatarTapped, setIsAvatarTapped] = useState(false)
  const [selectedTape, setSelectedTape] = useState<Post | null>(null)

  // Separate blog posts (strictly non-observations) and observation posts
  const blogPosts = useMemo(() => posts.filter((p) => !isObservation(p)), [])
  const observationPosts = useMemo(() => posts.filter((p) => isObservation(p)), [])

  // Sync selected tape with ?tape= URL param
  useEffect(() => {
    if (tapeParam) {
      const match = posts.find((p) => p.slug === tapeParam)
      if (match) {
        setSelectedTape(match)
        setActiveTab('observations')
      }
    } else {
      setSelectedTape(null)
    }
  }, [tapeParam])

  const handleSelectTape = (tape: Post) => {
    setSelectedTape(tape)
    setSearchParams({ tape: tape.slug }, { replace: true })
  }

  const handleCloseTape = () => {
    setSelectedTape(null)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('tape')
    setSearchParams(nextParams, { replace: true })
  }

  const currentCount = activeTab === 'all' ? blogPosts.length : observationPosts.length

  return (
    <div
      className="min-h-screen pt-16 pb-16 px-4 md:px-[2.5vw]"
      style={{
        backgroundColor: BG_PAGE_GREEN, // Lighter pastel green
      }}
    >
      {/* Full-bleed Centered Main Content Container with Warm Off-White Background & Subtle Paper Texture */}
      <div
        className="w-full max-w-none mx-auto rounded-none relative overflow-visible mt-[30px] sm:mt-[50px]"
        style={{
          backgroundColor: '#FAFAF7',
          border: BORDER_BLACK,
          boxShadow: '4px 4px 0px #000000',
        }}
      >
        {/* Subtle, Brightened Crumpled Paper Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none bg-[url('/images/crumpled-paper.jpg')] bg-cover bg-center z-0"
          style={{
            filter: 'brightness(1.25) contrast(0.7)',
            opacity: 0.55,
          }}
        />

        {/* Content Container (z-10 relative with 35px padding) */}
        <div className="relative z-10 p-4 sm:p-6 md:p-[35px]">
          {/* ===================== HERO CARD ===================== */}
          <div
            className="w-full rounded-none p-5 sm:p-6 md:p-[30px] mb-8 relative overflow-visible"
            style={{
              backgroundColor: BG_HEADER_GREEN,
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
              {/* Profile Avatar Frame with Peeking Cat Hover Effect */}
              <div
                className={`profile-wrap relative inline-block w-full xl:w-[520px] shrink-0 select-none cursor-pointer ${
                  isAvatarTapped ? 'is-active' : ''
                }`}
                onClick={() => setIsAvatarTapped((prev) => !prev)}
              >
                {/* Peeking Cat Sticker behind the picture frame */}
                <div className="peek-cat">
                  <img
                    src="/images/blog/peek-cat.png"
                    alt="Peeking Cat"
                    aria-hidden="true"
                    className="peek-cat-img w-full h-auto block select-none"
                  />
                </div>

                {/* Picture Frame */}
                <div
                  className="relative z-10 w-full h-60 sm:h-72 md:h-80 xl:h-[300px] rounded-none bg-[#efe9d9] flex items-center justify-center overflow-hidden"
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
            {/* Left: Category Tabs - Connected Segmented Control matching reference */}
            <div
              className="inline-flex items-stretch rounded-none overflow-hidden"
              style={{
                border: '1.5px solid #000000',
                boxShadow: '4px 4px 0px #000000',
              }}
            >
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-mono font-bold uppercase transition-colors flex items-center gap-2 sm:gap-2.5 cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-[#000000]'
                    : 'text-neutral-800 hover:bg-neutral-50'
                }`}
                style={{
                  backgroundColor: activeTab === 'all' ? '#dcb252' : '#ffffff',
                  borderRight: '1.5px solid #000000',
                }}
              >
                <NewspaperIcon className="w-5 h-5 shrink-0" />
                <span>BLOGS</span>
              </button>

              <button
                onClick={() => setActiveTab('observations')}
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-mono font-bold uppercase transition-colors flex items-center gap-2 sm:gap-2.5 cursor-pointer ${
                  activeTab === 'observations'
                    ? 'text-[#000000]'
                    : 'text-neutral-800 hover:bg-neutral-50'
                }`}
                style={{
                  backgroundColor: activeTab === 'observations' ? '#dcb252' : '#ffffff',
                }}
              >
                <PenIcon className="w-5 h-5 shrink-0" />
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
                border: '1.5px solid #000000',
                boxShadow: '4px 4px 0px #000000',
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

              /* Peeking Cat Hover Effect */
              .peek-cat {
                position: absolute;
                width: 200px;
                height: auto;
                left: -6px;
                bottom: calc(100% - 10px);
                z-index: 0;
                pointer-events: none;
                transform: translateY(150px);
                opacity: 1;
                will-change: transform;
                transition: transform 0.5s ease-in;
              }

              .peek-cat-img {
                transform: none;
              }

              .profile-wrap:hover .peek-cat,
              .profile-wrap.is-active .peek-cat {
                transform: translateY(0);
                transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1);
              }

              @media (hover: none) {
                .profile-wrap:hover .peek-cat { transform: translateY(150px); }
                .profile-wrap.is-active .peek-cat {
                  transform: translateY(0);
                  transition: transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1);
                }
              }
            `}</style>
            <AnimatePresence mode="wait">
              {activeTab === 'all' ? (
                <motion.div
                  key="blogs-tab-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full"
                >
                  {blogPosts.length > 0 ? (
                    <div className="blog-cards-grid">
                      {blogPosts.map((post, idx) => (
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
                </motion.div>
              ) : (
                <motion.div
                  key="observations-tab-content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="w-full"
                >
                  <ObservationsGrid
                    observations={observationPosts}
                    onSelectTape={handleSelectTape}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===================== TV PLAYER PORTAL OVERLAY ===================== */}
          {selectedTape && (
            <Suspense fallback={null}>
              <TvPlayer
                post={selectedTape}
                allObservations={observationPosts}
                onClose={handleCloseTape}
                isDirectLink={Boolean(tapeParam && selectedTape.slug === tapeParam)}
              />
            </Suspense>
          )}

          {/* ===================== FOOTER BAR ===================== */}
          <div className="w-full mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-800 font-mono text-xs sm:text-sm border-t border-black/30">
            <span>
              {currentCount} entries published
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
