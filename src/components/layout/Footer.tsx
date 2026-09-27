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

          {/* Links + copyright */}
          <div className="flex flex-col gap-4 md:items-end">
            <nav aria-label="Social links">
              <ul className="flex flex-wrap gap-6" role="list">
                <li>
                  <a
                    href="https://github.com/adhirajsengar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.75rem] font-semibold tracking-widest uppercase text-muted hover:text-foreground transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/in/adhirajsengar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.75rem] font-semibold tracking-widest uppercase text-muted hover:text-foreground transition-colors duration-200"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:adhiraj@example.com"
                    className="text-[0.75rem] font-semibold tracking-widest uppercase text-muted hover:text-foreground transition-colors duration-200"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </nav>
            <p className="text-[0.7rem] tracking-widest text-muted">© 2026</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
