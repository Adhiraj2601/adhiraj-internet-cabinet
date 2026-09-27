import { useState } from 'react'
import { motion } from 'framer-motion'

interface ImageCardProps {
  src?: string
  alt: string
  rotation?: number
  className?: string
  aspectRatio?: string
  placeholder?: string
}

export function ImageCard({
  src,
  alt,
  rotation = 0,
  className = '',
  aspectRatio = '4/3',
  placeholder = '',
}: ImageCardProps) {
  const [imgError, setImgError] = useState(false)
  const showPlaceholder = !src || imgError

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      style={{
        rotate: rotation,
        aspectRatio,
      }}
      whileHover={{
        rotate: 0,
        scale: 1.03,
        boxShadow: '0 12px 40px rgba(23,23,23,0.12)',
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      }}
      transition={{ duration: 0.3 }}
    >
      {showPlaceholder ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'rgba(23,23,23,0.06)' }}
          aria-label={alt}
        >
          <span className="text-muted text-[0.7rem] tracking-widest uppercase font-medium text-center px-4">
            {placeholder || alt}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
    </motion.div>
  )
}
