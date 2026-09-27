import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { posts } from '../../content/posts'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

export function Notes() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

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
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8 md:mb-12">
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
          </motion.div>

          {/* Posts list */}
          <motion.ul variants={stagger} role="list" className="divide-y" style={{ borderTop: '1px solid var(--border)' }}>
            {posts.map((post, i) => (
              <NoteRow key={post.id} post={post} index={i} />
            ))}
          </motion.ul>

          <motion.p
            variants={fadeUp}
            className="mt-10 font-handwritten text-[1.1rem]"
            style={{ color: 'var(--muted)', transform: 'rotate(-0.8deg)', display: 'inline-block' }}
            aria-hidden="true"
          >
            more thoughts forming...
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

function NoteRow({ post, index }: { post: typeof posts[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.li
      variants={fadeUp}
      custom={index}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <a
        href={`/notes/${post.slug}`}
        className="flex items-start md:items-center justify-between gap-4 py-6 group"
        style={{ borderColor: 'var(--border)' }}
        aria-label={`${post.title} — ${post.date}`}
      >
        <div className="flex items-start md:items-center gap-4 md:gap-8 flex-1 min-w-0">
          <span
            className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted shrink-0 mt-1 md:mt-0"
          >
            {post.number}
          </span>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 min-w-0">
            <motion.h3
              className="font-semibold text-[1rem] md:text-[1.1rem] leading-snug"
              animate={{ x: hovered ? 6 : 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {post.title}
            </motion.h3>
            <span className="text-[0.7rem] tracking-widest text-muted uppercase shrink-0">{post.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[0.7rem] tracking-widest text-muted hidden md:block">{post.date}</span>
          <motion.span
            className="text-[0.9rem] text-muted"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        </div>
      </a>
    </motion.li>
  )
}
