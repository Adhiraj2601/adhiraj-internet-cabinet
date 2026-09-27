export function Footer() {
  return (
    <footer
      className="py-16 md:py-24"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="container-main">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          {/* Closing line */}
          <div>
            <p
              className="font-handwritten text-[1.8rem] md:text-[2.2rem] leading-tight"
              style={{ color: 'var(--muted)' }}
            >
              that's enough internet for today.
            </p>
            <p className="mt-4 text-[1.6rem] md:text-[2rem] font-bold tracking-tight">ADHIRAJ SENGAR</p>
          </div>

          {/* Copyright & Admin */}
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex items-center gap-3 text-[0.7rem] tracking-widest text-muted">
              <span>© 2026</span>
              <span>•</span>
              <a
                href="/admin"
                className="hover:text-foreground transition-colors"
                title="Manage content via Admin Dashboard"
              >
                Admin ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
