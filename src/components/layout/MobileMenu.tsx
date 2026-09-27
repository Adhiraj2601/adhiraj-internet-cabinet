import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface MobileMenuProps {
  links: { label: string; href: string }[]
  onClose: () => void
  onLinkClick: (href: string) => void
}

export function MobileMenu({ links, onClose, onLinkClick }: MobileMenuProps) {
  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' as const },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'var(--background)' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          to="/"
          onClick={onClose}
          className="text-sm font-bold tracking-[0.15em] uppercase hover:text-accent transition-colors"
        >
          ADHIRAJ SENGAR
        </Link>
        <button
          onClick={onClose}
          className="text-[0.7rem] font-semibold tracking-[0.15em] text-muted hover:text-foreground transition-colors"
          aria-label="Close menu"
        >
          CLOSE
        </button>
      </div>

      {/* Links */}
      <nav
        className="flex-1 flex flex-col justify-center px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <ul role="list" className="space-y-2">
          {links.map((link, i) => (
            <motion.li
              key={link.href}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.4, delay: i * 0.07 + 0.15, ease: 'easeOut' as const }}
            >
              <a
                href={link.href}
                onClick={(e) => { e.preventDefault(); onLinkClick(link.href) }}
                className="block text-[2.5rem] font-bold tracking-tight leading-tight hover:text-accent transition-colors duration-200 py-2"
                style={{ color: 'var(--foreground)' }}
              >
                {link.label}
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-8 py-8">
        <p className="text-muted text-[0.75rem] tracking-widest">ADHIRAJ SENGAR / 2026</p>
      </div>
    </motion.div>
  )
}
