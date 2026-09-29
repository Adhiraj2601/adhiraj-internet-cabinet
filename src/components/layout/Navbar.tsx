import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { label: 'ABOUT', href: '#about' },
  { label: 'WORK', href: '#work' },
  { label: 'BOOKS', href: '/books' },
  { label: 'SKETCHES', href: '/sketches' },
  { label: 'BLOG', href: '/blog' },
  { label: 'LAB', href: '#lab' },
]

// Ephemeral in-memory target for client-side navigation.
// IMPORTANT: Being an in-memory variable, this is completely wiped on page refresh (F5),
// preventing any unwanted auto-scrolling when reloading the homepage!
let pendingScrollTarget: string | null = null

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

  // Handle section scrolling ONLY when initiated by an in-app click
  useEffect(() => {
    if (!isHome) return

    // 1. Clean any stale history state or hash left from past tab sessions
    if (typeof window !== 'undefined') {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      if (window.history.state?.usr?.scrollTo) {
        const cleanState = { ...window.history.state }
        if (cleanState.usr) delete cleanState.usr.scrollTo
        window.history.replaceState(cleanState, '', window.location.pathname)
      }
    }

    // 2. Consume in-memory scroll target (only set by an active user click in this JS session)
    if (pendingScrollTarget) {
      const targetId = pendingScrollTarget
      pendingScrollTarget = null // Clear immediately!

      const el = document.getElementById(targetId) || document.querySelector(`[id="${targetId}"]`)
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [isHome, location.pathname])

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
    if (href.startsWith('/')) {
      navigate(href)
    } else if (!isHome) {
      // In-app navigation: store target in ephemeral memory and navigate to '/'
      pendingScrollTarget = href.replace(/^#/, '')
      navigate('/')
    } else {
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        // Clear hash from address bar immediately
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    }
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(false)
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
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
