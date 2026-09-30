import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SectionLabel } from '../ui/SectionLabel'
import { stagger, fadeUp } from '../../lib/animations'

import { scrapItems } from '../../content/scraps'

const aspectRatios: Record<string, string> = {
  tall: '2/3',
  wide: '3/2',
  square: '1/1',
}

export function Scrapbook() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Curated 6 visual scraps for the homepage exhibition room
  const curatedScraps = scrapItems.slice(0, 6)

  return (
    <section
      id="scrapbook"
      ref={ref}
      className="py-20 md:py-28"
      style={{ borderTop: '1px solid var(--border)' }}
      aria-labelledby="scrapbook-heading"
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
              <SectionLabel>05 / Random things</SectionLabel>
              <h2
                id="scrapbook-heading"
                className="mt-3 font-bold leading-none tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
              >
                Visual scraps
              </h2>
            </div>
            <div>
              <p className="text-[0.9rem] text-muted max-w-sm md:text-right">
                drawings, photos, screenshots. things I wanted to keep.
              </p>
            </div>
          </motion.div>

          {/* Scrapbook grid (curated exhibition selection) */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6"
          >
            {curatedScraps.map((item, index) => (
              <motion.figure
                key={item.id}
                variants={fadeUp}
                custom={index}
                className="flex flex-col gap-2 group"
              >
                <Link to="/sketches" className="block overflow-hidden focus:outline-none" title="View in sketchbook gallery">
                  <motion.div
                    className="overflow-hidden relative"
                    style={{
                      aspectRatio: aspectRatios[item.size] || '1/1',
                      background: 'rgba(23,23,23,0.06)',
                      rotate: item.rotation,
                    }}
                    whileHover={{
                      rotate: 0,
                      scale: 1.03,
                      boxShadow: '0 10px 30px rgba(23,23,23,0.12)',
                      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      width={300}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover select-none"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent && !parent.querySelector('.img-fallback')) {
                          const span = document.createElement('span')
                          span.className = 'img-fallback text-[11px] text-muted text-center p-3 font-mono'
                          span.textContent = item.alt.substring(0, 30)
                          parent.appendChild(span)
                        }
                      }}
                    />
                  </motion.div>
                </Link>
                <figcaption
                  className="font-handwritten text-[0.85rem] flex items-center justify-between"
                  style={{ color: 'var(--muted)', paddingLeft: '2px' }}
                >
                  <span className="truncate">{item.note}</span>
                  <span className="text-[0.65rem] font-mono text-muted/60 shrink-0">#{item.id}</span>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>

          {/* Subtle contextual link below */}
          <motion.div
            variants={fadeUp}
            className="mt-12 md:mt-16 pt-6 border-t border-token/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <span className="text-xs font-mono text-muted">
              Curated snapshot • {curatedScraps.length} of {scrapItems.length} scraps
            </span>
            <Link
              to="/sketches"
              className="group inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors"
            >
              <span>View Full Gallery ({scrapItems.length})</span>
              <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
