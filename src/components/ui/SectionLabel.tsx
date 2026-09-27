interface SectionLabelProps {
  children: string
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`inline-block text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-muted ${className}`}
    >
      {children}
    </span>
  )
}
