import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function Footer() {
  const navigate = useNavigate()
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSecretTrigger = () => {
    clickCountRef.current += 1
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0
      navigate('/admin')
      return
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 500)
  }

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

          {/* Copyright (no public admin link) */}
          <div className="flex flex-col gap-2 md:items-end select-none">
            <div className="flex items-center gap-3 text-[0.7rem] tracking-widest text-muted">
              <span
                onClick={handleSecretTrigger}
                className="cursor-default"
                title="Adi's Archive"
              >
                © 2026
              </span>
              <span>•</span>
              <span>ADHIRAJ SENGAR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
