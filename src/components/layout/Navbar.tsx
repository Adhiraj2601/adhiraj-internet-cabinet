import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { label: 'ABOUT', href: '#about' },
  { label: 'WORK', href: '#work' },
  { label: 'NOTES', href: '#notes' },
  { label: 'BOOKS', href: '#books' },
  { label: 'LAB', href: '#lab' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle hash scrolling when arriving at home with a hash (e.g. /#work)
  useEffect(() => {
    if (isHome && location.hash) {
      const target = document.querySelector(location.hash)
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    }
  }, [isHome, location.hash])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    if (!isHome) {
      navigate('/' + href)
    } else {
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          background: scrolled ? 'rgba(244,241,234,0.88)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        }}
      >
        <div className="container-main">
          <nav
            className="flex items-center justify-between py-5"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link
              to="/"
              onClick={handleLogoClick}
              className="text-sm font-bold tracking-[0.15em] uppercase hover:text-accent transition-colors duration-200"
              aria-label="ADHIRAJ SENGAR — go to top"
            >
              ADHIRAJ SENGAR
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-8" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
                    className="text-[0.7rem] font-semibold tracking-[0.15em] text-muted hover:text-foreground transition-colors duration-200"
                    style={{ color: 'var(--muted)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-[0.7rem] font-semibold tracking-[0.15em] text-muted hover:text-foreground transition-colors duration-200"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              MENU
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            links={navLinks}
            onClose={() => setMenuOpen(false)}
            onLinkClick={handleNavClick}
          />
        )}
      </AnimatePresence>
    </>
  )
}
