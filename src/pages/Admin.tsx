import { useState, useEffect } from 'react'
import {
  FolderGit2,
  BookOpen,
  Clock,
  FileText,
  FlaskConical,
  Palette,
  Save,
  Plus,
  Trash2,
  Edit3,
  Upload,
  ExternalLink,
  Check,
  AlertCircle,
  ArrowLeft,
  Key,
  LogOut,
  Download,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Initial content imports
import initialProjects from '../content/projects.json'
import initialBooks from '../content/books.json'
import initialScraps from '../content/scraps.json'
import initialCurrently from '../content/currently.json'
import initialPosts from '../content/posts.json'
import initialExperiments from '../content/experiments.json'

import {
  testGitHubToken,
  commitFileToGitHub,
  utf8ToBase64,
  fileToBase64,
} from '../lib/github'
import type { Project } from '../content/projects'
import type { Book } from '../content/books'
import type { ScrapItem } from '../content/scraps'
import type { Post } from '../content/posts'
import type { Experiment } from '../content/experiments'

type Tab = 'projects' | 'books' | 'scraps' | 'currently' | 'notes' | 'lab'

export function Admin() {
  // Token & Authentication
  const [token, setToken] = useState(() => localStorage.getItem('admin_gh_token') || '')
  const [tokenInput, setTokenInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Current active tab
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  // Editable data states
  const [projectsData, setProjectsData] = useState<Project[]>(initialProjects as Project[])
  const [booksData, setBooksData] = useState<Book[]>(initialBooks as Book[])
  const [scrapsData, setScrapsData] = useState<ScrapItem[]>(initialScraps as ScrapItem[])
  const [currentlyData, setCurrentlyData] = useState(initialCurrently)
  const [postsData, setPostsData] = useState<Post[]>(initialPosts as Post[])
  const [experimentsData, setExperimentsData] = useState<Experiment[]>(initialExperiments as Experiment[])

  // Publishing & feedback states
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Item editing modal states
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isNewProject, setIsNewProject] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isNewBook, setIsNewBook] = useState(false)
  const [selectedBookCoverFile, setSelectedBookCoverFile] = useState<File | null>(null)
  const [bookCoverPreviewUrl, setBookCoverPreviewUrl] = useState<string | null>(null)

  const [editingScrap, setEditingScrap] = useState<ScrapItem | null>(null)
  const [isNewScrap, setIsNewScrap] = useState(false)
  const [selectedScrapFile, setSelectedScrapFile] = useState<File | null>(null)
  const [scrapPreviewUrl, setScrapPreviewUrl] = useState<string | null>(null)

  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isNewPost, setIsNewPost] = useState(false)
  const [selectedPostImageFile, setSelectedPostImageFile] = useState<File | null>(null)
  const [postImagePreviewUrl, setPostImagePreviewUrl] = useState<string | null>(null)

  // Queued image uploads to publish
  const [queuedImages, setQueuedImages] = useState<{ path: string; file: File; label: string }[]>([])

  // Verify token on mount if stored
  useEffect(() => {
    if (token) {
      setIsVerifying(true)
      testGitHubToken(token).then((res) => {
        setIsVerifying(false)
        if (res.valid && res.user) {
          setAuthenticatedUser(res.user)
        } else {
          setAuthError(res.error || 'Token expired or invalid.')
          setAuthenticatedUser(null)
        }
      })
    }
  }, [token])

  // Handle Token Connection
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!tokenInput.trim()) return

    setIsVerifying(true)
    const res = await testGitHubToken(tokenInput.trim())
    setIsVerifying(false)

    if (res.valid && res.user) {
      localStorage.setItem('admin_gh_token', tokenInput.trim())
      setToken(tokenInput.trim())
      setAuthenticatedUser(res.user)
      setTokenInput('')
    } else {
      setAuthError(res.error || 'Could not connect. Please check token permissions.')
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('admin_gh_token')
    setToken('')
    setAuthenticatedUser(null)
  }

  // Handle Publishing All Current Changes to GitHub
  const handlePublishAll = async () => {
    if (!token) {
      setPublishMessage({ type: 'error', text: 'Please connect with your GitHub token first.' })
      return
    }

    setIsPublishing(true)
    setPublishMessage(null)

    try {
      // 1. Upload any queued images (project screenshots, book covers, visual scraps)
      for (const item of queuedImages) {
        const imageBase64 = await fileToBase64(item.file)
        await commitFileToGitHub(
          token,
          item.path,
          imageBase64,
          `media: upload image for ${item.label}`
        )
      }

      // 2. Commit all active JSON data files
      const updates = [
        {
          path: 'src/content/projects.json',
          data: projectsData,
          msg: 'cms: update projects',
        },
        {
          path: 'src/content/books.json',
          data: booksData,
          msg: 'cms: update reading list',
        },
        {
          path: 'src/content/scraps.json',
          data: scrapsData,
          msg: 'cms: update visual scraps / sketches',
        },
        {
          path: 'src/content/currently.json',
          data: currentlyData,
          msg: 'cms: update currently section',
        },
        {
          path: 'src/content/posts.json',
          data: postsData,
          msg: 'cms: update journal notes',
        },
        {
          path: 'src/content/experiments.json',
          data: experimentsData,
          msg: 'cms: update lab experiments',
        },
      ]

      let lastCommitUrl = ''

      for (const item of updates) {
        const jsonString = JSON.stringify(item.data, null, 2)
        const base64 = utf8ToBase64(jsonString)
        const res = await commitFileToGitHub(token, item.path, base64, item.msg)
        if (!res.success) {
          throw new Error(res.message)
        }
        if (res.commitUrl) {
          lastCommitUrl = res.commitUrl
        }
      }

      setHasChanges(false)
      setSelectedImageFile(null)
      setSelectedBookCoverFile(null)
      setSelectedScrapFile(null)
      setScrapPreviewUrl(null)
      setSelectedPostImageFile(null)
      setPostImagePreviewUrl(null)
      setQueuedImages([])
      setPublishMessage({
        type: 'success',
        text: 'Published successfully! Vercel is now deploying your updates (~30s).',
        url: lastCommitUrl,
      })
    } catch (err: unknown) {
      setPublishMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Publishing failed. Please check token permissions.',
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Backup download
  const handleDownloadBackup = () => {
    const backup = {
      projects: projectsData,
      books: booksData,
      scraps: scrapsData,
      currently: currentlyData,
      posts: postsData,
      experiments: experimentsData,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-content-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Project item handlers
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    let updatedProjects: Project[]

    let imagePath = editingProject.image
    if (selectedImageFile) {
      imagePath = `/images/projects/${selectedImageFile.name}`
      setQueuedImages((prev) => [
        ...prev.filter((img) => img.path !== `public/images/projects/${selectedImageFile.name}`),
        {
          path: `public/images/projects/${selectedImageFile.name}`,
          file: selectedImageFile,
          label: editingProject.title,
        },
      ])
    }

    const projectToSave: Project = {
      ...editingProject,
      image: imagePath,
    }

    if (isNewProject) {
      updatedProjects = [...projectsData, projectToSave]
    } else {
      updatedProjects = projectsData.map((p) => (p.id === projectToSave.id ? projectToSave : p))
    }

    setProjectsData(updatedProjects)
    setHasChanges(true)
    setEditingProject(null)
    setIsNewProject(false)
  }

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjectsData(projectsData.filter((p) => p.id !== id))
      setHasChanges(true)
    }
  }

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= projectsData.length) return
    const updated = [...projectsData]
    const temp = updated[index]
    updated[index] = updated[newIdx]
    updated[newIdx] = temp
    setProjectsData(updated)
    setHasChanges(true)
  }

  // Books item handlers
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBook) return

    let coverPath = editingBook.cover
    if (selectedBookCoverFile) {
      coverPath = `/images/books/${selectedBookCoverFile.name}`
      setQueuedImages((prev) => [
        ...prev.filter((img) => img.path !== `public/images/books/${selectedBookCoverFile.name}`),
        {
          path: `public/images/books/${selectedBookCoverFile.name}`,
          file: selectedBookCoverFile,
          label: editingBook.title,
        },
      ])
    }

    const bookToSave: Book = {
      ...editingBook,
      cover: coverPath,
    }

    let updated: Book[]
    if (isNewBook) {
      updated = [...booksData, bookToSave]
    } else {
      updated = booksData.map((b) => (b.id === bookToSave.id ? bookToSave : b))
    }
    setBooksData(updated)
    setHasChanges(true)
    setEditingBook(null)
    setIsNewBook(false)
    setSelectedBookCoverFile(null)
    setBookCoverPreviewUrl(null)
  }

  const handleDeleteBook = (id: string) => {
    if (window.confirm('Delete this book?')) {
      setBooksData(booksData.filter((b) => b.id !== id))
      setHasChanges(true)
    }
  }

  // Visual Scraps / Sketches Handlers
  const handleSaveScrap = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScrap) return

    let scrapSrc = editingScrap.src
    if (selectedScrapFile) {
      scrapSrc = `/images/scrapbook/${selectedScrapFile.name}`
      setQueuedImages((prev) => [
        ...prev.filter((img) => img.path !== `public/images/scrapbook/${selectedScrapFile.name}`),
        {
          path: `public/images/scrapbook/${selectedScrapFile.name}`,
          file: selectedScrapFile,
          label: editingScrap.note || editingScrap.alt || selectedScrapFile.name,
        },
      ])
    }

    const scrapToSave: ScrapItem = {
      ...editingScrap,
      src: scrapSrc,
    }

    let updated: ScrapItem[]
    if (isNewScrap) {
      updated = [...scrapsData, scrapToSave]
    } else {
      updated = scrapsData.map((s) => (s.id === scrapToSave.id ? scrapToSave : s))
    }
    setScrapsData(updated)
    setHasChanges(true)
    setEditingScrap(null)
    setIsNewScrap(false)
    setSelectedScrapFile(null)
    setScrapPreviewUrl(null)
  }

  const handleDeleteScrap = (id: string) => {
    if (window.confirm('Delete this visual scrap / sketch?')) {
      setScrapsData(scrapsData.filter((s) => s.id !== id))
      setHasChanges(true)
    }
  }

  // Blog / Notes Handlers
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost) return

    let postImg = editingPost.image || ''
    if (selectedPostImageFile) {
      postImg = `/images/blog/${selectedPostImageFile.name}`
      setQueuedImages((prev) => [
        ...prev.filter((img) => img.path !== `public/images/blog/${selectedPostImageFile.name}`),
        {
          path: `public/images/blog/${selectedPostImageFile.name}`,
          file: selectedPostImageFile,
          label: editingPost.title || selectedPostImageFile.name,
        },
      ])
    }

    const postToSave: Post = {
      ...editingPost,
      image: postImg || undefined,
    }

    let updated: Post[]
    if (isNewPost) {
      updated = [postToSave, ...postsData]
    } else {
      updated = postsData.map((p) => (p.id === postToSave.id ? postToSave : p))
    }

    setPostsData(updated)
    setHasChanges(true)
    setEditingPost(null)
    setIsNewPost(false)
    setSelectedPostImageFile(null)
    setPostImagePreviewUrl(null)
  }

  const handleDeletePost = (id: string) => {
    if (window.confirm('Delete this blog post?')) {
      setPostsData(postsData.filter((p) => p.id !== id))
      setHasChanges(true)
    }
  }

  // Currently Section Tag Handlers
  const handleAddCurrentlyItem = (label: string, newItem: string) => {
    if (!newItem.trim()) return
    const updated = currentlyData.map((col) => {
      if (col.label === label) {
        return { ...col, items: [...col.items, newItem.trim()] }
      }
      return col
    })
    setCurrentlyData(updated)
    setHasChanges(true)
  }

  const handleRemoveCurrentlyItem = (label: string, itemIdx: number) => {
    const updated = currentlyData.map((col) => {
      if (col.label === label) {
        return { ...col, items: col.items.filter((_, idx) => idx !== itemIdx) }
      }
      return col
    })
    setCurrentlyData(updated)
    setHasChanges(true)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24">
      {/* Top Navbar */}
      <header className="border-b border-token bg-[rgba(244,241,234,0.9)] backdrop-blur-md sticky top-0 z-40">
        <div className="container-main py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              <span>View Site</span>
            </Link>
            <div className="h-4 w-px bg-token" />
            <h1 className="text-sm font-bold tracking-widest uppercase">
              Admin Cabinet
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {authenticatedUser ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  @{authenticatedUser}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 text-xs text-muted hover:text-red-600 transition-colors p-1"
                  title="Disconnect token"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300">
                Not Connected
              </span>
            )}

            <button
              onClick={handleDownloadBackup}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-token hover:bg-neutral-100 rounded transition-colors"
              title="Download backup JSON"
            >
              <Download size={13} />
              <span>Backup</span>
            </button>

            <button
              onClick={handlePublishAll}
              disabled={isPublishing || !authenticatedUser}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-foreground text-background hover:opacity-90 disabled:opacity-50 rounded transition-all shadow-xs"
            >
              {isPublishing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Publish to GitHub</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container-main pt-8">
        {/* Banner notification */}
        {publishMessage && (
          <div
            className={`mb-6 p-4 rounded-sm flex items-start justify-between gap-3 border ${
              publishMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {publishMessage.type === 'success' ? (
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">{publishMessage.text}</p>
                {publishMessage.url && (
                  <a
                    href={publishMessage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline font-mono mt-1 text-emerald-700 hover:text-emerald-900"
                  >
                    <span>View commit on GitHub</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => setPublishMessage(null)}
              className="text-xs text-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}

        {/* GitHub Connection Banner if not authenticated */}
        {!authenticatedUser && (
          <div className="mb-8 p-6 bg-[rgba(23,23,23,0.03)] border border-token rounded-sm">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2 text-foreground font-bold text-sm tracking-wide">
                <Key size={16} className="text-accent" />
                <span>Connect with GitHub to Publish Directly</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                To save and publish your project changes straight to your live Vercel site, connect using a GitHub Personal Access Token with <code>repo</code> scope. Your token is stored only in your browser's private local storage.
              </p>

              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  placeholder="Paste GitHub Token (ghp_...)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-xs hover:opacity-90 disabled:opacity-50"
                >
                  {isVerifying ? 'Checking...' : 'Connect'}
                </button>
              </form>

              {authError && <p className="text-xs text-red-600 mt-2">{authError}</p>}

              <div className="mt-3">
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Adhiraj+Internet+Cabinet+Admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
                >
                  <span>Generate a new GitHub Token (Pre-configured with repo access)</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-token mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'projects'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <FolderGit2 size={15} />
            <span>Projects ({projectsData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'books'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <BookOpen size={15} />
            <span>Books ({booksData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scraps')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'scraps'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Palette size={15} />
            <span>Visual Scraps ({scrapsData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('currently')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'currently'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Clock size={15} />
            <span>Currently</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'notes'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <FileText size={15} />
            <span>Blog / Notes ({postsData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'lab'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <FlaskConical size={15} />
            <span>Lab ({experimentsData.length})</span>
          </button>
        </div>

        {/* ===================== TAB 1: PROJECTS ===================== */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Projects (Things I've Made)</h2>
                <p className="text-xs text-muted mt-1">Manage project details, screenshots, and links.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProject({
                    id: String(projectsData.length + 1).padStart(2, '0'),
                    number: String(projectsData.length + 1).padStart(2, '0'),
                    title: '',
                    slug: '',
                    category: '',
                    description: '',
                    year: new Date().getFullYear().toString(),
                    image: '',
                    github: '',
                  })
                  setIsNewProject(true)
                  setSelectedImageFile(null)
                  setImagePreviewUrl(null)
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {projectsData.map((project, index) => (
                <div
                  key={project.id || index}
                  className="p-5 border border-token bg-[rgba(23,23,23,0.015)] rounded-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-12 bg-neutral-100 border border-token rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] text-muted uppercase">No img</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted">{project.number}</span>
                        <h3 className="font-bold text-sm tracking-tight truncate">{project.title}</h3>
                        <span className="text-[10px] uppercase font-semibold text-accent px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded">
                          {project.category}
                        </span>
                        <span className="text-[10px] text-muted">{project.year}</span>
                      </div>
                      <p className="text-xs text-muted truncate mt-1">{project.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => moveProject(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 border border-token hover:bg-neutral-100 rounded-xs disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => moveProject(index, 'down')}
                      disabled={index === projectsData.length - 1}
                      className="p-1.5 border border-token hover:bg-neutral-100 rounded-xs disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(project)
                        setIsNewProject(false)
                        setSelectedImageFile(null)
                        setImagePreviewUrl(project.image || null)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-token hover:bg-neutral-100 rounded-xs"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs"
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Edit Modal */}
            {editingProject && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-[var(--background)] border border-token max-w-xl w-full p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-token mb-5">
                    <h3 className="font-bold text-base">
                      {isNewProject ? 'Add New Project' : `Edit "${editingProject.title}"`}
                    </h3>
                    <button onClick={() => setEditingProject(null)} className="text-muted hover:text-foreground">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={editingProject.title}
                          onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category</label>
                        <input
                          type="text"
                          required
                          value={editingProject.category}
                          onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="e.g. World Building / Creative Coding"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Year</label>
                        <input
                          type="text"
                          required
                          value={editingProject.year}
                          onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="2026"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Number / ID</label>
                        <input
                          type="text"
                          value={editingProject.number}
                          onChange={(e) => setEditingProject({ ...editingProject, number: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent leading-relaxed"
                        placeholder="Write a clear, personal description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">GitHub Link</label>
                        <input
                          type="url"
                          value={editingProject.github || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Live Demo URL (optional)</label>
                        <input
                          type="url"
                          value={editingProject.live || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, live: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Screenshot Uploader */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Project Screenshot</label>
                      <div className="border border-dashed border-token p-4 rounded-xs bg-[rgba(23,23,23,0.015)] text-center">
                        {imagePreviewUrl ? (
                          <div className="mb-3">
                            <img
                              src={imagePreviewUrl}
                              alt="Preview"
                              className="max-h-40 mx-auto object-contain rounded-xs border border-token"
                            />
                            <p className="text-[10px] text-muted mt-1 font-mono">{editingProject.image || selectedImageFile?.name}</p>
                          </div>
                        ) : (
                          <Upload size={24} className="mx-auto text-muted mb-2" />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          id="project-image-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedImageFile(file)
                              setImagePreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                        <label
                          htmlFor="project-image-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-token bg-background hover:bg-neutral-100 rounded-xs cursor-pointer"
                        >
                          <Upload size={12} />
                          <span>{imagePreviewUrl ? 'Change Image' : 'Choose Image File'}</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-token">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-4 py-2 text-xs font-semibold border border-token hover:bg-neutral-100 rounded-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
                      >
                        Save Project
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: BOOKS ===================== */}
        {activeTab === 'books' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Reading List</h2>
                <p className="text-xs text-muted mt-1">Manage books you're reading, have read, or personal thoughts.</p>
              </div>
              <button
                onClick={() => {
                  setEditingBook({
                    id: String(booksData.length + 1).padStart(2, '0'),
                    title: '',
                    author: '',
                    note: '',
                    status: 'reading',
                    cover: '',
                  })
                  setIsNewBook(true)
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
              >
                <Plus size={14} />
                <span>Add Book</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booksData.map((book) => (
                <div key={book.id} className="p-4 border border-token rounded-sm flex items-start justify-between gap-4 bg-[rgba(23,23,23,0.015)] hover:border-foreground/30 transition-colors">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Book Cover Thumbnail */}
                    <div className="w-12 h-16 bg-neutral-100 border border-token rounded-xs overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[8px] text-muted uppercase text-center px-1">No cover</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm truncate">{book.title}</h3>
                        <span className="text-[10px] uppercase font-bold text-muted">by {book.author}</span>
                      </div>
                      <span
                        className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                          book.status === 'reading'
                            ? 'bg-blue-100 text-accent border border-blue-200'
                            : 'bg-neutral-100 text-muted'
                        }`}
                      >
                        {book.status}
                      </span>
                      {book.note && (
                        <p className="font-handwritten text-sm text-muted mt-2 truncate">"{book.note}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingBook(book)
                        setIsNewBook(false)
                        setSelectedBookCoverFile(null)
                        setBookCoverPreviewUrl(book.cover || null)
                      }}
                      className="p-1.5 border border-token hover:bg-neutral-100 rounded-xs text-muted hover:text-foreground"
                      title="Edit Book"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs"
                      title="Delete Book"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Book Modal */}
            {editingBook && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-[var(--background)] border border-token max-w-md w-full p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-base mb-4">
                    {isNewBook ? 'Add New Book' : `Edit "${editingBook.title}"`}
                  </h3>
                  <form onSubmit={handleSaveBook} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Book Title</label>
                      <input
                        type="text"
                        required
                        value={editingBook.title}
                        onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Author</label>
                      <input
                        type="text"
                        required
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={editingBook.status}
                        onChange={(e) => setEditingBook({ ...editingBook, status: e.target.value as 'reading' | 'read' | 'want-to-read' })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                      >
                        <option value="reading">Currently Reading (→)</option>
                        <option value="read">Finished / Read (✓)</option>
                        <option value="want-to-read">Want to Read (○)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Personal Note / One-liner</label>
                      <input
                        type="text"
                        value={editingBook.note}
                        onChange={(e) => setEditingBook({ ...editingBook, note: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent font-handwritten text-base"
                        placeholder="short personal thought..."
                      />
                    </div>

                    {/* Book Cover Image Uploader */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Book Cover Image</label>
                      <div className="border border-dashed border-token p-4 rounded-xs bg-[rgba(23,23,23,0.015)] text-center">
                        {bookCoverPreviewUrl ? (
                          <div className="mb-3">
                            <img
                              src={bookCoverPreviewUrl}
                              alt="Book cover preview"
                              className="max-h-36 mx-auto object-contain rounded-xs border border-token shadow-xs"
                            />
                            <p className="text-[10px] text-muted mt-1 font-mono">
                              {editingBook.cover || selectedBookCoverFile?.name}
                            </p>
                          </div>
                        ) : (
                          <Upload size={24} className="mx-auto text-muted mb-2" />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          id="book-cover-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedBookCoverFile(file)
                              setBookCoverPreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                        <label
                          htmlFor="book-cover-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-token bg-background hover:bg-neutral-100 rounded-xs cursor-pointer"
                        >
                          <Upload size={12} />
                          <span>{bookCoverPreviewUrl ? 'Change Cover' : 'Choose Cover Image'}</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-token">
                      <button
                        type="button"
                        onClick={() => setEditingBook(null)}
                        className="px-4 py-2 text-xs border border-token rounded-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold bg-foreground text-background rounded-xs"
                      >
                        Save Book
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: VISUAL SCRAPS / SKETCHES ===================== */}
        {activeTab === 'scraps' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Visual Scraps & Sketches</h2>
                <p className="text-xs text-muted mt-1">
                  Upload sketches, photos, and doodles displayed in "05 / Random things — Visual scraps".
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingScrap({
                    id: String(scrapsData.length + 1).padStart(2, '0'),
                    src: '',
                    alt: '',
                    rotation: 0,
                    size: 'square',
                    note: '',
                  })
                  setIsNewScrap(true)
                  setSelectedScrapFile(null)
                  setScrapPreviewUrl(null)
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
              >
                <Plus size={14} />
                <span>Add Scrap / Sketch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scrapsData.map((scrap) => {
                const ratio = scrap.size === 'tall' ? '2/3' : scrap.size === 'wide' ? '3/2' : '1/1'
                return (
                  <div
                    key={scrap.id}
                    className="p-4 border border-token rounded-sm flex flex-col justify-between bg-[rgba(23,23,23,0.015)] hover:border-foreground/30 transition-colors"
                  >
                    <div>
                      {/* Image Preview Box with rotation and ratio */}
                      <div className="relative mb-3 bg-neutral-100/70 border border-token/60 rounded-xs overflow-hidden flex items-center justify-center p-3">
                        <div
                          className="w-full overflow-hidden bg-neutral-200/80 shadow-xs flex items-center justify-center transition-transform duration-300 hover:rotate-0"
                          style={{
                            aspectRatio: ratio,
                            transform: `rotate(${scrap.rotation || 0}deg)`,
                          }}
                        >
                          {scrap.src ? (
                            <img
                              src={scrap.src}
                              alt={scrap.alt}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent && !parent.querySelector('.img-fallback')) {
                                  const span = document.createElement('span')
                                  span.className = 'img-fallback text-[11px] text-muted text-center p-2'
                                  span.textContent = scrap.alt || 'Image not found'
                                  parent.appendChild(span)
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xs text-muted font-mono">No image</span>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-background/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-token">
                            {scrap.size}
                          </span>
                          <span className="text-[9px] font-mono text-muted bg-background/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-token">
                            {scrap.rotation > 0 ? `+${scrap.rotation}°` : `${scrap.rotation}°`}
                          </span>
                        </div>
                      </div>

                      {/* Handwritten Note */}
                      <div className="space-y-1">
                        <p className="font-handwritten text-lg text-foreground leading-tight">
                          "{scrap.note || 'Untitled scrap'}"
                        </p>
                        <p className="text-[11px] text-muted line-clamp-2">
                          {scrap.alt || 'No alt description'}
                        </p>
                        <p className="text-[10px] font-mono text-muted/70 truncate">
                          {scrap.src || 'No image source'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-token">
                      <span className="text-[10px] font-mono font-bold text-muted">#{scrap.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingScrap(scrap)
                            setIsNewScrap(false)
                            setSelectedScrapFile(null)
                            setScrapPreviewUrl(scrap.src || null)
                          }}
                          className="p-1.5 border border-token hover:bg-neutral-100 rounded-xs text-muted hover:text-foreground"
                          title="Edit Scrap"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteScrap(scrap.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs"
                          title="Delete Scrap"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Edit / Add Scrap Modal */}
            {editingScrap && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-[var(--background)] border border-token max-w-lg w-full p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-token mb-4">
                    <h3 className="font-bold text-base">
                      {isNewScrap ? 'Add New Scrap / Sketch' : `Edit Scrap #${editingScrap.id}`}
                    </h3>
                    <button onClick={() => setEditingScrap(null)} className="text-muted hover:text-foreground">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveScrap} className="space-y-4">
                    {/* Image Uploader */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Sketch / Image File
                      </label>
                      <div className="border border-dashed border-token p-4 rounded-xs bg-[rgba(23,23,23,0.015)] text-center">
                        {scrapPreviewUrl ? (
                          <div className="mb-3 flex flex-col items-center">
                            <div
                              className="overflow-hidden max-h-48 max-w-xs border border-token rounded-xs bg-neutral-100 shadow-xs transition-transform"
                              style={{
                                transform: `rotate(${editingScrap.rotation || 0}deg)`,
                              }}
                            >
                              <img
                                src={scrapPreviewUrl}
                                alt="Preview"
                                className="max-h-44 object-contain mx-auto"
                              />
                            </div>
                            <p className="text-[10px] text-muted mt-2 font-mono">
                              {editingScrap.src || selectedScrapFile?.name}
                            </p>
                          </div>
                        ) : (
                          <Upload size={24} className="mx-auto text-muted mb-2" />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          id="scrap-image-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedScrapFile(file)
                              setScrapPreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                        <label
                          htmlFor="scrap-image-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-token bg-background hover:bg-neutral-100 rounded-xs cursor-pointer"
                        >
                          <Upload size={12} />
                          <span>{scrapPreviewUrl ? 'Change Image File' : 'Upload Sketch / Drawing'}</span>
                        </label>
                      </div>
                    </div>

                    {/* Image Source Fallback */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Or Image URL / Path
                      </label>
                      <input
                        type="text"
                        value={editingScrap.src}
                        onChange={(e) => {
                          setEditingScrap({ ...editingScrap, src: e.target.value })
                          if (!selectedScrapFile) {
                            setScrapPreviewUrl(e.target.value || null)
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent font-mono"
                        placeholder="/images/scrapbook/my-sketch.jpg"
                      />
                    </div>

                    {/* Handwritten Note / Caption */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Handwritten Note / Caption
                      </label>
                      <input
                        type="text"
                        required
                        value={editingScrap.note}
                        onChange={(e) => setEditingScrap({ ...editingScrap, note: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-background border border-token rounded-xs focus:outline-accent font-handwritten"
                        placeholder="e.g. robot sketch, march"
                      />
                    </div>

                    {/* Alt Text */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Alt Text & Description
                      </label>
                      <input
                        type="text"
                        required
                        value={editingScrap.alt}
                        onChange={(e) => setEditingScrap({ ...editingScrap, alt: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                        placeholder="e.g. A pencil sketch of a robot with too many arms"
                      />
                    </div>

                    {/* Size / Aspect Ratio & Rotation */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                          Aspect Ratio (Size)
                        </label>
                        <select
                          value={editingScrap.size}
                          onChange={(e) =>
                            setEditingScrap({
                              ...editingScrap,
                              size: e.target.value as 'tall' | 'wide' | 'square',
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                        >
                          <option value="tall">Tall / Portrait (2:3)</option>
                          <option value="wide">Wide / Landscape (3:2)</option>
                          <option value="square">Square (1:1)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider">
                            Rotation Angle
                          </label>
                          <span className="text-xs font-mono font-bold text-accent">
                            {editingScrap.rotation > 0 ? `+${editingScrap.rotation}°` : `${editingScrap.rotation}°`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.5"
                          value={editingScrap.rotation}
                          onChange={(e) =>
                            setEditingScrap({
                              ...editingScrap,
                              rotation: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full accent-foreground cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-token">
                      <button
                        type="button"
                        onClick={() => setEditingScrap(null)}
                        className="px-4 py-2 text-xs border border-token rounded-xs hover:bg-neutral-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
                      >
                        Save Scrap
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: CURRENTLY ===================== */}
        {activeTab === 'currently' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">Currently Section</h2>
              <p className="text-xs text-muted mt-1">Add or remove items in the 4 live interest columns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentlyData.map((col) => (
                <div key={col.label} className="p-5 border border-token rounded-sm bg-[rgba(23,23,23,0.01)] flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">
                    {col.label}
                  </h3>

                  <ul className="space-y-2 mb-4 flex-1">
                    {col.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-xs bg-background px-2.5 py-1.5 border border-token rounded-xs"
                      >
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemoveCurrentlyItem(col.label, idx)}
                          className="text-muted hover:text-red-600 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Add item input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = (e.currentTarget.elements.namedItem('newItem') as HTMLInputElement)
                      if (input && input.value) {
                        handleAddCurrentlyItem(col.label, input.value)
                        input.value = ''
                      }
                    }}
                    className="flex gap-1.5"
                  >
                    <input
                      name="newItem"
                      type="text"
                      placeholder={`Add to ${col.label}...`}
                      className="flex-1 px-2.5 py-1 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-foreground text-background text-xs font-bold rounded-xs hover:opacity-90"
                    >
                      +
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: BLOG POSTS & NOTES ===================== */}
        {activeTab === 'notes' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Blog Posts & Notes</h2>
                <p className="text-xs text-muted mt-1">
                  Create, edit, and publish articles and notes for your /blog page.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNewPost(true)
                  setEditingPost({
                    id: String(Date.now()),
                    number: String(postsData.length + 1).padStart(2, '0'),
                    title: '',
                    slug: '',
                    category: 'Thoughts',
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    excerpt: '',
                    readTime: '3 min read',
                    content: '',
                  })
                  setSelectedPostImageFile(null)
                  setPostImagePreviewUrl(null)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90 transition-opacity shrink-0"
              >
                <Plus size={14} />
                <span>Write New Post</span>
              </button>
            </div>

            {/* Posts Grid / List */}
            {postsData.length === 0 ? (
              <div className="p-12 border border-dashed border-token rounded-sm text-center">
                <FileText size={32} className="mx-auto text-muted mb-3 opacity-60" />
                <h3 className="font-bold text-sm">No blog posts yet</h3>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  Start sharing your thoughts, project write-ups, or notes. Click the button above to write your first entry.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postsData.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-token rounded-sm flex flex-col justify-between bg-[rgba(23,23,23,0.01)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-2xs bg-neutral-200/60 text-foreground">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-muted font-mono">{post.date}</span>
                      </div>

                      <div className="flex gap-3 items-start">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-14 h-14 object-cover rounded-xs border border-token shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm leading-snug line-clamp-1">{post.title}</h3>
                          <p className="text-[11px] text-muted font-mono mt-0.5">/blog/{post.slug}</p>
                          <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                            {post.excerpt || post.content}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-token text-xs">
                      <Link
                        to={`/blog/${post.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground font-medium"
                      >
                        <span>Preview</span>
                        <ExternalLink size={12} />
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsNewPost(false)
                            setEditingPost(post)
                            setSelectedPostImageFile(null)
                            setPostImagePreviewUrl(post.image || null)
                          }}
                          className="p-1.5 border border-token hover:bg-neutral-100 rounded-xs text-muted hover:text-foreground"
                          title="Edit Post"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===================== EDIT/CREATE BLOG POST MODAL ===================== */}
            {editingPost && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-[var(--background)] border border-token max-w-xl w-full p-6 rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-token">
                    <h3 className="font-bold text-base">
                      {isNewPost ? 'Write New Blog Post' : `Edit "${editingPost.title}"`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(null)
                        setIsNewPost(false)
                        setSelectedPostImageFile(null)
                        setPostImagePreviewUrl(null)
                      }}
                      className="text-xs text-muted hover:text-foreground font-mono"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <form onSubmit={handleSavePost} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={editingPost.title}
                        onChange={(e) => {
                          const val = e.target.value
                          const autoSlug = isNewPost
                            ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            : editingPost.slug
                          setEditingPost({
                            ...editingPost,
                            title: val,
                            slug: autoSlug,
                          })
                        }}
                        placeholder="e.g. Why I Built LoreGraph"
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">URL Slug</label>
                        <input
                          type="text"
                          required
                          value={editingPost.slug}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          placeholder="e.g. why-i-built-loregraph"
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category</label>
                        <select
                          value={editingPost.category}
                          onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                        >
                          <option value="Thoughts">Thoughts</option>
                          <option value="Observations">Observations</option>
                          <option value="Projects">Projects</option>
                          <option value="Programming">Programming</option>
                          <option value="Books">Books</option>
                          <option value="Writing">Writing</option>
                          <option value="Learning">Learning</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Date</label>
                        <input
                          type="text"
                          required
                          value={editingPost.date}
                          onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                          placeholder="e.g. 28 Sep 2026"
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Reading Time (optional)</label>
                        <input
                          type="text"
                          value={editingPost.readTime || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                          placeholder="e.g. 4 min read"
                          className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Card Excerpt</label>
                      <textarea
                        rows={2}
                        required
                        value={editingPost.excerpt}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        placeholder="Brief 1-2 sentence overview shown on the blog card..."
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent leading-relaxed"
                      />
                    </div>

                    {/* Thumbnail Image Uploader */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">Thumbnail / Illustration</label>
                      <div className="border border-dashed border-token p-4 rounded-xs bg-[rgba(23,23,23,0.015)] text-center">
                        {postImagePreviewUrl ? (
                          <div className="mb-3">
                            <img
                              src={postImagePreviewUrl}
                              alt="Thumbnail preview"
                              className="max-h-32 mx-auto object-contain rounded-xs border border-token shadow-xs"
                            />
                            <p className="text-[10px] text-muted mt-1 font-mono">
                              {editingPost.image || selectedPostImageFile?.name}
                            </p>
                          </div>
                        ) : (
                          <Upload size={24} className="mx-auto text-muted mb-2" />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          id="post-image-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedPostImageFile(file)
                              setPostImagePreviewUrl(URL.createObjectURL(file))
                            }
                          }}
                        />
                        <label
                          htmlFor="post-image-upload"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-token rounded-xs hover:bg-neutral-100 cursor-pointer"
                        >
                          <Upload size={12} />
                          <span>{postImagePreviewUrl ? 'Change Image' : 'Upload Illustration'}</span>
                        </label>
                        {postImagePreviewUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPostImageFile(null)
                              setPostImagePreviewUrl(null)
                              setEditingPost({ ...editingPost, image: undefined })
                            }}
                            className="block mx-auto mt-2 text-[10px] text-red-600 hover:underline"
                          >
                            Remove image (use default cat doodle)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Full Article Content */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                        Article Content
                      </label>
                      <textarea
                        rows={10}
                        value={editingPost.content || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        placeholder="Write your full note here. Use paragraphs, linebreaks, and ideas..."
                        className="w-full px-3 py-2 text-xs bg-background border border-token rounded-xs focus:outline-accent font-mono leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-token">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPost(null)
                          setIsNewPost(false)
                          setSelectedPostImageFile(null)
                          setPostImagePreviewUrl(null)
                        }}
                        className="px-4 py-2 text-xs font-semibold border border-token rounded-xs hover:bg-neutral-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
                      >
                        Save Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: LAB ===================== */}
        {activeTab === 'lab' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Lab (Experiments)</h2>
                <p className="text-xs text-muted mt-1">Unfinished ideas, playing, and experiments.</p>
              </div>
              <button
                onClick={() => {
                  const newExp = {
                    id: String(experimentsData.length + 1).padStart(2, '0'),
                    title: 'New Experiment',
                    description: 'Description of this experiment...',
                    status: 'WIP' as const,
                    year: new Date().getFullYear().toString(),
                  }
                  setExperimentsData([...experimentsData, newExp])
                  setHasChanges(true)
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-xs hover:opacity-90"
              >
                <Plus size={14} />
                <span>Add Experiment</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experimentsData.map((exp, idx) => (
                <div key={exp.id} className="p-4 border border-token rounded-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase text-accent">{exp.status}</span>
                      <span className="text-[10px] text-muted">{exp.year}</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{exp.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{exp.description}</p>
                  </div>
                  <div className="flex justify-end mt-4 pt-2 border-t border-token">
                    <button
                      onClick={() => {
                        setExperimentsData(experimentsData.filter((_, i) => i !== idx))
                        setHasChanges(true)
                      }}
                      className="text-xs text-muted hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded shadow-2xl flex items-center gap-4 border border-neutral-700 animate-bounce">
          <span className="text-xs font-semibold">You have unsaved changes!</span>
          <button
            onClick={handlePublishAll}
            disabled={isPublishing || !authenticatedUser}
            className="px-3 py-1 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded hover:opacity-90"
          >
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      )}
    </div>
  )
}
