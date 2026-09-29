import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { posts, isObservation } from '../../content/posts'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

export function Notes() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const articlePosts = posts.filter((p) => !isObservation(p))
  const observationPosts = posts.filter((p) => isObservation(p))
  const totalCount = posts.length

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

          {/* Showcase / Portal Card into Adi's Archive */}
          <motion.div
            variants={fadeUp}
            className="w-full relative overflow-hidden p-6 sm:p-10 md:p-12 transition-all duration-300 select-none"
            style={{
              backgroundColor: '#C7DCB1',
              border: '2px solid #000000',
              boxShadow: '6px 6px 0px #000000',
            }}
          >
            {/* Top Bar inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 sm:pb-8 border-b border-black/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#315CFF] animate-pulse" />
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-900">
                  Adi's Internet Cabinet
                </span>
              </div>
              <div
                className="bg-white px-3 py-1 font-mono text-xs font-bold text-neutral-900 rounded-none"
                style={{
                  border: '1.5px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                {totalCount} entries published
              </div>
            </div>

            {/* Main Content Grid: Description & Button on left, Scrapbook Preview on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-6 sm:pt-8 items-center">
              {/* Left Column: Headline, Description, Category badges, Tactile button */}
              <div className="lg:col-span-7 flex flex-col items-start gap-5 sm:gap-6">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                  I write things down so I don't forget them.
                </h3>

                <p className="text-base sm:text-lg text-neutral-800 leading-relaxed font-sans max-w-xl">
                  This is where I think out loud
                </p>

                {/* Medium Highlights */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 font-mono text-xs text-neutral-900">
                  <span
                    className="bg-white px-3 py-1.5 font-medium rounded-none flex items-center gap-1.5"
                    style={{ border: '1.5px solid #000000' }}
                  >
                    <span>📖</span>
                    <span>{articlePosts.length} Longform Articles</span>
                  </span>
                  <span
                    className="bg-white px-3 py-1.5 font-medium rounded-none flex items-center gap-1.5"
                    style={{ border: '1.5px solid #000000' }}
                  >
                    <span>📼</span>
                    <span>{observationPosts.length} Observation Tapes</span>
                  </span>
                </div>

                {/* Tactile Button */}
                <div className="pt-2 sm:pt-4">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-3 px-6 py-3.5 sm:px-8 sm:py-4 font-mono font-bold text-sm sm:text-base text-neutral-900 bg-[#E3B859] transition-all duration-150 hover:bg-[#d8ab43] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 focus:outline-none select-none cursor-pointer"
                    style={{
                      border: '2px solid #000000',
                      boxShadow: '4px 4px 0px #000000',
                    }}
                  >
                    <span>Open Sesame</span>
                    <span className="text-lg leading-none">→</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Scrapbook Polaroid & Status teaser */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div
                  className="w-full max-w-[340px] bg-white p-5 rounded-none transition-transform duration-300 hover:rotate-0"
                  style={{
                    border: '2px solid #000000',
                    boxShadow: '4px 4px 0px #000000',
                    transform: 'rotate(1.8deg)',
                  }}
                >
                  {/* Photo area */}
                  <div
                    className="relative w-full aspect-square bg-[#FFFFFF] overflow-hidden mb-4"
                    style={{ border: '1.5px solid #000000' }}
                  >
                    <img
                      src="/images/blog/thinking-cat.jpg"
                      alt="Thinking cat doodle"
                      className="w-full h-full object-contain p-2 select-none"
                    />
                  </div>

                  {/* Status pill matching blog */}
                  <div className="space-y-1.5 font-mono text-center">
                    <p className="text-xs font-bold text-neutral-900">
                      Helloowwww :&gt;
                    </p>
                    <div
                      className="inline-block bg-[#FAF8F5] px-3 py-1 font-mono text-[11px] text-neutral-800 rounded-none"
                      style={{ border: '1px solid #000000' }}
                    >
                      status: trying to find a job
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Handwritten Aside */}
          <motion.p
            variants={fadeUp}
            className="mt-8 font-handwritten text-[1.1rem]"
            style={{
              color: 'var(--muted)',
              transform: 'rotate(-0.8deg)',
              display: 'inline-block',
            }}
            aria-hidden="true"
          >
            more thoughts forming daily...
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
