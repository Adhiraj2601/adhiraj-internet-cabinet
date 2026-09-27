import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Admin } from './pages/Admin'
import './styles/globals.css'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
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
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/work" element={<Home />} />
          <Route path="/notes" element={<Home />} />
          <Route path="/books" element={<Home />} />
          <Route path="/lab" element={<Home />} />
          <Route path="/about" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
