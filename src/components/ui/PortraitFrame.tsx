import { useState } from 'react';
import { motion } from 'framer-motion';

export function PortraitFrame({ className = '' }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0.9, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex flex-col justify-center w-full max-w-[420px] mx-auto ${className}`.trim()}
    >
      <div className="relative group">
        {/* Handwritten tape note on top */}
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="font-handwritten text-[1.1rem] text-muted rotate-[-2deg] inline-block">
            welcome to my little corner{' '}
          </span>
          <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted font-medium">
            FIG. 01 / ARTIFACT
          </span>
        </div>

        {/* Main Image Frame */}
        <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow: '0 14px 40px rgba(23, 23, 23, 0.08)',
            transition: { duration: 0.3, ease: 'easeOut' },
          }}
          className="overflow-hidden border border-token bg-[rgba(23,23,23,0.02)] p-2 md:p-3"
          style={{
            aspectRatio: '4/3',
            boxShadow: '0 4px 20px rgba(23, 23, 23, 0.04)',
          }}
        >
          {!imgError ? (
            <picture>
              <source
                type="image/avif"
                srcSet="/images/hero-480.avif 480w, /images/hero-800.avif 800w, /images/hero-1200.avif 1200w"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 520px"
              />
              <source
                type="image/webp"
                srcSet="/images/hero-480.webp 480w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 520px"
              />
              <img
                src="/images/hero.webp"
                alt="Adhiraj Sengar"
                width={520}
                height={390}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </picture>
          ) : (
            <div className="w-full h-full border border-dashed border-token flex flex-col items-center justify-center p-6 text-center transition-colors group-hover:border-[rgba(23,23,23,0.35)]">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted mb-3 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 9v6M9 12h6" />
              </svg>
              <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-foreground">
                Photo / Portrait
              </p>
              <p className="text-[0.7rem] text-muted font-mono mt-1">
                public/images/hero.jpg
              </p>
              <p className="font-handwritten text-[0.95rem] text-muted mt-2">
                photo, sketch, or artifact
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PortraitFrame;
