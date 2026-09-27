import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import './styles/globals.css'

const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))
const BooksPage = lazy(() => import('./pages/Books').then((m) => ({ default: m.BooksPage })))
const SketchesPage = lazy(() => import('./pages/Sketches').then((m) => ({ default: m.SketchesPage })))
const Blog = lazy(() => import('./pages/Blog').then((m) => ({ default: m.Blog })))
const BlogPost = lazy(() => import('./pages/BlogPost').then((m) => ({ default: m.BlogPost })))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function PageFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <span className="text-xs font-mono text-muted uppercase tracking-widest animate-pulse">
        Loading...
      </span>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isBlogPost = location.pathname.startsWith('/blog/') || location.pathname.startsWith('/notes/')

  if (isAdmin || isBlogPost) {
    return <>{children}</>
  }

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:text-sm focus:font-semibold"
        style={{ background: 'var(--foreground)', color: 'var(--background)' }}
      >
        Skip to main content
      </a>

      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/sketches" element={<SketchesPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/notes/:slug" element={<BlogPost />} />
            {/* Section anchor fallbacks */}
            <Route path="/work" element={<Home />} />
            <Route path="/notes" element={<Home />} />
            <Route path="/lab" element={<Home />} />
            <Route path="/about" element={<Home />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default App
