import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Post } from '../../content/posts'
import { formatTapeDate, formatTapeNumber } from '../../lib/utils'
import { useTypewriter, type TypewriterSection } from '../../hooks/useTypewriter'

export interface TvScreenHandle {
  skipTyping: () => void
  isDone: boolean
}

interface TvScreenProps {
  post: Post
  allObservations: Post[]
  isPoweredOn: boolean
  isReadMode?: boolean
  onFinishTyping?: () => void
}

interface CommentItem {
  id: string
  name: string
  text: string
  date: string
}

export const TvScreen = forwardRef<TvScreenHandle, TvScreenProps>(function TvScreen(
  { post, allObservations, isPoweredOn, isReadMode = false, onFinishTyping },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const userScrolledRef = useRef(false)

  const tapeNumber = formatTapeNumber(post, allObservations)
  const tapeDate = formatTapeDate(post.date || '')

  // Comments state (in-memory per open session)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')

  // Build typewriter sections
  const sections: TypewriterSection[] = useMemo(() => {
    const list: TypewriterSection[] = []

    const obsText = post.observation || post.content || ''
    if (obsText) {
      list.push({
        id: 'observation',
        label: '[ observation ]',
        text: obsText,
      })
    }

    if (post.question) {
      list.push({
        id: 'question',
        label: '[ question ]',
        text: post.question,
      })
    }

    if (post.answer) {
      list.push({
        id: 'answer',
        label: '[ answer ]',
        text: post.answer,
      })
    }

    list.push({
      id: 'signature',
      label: '',
      text: post.signature || '— Yuji',
    })

    return list
  }, [post])

  const { typedChars, activeSectionId, isDone, skip } = useTypewriter(sections, {
    speed: 9,
    pauseBetween: 150,
    enabled: isPoweredOn,
    onDone: onFinishTyping,
  })

  useImperativeHandle(ref, () => ({
    skipTyping: skip,
    isDone,
  }))

  // Auto-scroll only when content overflows the visible screen height
  useEffect(() => {
    if (!isPoweredOn || isDone || userScrolledRef.current) return
    const el = containerRef.current
    if (!el) return

    if (el.scrollHeight > el.clientHeight + 10) {
      el.scrollTo({
        top: el.scrollHeight - el.clientHeight,
        behavior: 'smooth',
      })
    }
  }, [typedChars, isPoweredOn, isDone])

  // Detect user manual scroll to pause auto-following
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollHeight - scrollTop - clientHeight > 30) {
        userScrolledRef.current = true
      }
    }
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const newComment: CommentItem = {
      id: Date.now().toString(),
      name: commentName.trim() || 'Anonymous',
      text: commentText.trim(),
      date: 'Just now',
    }

    setComments((prev) => [...prev, newComment])
    setCommentName('')
    setCommentText('')
  }

  // Full accessible text for screen readers
  const fullAccessibleText = `${post.title}. Observation: ${post.observation || post.content || ''}. ${
    post.question ? `Question: ${post.question}. ` : ''
  }${post.answer ? `Answer: ${post.answer}. ` : ''}${post.signature || '— Yuji'}`

  return (
    <div
      className="tv-screen-container relative w-full h-full font-mono select-text transition-all duration-300"
      onClick={() => {
        if (!isDone) {
          skip()
        }
      }}
    >
      {/* Tilted Box Background Layer: maintains the slight tilt & shadow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-none overflow-hidden"
        style={{
          backgroundColor: '#1F3A0D',
          border: '2px solid #000000',
          boxShadow: isReadMode ? '6px 6px 0px #000000' : '2px 2px 0px #000000',
          transform: 'rotate(-1.2deg) skewX(-1deg)',
          transformOrigin: 'center center',
          zIndex: 0,
        }}
      >
        {/* CRT Vignette shadow */}
        <div className="crt-vignette absolute inset-0 z-10 pointer-events-none rounded-none" />

        {/* CRT Scanlines Overlay */}
        <div className="crt-screen-overlay absolute inset-0 z-10 pointer-events-none rounded-none" />

        {/* CRT Power-on Flash Effect */}
        {isPoweredOn && (
          <div
            className="crt-flash-effect absolute inset-0 z-20 pointer-events-none rounded-none"
            style={{ backgroundColor: '#C8D4B5' }}
          />
        )}
      </div>

      {/* Straight Text & Terminal Content Container (no rotation/skew, perfectly horizontal) */}
      <div
        className={`relative z-10 w-full h-full flex flex-col overflow-hidden text-left ${
          isReadMode ? 'p-6 sm:p-10' : 'p-3.5 sm:p-5'
        }`}
        style={{
          color: '#B5D89A',
        }}
      >
        {/* Screen reader text */}
        <span className="sr-only">{fullAccessibleText}</span>

        {/* PINNED FIXED HEADER: Play line & Title never scroll away! */}
        {isPoweredOn && (
        <div className="shrink-0 pb-2.5 mb-2 border-b border-[#2D5413]/80 select-none z-10 space-y-1">
          {/* Header: ▶ PLAY · TAPE ### · DD MON YYYY */}
          <div className="text-[11px] sm:text-[13px] tracking-wider text-[#6F9A55] font-bold flex items-center gap-2">
            <span className="text-[#A4DB7B]">▶ PLAY</span>
            <span>·</span>
            <span>TAPE {tapeNumber.replace('No.', '')}</span>
            <span>·</span>
            <span>{tapeDate}</span>
          </div>

          {/* Title in UPPERCASE */}
          <h2 className="text-[18px] sm:text-[22px] md:text-[25px] font-bold uppercase tracking-tight text-[#D5F5BA] leading-tight">
            {post.title}
          </h2>
        </div>
      )}

      {/* SCROLLABLE TERMINAL CONTENT WINDOW */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        aria-hidden="true"
        className="flex-1 overflow-y-auto no-scrollbar relative z-10 space-y-4 crt-text-glow pr-2"
        style={{
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {isPoweredOn && (
          <>
            {/* Sections Typed in Order */}
            <div className="space-y-4 pt-1">
              {sections.map((sec) => {
                const charsVisible = typedChars[sec.id] || 0
                const isStarted = charsVisible > 0 || activeSectionId === sec.id
                const isCurrent = activeSectionId === sec.id

                if (!isStarted && !isDone) return null

                const visibleSubstring = isDone ? sec.text : sec.text.slice(0, charsVisible)

                return (
                  <div key={sec.id} className="space-y-1">
                    {sec.label && (
                      <div className="text-[12px] sm:text-[13px] text-[#6F9A55] font-semibold tracking-wider">
                        {sec.label}
                      </div>
                    )}
                    <div className="text-[14px] sm:text-[16px] md:text-[17px] leading-[1.6] text-[#B5D89A] whitespace-pre-wrap">
                      {sec.id === 'signature' ? (
                        <div className="pt-2 font-bold text-[#D5F5BA]">
                          {visibleSubstring}
                          {isCurrent && <span className="crt-cursor">█</span>}
                        </div>
                      ) : (
                        <span>
                          {visibleSubstring}
                          {isCurrent && <span className="crt-cursor">█</span>}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Blinking cursor after signature when all typing is done */}
              {isDone && (
                <div className="pt-1">
                  <span className="crt-cursor text-[18px]">█</span>
                </div>
              )}
            </div>

            {/* Interactive Comments Block (Fades in after typing is finished) */}
            <AnimatePresence>
              {isDone && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="mt-8 pt-6 border-t border-[#2D5413] space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-[#D5F5BA] tracking-wide">
                    Comments ({comments.length})
                  </h3>

                  <form onSubmit={handlePostComment} className="space-y-3">
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Your name"
                      className="comment-input w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent border border-[#3E6D1F] text-[#B5D89A] placeholder-[#5A8738] rounded-none focus:outline-none focus-visible:outline-none focus:border-[#B5D89A]"
                      style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Say something..."
                      className="comment-input w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent border border-[#3E6D1F] text-[#B5D89A] placeholder-[#5A8738] rounded-none focus:outline-none focus-visible:outline-none focus:border-[#B5D89A] leading-relaxed"
                      style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs sm:text-sm font-bold uppercase rounded-none transition-transform hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer focus:outline-none focus-visible:outline-none"
                      style={{
                        backgroundColor: '#A9CB8B',
                        color: '#10200A',
                        border: '1.5px solid #000000',
                        boxShadow: '2px 2px 0px #000000',
                        outline: 'none',
                      }}
                    >
                      Post
                    </button>
                  </form>

                  {/* List of comments or empty state */}
                  <div className="space-y-3 pt-2">
                    {comments.length === 0 ? (
                      <p className="text-xs sm:text-sm text-[#5A8738] italic">
                        No comments yet. Be the first.
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-2.5 bg-[#172D0A] border border-[#2D5413] rounded-none space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#6F9A55]">
                            <span className="font-bold text-[#B5D89A]">{c.name}</span>
                            <span>{c.date}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#D5F5BA] whitespace-pre-wrap">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  </div>
  )
})
