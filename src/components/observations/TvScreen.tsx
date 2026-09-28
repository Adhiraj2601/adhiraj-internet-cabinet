import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Post } from '../../content/posts'
import { formatTapeDate, formatTapeNumber } from '../../lib/utils'
import { useTypewriter, type TypewriterSection } from '../../hooks/useTypewriter'

export interface TvScreenHandle {
  skipTyping: () => void
}

interface TvScreenProps {
  post: Post
  allObservations: Post[]
  isPoweredOn: boolean
  isReadMode?: boolean
}

interface CommentItem {
  id: string
  name: string
  text: string
  date: string
}

export const TvScreen = forwardRef<TvScreenHandle, TvScreenProps>(function TvScreen(
  { post, allObservations, isPoweredOn, isReadMode = false },
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
    speed: 14,
    pauseBetween: 240,
    enabled: isPoweredOn,
  })

  useImperativeHandle(ref, () => ({
    skipTyping: skip,
  }))

  // Auto-scroll to bottom as text is typed unless user intervened
  useEffect(() => {
    if (!isPoweredOn || isDone || userScrolledRef.current) return
    const el = containerRef.current
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })
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
      className={`relative w-full h-full overflow-hidden rounded-[8px] font-mono select-text transition-all duration-300 ${
        isReadMode ? 'p-6 sm:p-10' : 'p-4 sm:p-6'
      }`}
      style={{
        backgroundColor: '#1F3A0D',
        color: '#B5D89A',
        transform: 'rotate(-1.2deg) skewX(-1deg)',
        transformOrigin: 'center center',
      }}
      onClick={() => {
        if (!isDone) {
          skip()
        }
      }}
    >
      {/* Screen reader text */}
      <span className="sr-only">{fullAccessibleText}</span>

      {/* CRT Vignette shadow */}
      <div className="crt-vignette absolute inset-0 z-20 pointer-events-none rounded-[8px]" />

      {/* CRT Scanlines Overlay */}
      <div className="crt-screen-overlay absolute inset-0 z-20 pointer-events-none rounded-[8px]" />

      {/* CRT Power-on Flash Effect */}
      {isPoweredOn && (
        <div
          className="crt-flash-effect absolute inset-0 z-30 pointer-events-none"
          style={{ backgroundColor: '#C8D4B5' }}
        />
      )}

      {/* Main Terminal Content Window */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        aria-hidden="true"
        className="w-full h-full overflow-y-auto no-scrollbar relative z-10 space-y-4 crt-text-glow pr-2"
        style={{
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {isPoweredOn && (
          <>
            {/* Header: ▶ PLAY · TAPE ### · DD MON YYYY */}
            <div className="text-[12px] sm:text-[13px] tracking-wider text-[#6F9A55] font-bold flex items-center gap-2 select-none border-b border-[#2D5413] pb-2">
              <span className="text-[#A4DB7B]">▶ PLAY</span>
              <span>·</span>
              <span>TAPE {tapeNumber.replace('No.', '')}</span>
              <span>·</span>
              <span>{tapeDate}</span>
            </div>

            {/* Title in UPPERCASE */}
            <h2 className="text-[20px] sm:text-[24px] md:text-[26px] font-bold uppercase tracking-tight text-[#D5F5BA] leading-tight pt-1">
              {post.title}
            </h2>

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
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent border border-[#3E6D1F] text-[#B5D89A] placeholder-[#5A8738] rounded-xs focus:outline-none focus:border-[#B5D89A]"
                    />
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Say something..."
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent border border-[#3E6D1F] text-[#B5D89A] placeholder-[#5A8738] rounded-xs focus:outline-none focus:border-[#B5D89A] leading-relaxed"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs sm:text-sm font-bold uppercase rounded-none transition-transform hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                      style={{
                        backgroundColor: '#A9CB8B',
                        color: '#10200A',
                        border: '1.5px solid #000000',
                        boxShadow: '2px 2px 0px #000000',
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
                        <div key={c.id} className="p-2.5 bg-[#172D0A] border border-[#2D5413] rounded-xs space-y-1">
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
  )
})
