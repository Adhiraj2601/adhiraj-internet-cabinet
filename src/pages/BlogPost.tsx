import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { posts, type Post } from '../content/posts'

const BG_GREEN = '#ADD890' // Bright pastel green page background
const ACCENT_ORANGE = '#e08b58' // Warm orange button accent
const BORDER_DARK = '#1a1a1a' // Dark chunky outlines

interface CommentItem {
  id: string
  name: string
  text: string
  date: string
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  // Press ESC to close and return to /blog
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/blog')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  // Find post by slug or fallback
  const postIndex = useMemo(() => {
    return posts.findIndex((p) => p.slug === slug)
  }, [slug])

  const post: Post | undefined = postIndex !== -1 ? posts[postIndex] : undefined

  // Prev / Next posts
  const prevPost = postIndex > 0 ? posts[postIndex - 1] : null
  const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null

  // Interactive Comments state
  const [comments, setComments] = useState<CommentItem[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment: CommentItem = {
      id: Date.now().toString(),
      name: commentName.trim() || 'Anonymous Reader',
      text: commentText.trim(),
      date: 'Just now',
    }

    setComments((prev) => [...prev, newComment])
    setCommentName('')
    setCommentText('')
  }

  if (!post) {
    return (
      <div
        className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center font-mono"
        style={{ backgroundColor: BG_GREEN }}
      >
        <div
          className="max-w-md w-full p-8 text-center bg-white rounded-sm"
          style={{
            border: `2px solid ${BORDER_DARK}`,
            boxShadow: `4px 4px 0px ${BORDER_DARK}`,
          }}
        >
          <h1 className="text-xl font-bold mb-2">Note Not Found</h1>
          <p className="text-xs text-neutral-600 mb-6">
            The article you're looking for doesn't exist or has moved.
          </p>
          <Link
            to="/blog"
            className="px-4 py-2 font-mono text-xs font-bold uppercase rounded-xs"
            style={{
              backgroundColor: ACCENT_ORANGE,
              border: `2px solid ${BORDER_DARK}`,
              boxShadow: `2px 2px 0px ${BORDER_DARK}`,
            }}
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  // Parse paragraphs from content
  const paragraphs = post.content ? post.content.split('\n\n') : [post.excerpt]

  return (
    <div
      className="min-h-screen pb-24 px-3 sm:px-6 relative"
      style={{
        backgroundColor: BG_GREEN,
      }}
    >
      {/* Floating cat sticker animation & card styling */}
      <style>{`
        @keyframes floatAcross {
          0%   { transform: translate3d(-80px, -50%, 0) rotate(-10deg); }
          25%  { transform: translate3d(25vw, -50%, 0) rotate(8deg); }
          50%  { transform: translate3d(50vw, -50%, 0) rotate(-5deg); }
          75%  { transform: translate3d(75vw, -50%, 0) rotate(8deg); }
          100% { transform: translate3d(calc(100vw + 80px), -50%, 0) rotate(-10deg); }
        }
        .floating-sticker {
          animation: floatAcross 9s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-sticker {
            animation: none !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
        }

        .blog-card-container {
          width: min(72vw, 1200px);
          margin: 80px auto 0;
        }
        .blog-article {
          background-color: #F9F9FB;
          border: 1px solid #1a1a1a;
          box-shadow: 5px 5px 0 #1a1a1a;
          padding: 18px;
        }
        .blog-header {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 28px;
        }
        .blog-cover {
          flex: 0 0 360px;
          width: 360px;
          height: 240px;
          aspect-ratio: 3 / 2;
          overflow: hidden;
          border: 2px solid #1a1a1a;
          box-shadow: 3px 3px 0 #1a1a1a;
        }
        .blog-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 767px) {
          .blog-card-container {
            width: calc(100% - 24px);
            margin: 80px auto 0;
          }
          .blog-article {
            padding: 14px;
          }
          .blog-header {
            flex-direction: column;
            gap: 20px;
          }
          .blog-cover {
            flex: none;
            width: 100%;
            height: auto;
            aspect-ratio: 3 / 2;
          }
        }
      `}</style>

      {/* Floating Top-Left Close Button [ ✕ ] */}
      <div className="fixed top-5 left-5 z-40">
        <button
          onClick={() => navigate('/blog')}
          className="w-8 h-8 rounded-xs font-mono font-bold text-sm bg-white text-[#1a1a1a] flex items-center justify-center hover:bg-neutral-100 transition-transform hover:-translate-y-0.5 cursor-pointer"
          style={{
            border: `2px solid ${BORDER_DARK}`,
            boxShadow: `2px 2px 0px ${BORDER_DARK}`,
          }}
          title="Back to all notes (ESC)"
          aria-label="Back to blog"
        >
          ✕
        </button>
      </div>

      {/* Floating Cat Sticker — slow deterministic left→right loop */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0,
          width: '100%',
          height: 55,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <img
          src="/images/blog/floating-cat.png"
          alt=""
          aria-hidden="true"
          className="floating-sticker select-none"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: 52,
            height: 'auto',
          }}
        />
      </div>

      {/* Main Centered Card Container */}
      <div className="blog-card-container relative">
        {/* Paper Article Canvas */}
        <article className="blog-article rounded-sm">
          {/* Header: Cover image left, Title right */}
          <header className="blog-header pb-0">
            {/* Thumbnail: controlled visual size 360x240 on desktop */}
            <div className="blog-cover rounded-xs">
              <img
                src={post.image || '/images/blog/cat-doodle.jpg'}
                alt={post.title}
                className="select-none"
              />
            </div>

            {/* Title & Date */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h1
                className="font-mono font-light leading-tight text-[#1a1a1a] tracking-normal"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.6rem)' }}
              >
                {post.title}
              </h1>
              <div className="mt-2.5">
                <span className="font-mono text-[13px] text-neutral-800 font-normal">
                  {post.date}
                </span>
              </div>
            </div>
          </header>

          {/* Article Text Content */}
          <div
            className="pt-7 pb-4"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              fontSize: 20,
              lineHeight: 1.6,
              color: '#6b6b6b',
            }}
          >
            {paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="whitespace-pre-line"
                style={{ marginBottom: 40 }}
              >
                {p}
              </p>
            ))}
          </div>

          {/* ===================== PREV / NEXT NAVIGATION ===================== */}
          <div className="py-6 border-t border-b border-[#1a1a1a]/15 flex items-center justify-between text-xs font-mono">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="flex items-center gap-1.5 hover:underline font-bold text-neutral-800"
              >
                <span>←</span>
                <span className="truncate max-w-[160px] sm:max-w-xs">{prevPost.title}</span>
              </Link>
            ) : (
              <span className="text-neutral-400">← First post</span>
            )}

            <Link
              to="/blog"
              className="text-[11px] uppercase tracking-wider text-neutral-600 hover:text-black font-bold"
            >
              All Notes
            </Link>

            {nextPost ? (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="flex items-center gap-1.5 hover:underline font-bold text-neutral-800 text-right"
              >
                <span className="truncate max-w-[160px] sm:max-w-xs">{nextPost.title}</span>
                <span>→</span>
              </Link>
            ) : (
              <span className="text-neutral-400">Latest post →</span>
            )}
          </div>

          {/* ===================== COMMENTS BOX ===================== */}
          <section
            className="mt-8 p-4 rounded-xs bg-[#fbfbfa]"
            style={{ border: `2px solid ${BORDER_DARK}` }}
          >
            <h2 className="font-mono font-bold text-xs text-[#1a1a1a] uppercase tracking-wider mb-3">
              Comments
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full font-mono text-xs px-3 py-1.5 bg-white text-neutral-900 rounded-xs focus:outline-none placeholder:text-neutral-500"
                  style={{ border: `1.5px solid ${BORDER_DARK}` }}
                />
              </div>
              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Say something..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full font-mono text-xs px-3 py-2 bg-white text-neutral-900 rounded-xs focus:outline-none placeholder:text-neutral-500 leading-relaxed"
                  style={{ border: `1.5px solid ${BORDER_DARK}` }}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="px-4 py-1 font-mono font-bold text-xs uppercase text-[#1a1a1a] rounded-xs cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: ACCENT_ORANGE,
                    border: `2px solid ${BORDER_DARK}`,
                    boxShadow: `1px 1px 0px ${BORDER_DARK}`,
                  }}
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments List or Empty message */}
            {comments.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-[#1a1a1a]/10">
                {comments.map((c) => (
                  <div key={c.id} className="text-xs font-mono bg-white p-2.5 rounded-xs border border-neutral-300">
                    <div className="flex items-center justify-between text-neutral-500 text-[10px] mb-1">
                      <span className="font-bold text-neutral-800">{c.name}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="text-neutral-700 leading-snug">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-[11px] text-neutral-500 italic">
                No comments yet. Be the first.
              </p>
            )}
          </section>

          {/* Bottom Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-700 hover:text-black hover:underline"
            >
              <span>← Back to all journal notes</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}
