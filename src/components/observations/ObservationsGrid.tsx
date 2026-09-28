import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { type Post } from '../../content/posts'
import { CassetteCard, RoughenFilterDefs } from './CassetteCard'

interface ObservationsGridProps {
  observations: Post[]
  onSelectTape: (post: Post) => void
}

export function ObservationsGrid({ observations, onSelectTape }: ObservationsGridProps) {
  // Sort newest first based on tape number or date
  const sortedObservations = useMemo(() => {
    return [...observations].sort((a, b) => {
      // 1. Try comparing numeric tape numbers
      const numA = a.number ? parseInt(a.number.replace(/\D/g, ''), 10) : NaN
      const numB = b.number ? parseInt(b.number.replace(/\D/g, ''), 10) : NaN
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA // newest / highest number first
      }

      // 2. Fall back to date comparison
      const timeA = new Date(a.date || '').getTime() || 0
      const timeB = new Date(b.date || '').getTime() || 0
      return timeB - timeA
    })
  }, [observations])

  if (sortedObservations.length === 0) {
    return (
      <div
        className="p-12 text-center rounded-none font-mono"
        style={{
          backgroundColor: '#A8CB8C',
          border: '1.5px solid #000000',
          boxShadow: '2px 2px 0px #000000',
        }}
      >
        <p className="font-bold text-sm text-[#1a1a1a]">
          No observations recorded yet :&gt;
        </p>
        <p className="text-xs text-neutral-700 mt-1">
          Add new observations in the Admin panel to fill your cassette tape deck.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full relative"
    >
      <RoughenFilterDefs />
      <style>{`
        .cassette-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 28px;
          width: 100%;
          justify-content: start;
        }
        @media (min-width: 860px) {
          .cassette-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px;
          }
        }
        @media (min-width: 1200px) {
          .cassette-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 30px;
          }
        }
      `}</style>

      <div className="cassette-grid">
        {sortedObservations.map((post, idx) => (
          <CassetteCard
            key={post.id || post.slug}
            post={post}
            allObservations={sortedObservations}
            index={idx}
            onClick={() => onSelectTape(post)}
          />
        ))}
      </div>
    </motion.div>
  )
}
