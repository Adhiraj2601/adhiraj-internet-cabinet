import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
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
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel>05 / Random things</SectionLabel>
            <h2
              id="scrapbook-heading"
              className="mt-3 font-bold leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              Visual scraps
            </h2>
            <p className="mt-4 text-[0.9rem] text-muted max-w-sm">
              drawings, photos, screenshots. things I wanted to keep.
            </p>
          </motion.div>

          {/* Scrapbook grid */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
          >
            {scrapItems.map((item, index) => (
              <motion.figure
                key={item.id}
                variants={fadeUp}
                custom={index}
                className="flex flex-col gap-2"
              >
                <motion.div
                  className="overflow-hidden"
                  style={{
                    aspectRatio: aspectRatios[item.size],
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
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.style.display = 'flex'
                        parent.style.alignItems = 'center'
                        parent.style.justifyContent = 'center'
                        const span = document.createElement('span')
                        span.textContent = item.alt.substring(0, 30)
                        span.style.cssText = 'font-size:0.65rem;color:var(--muted);text-align:center;padding:8px;font-family:Manrope,sans-serif'
                        parent.appendChild(span)
                      }
                    }}
                  />
                </motion.div>
                <figcaption
                  className="font-handwritten text-[0.85rem]"
                  style={{ color: 'var(--muted)', paddingLeft: '2px' }}
                >
                  {item.note}
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
