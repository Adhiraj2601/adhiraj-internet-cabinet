export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(dateStr: string): string {
  return dateStr
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function formatTapeDate(dateStr: string): string {
  if (!dateStr) return '01 JAN 2026'
  const parts = dateStr.trim().split(/[\s,]+/)
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].slice(0, 3).toUpperCase()
    const year = parts[2]
    return `${day} ${month} ${year}`
  }
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0')
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`
  }
  return dateStr.toUpperCase()
}

export function formatTapeNumber(
  post: { number?: string; date?: string; id?: string },
  allObservations?: { number?: string; date?: string; id?: string }[]
): string {
  if (post.number) {
    const num = parseInt(post.number.replace(/\D/g, ''), 10)
    if (!isNaN(num) && num > 0) {
      return `No.${String(num).padStart(3, '0')}`
    }
  }
  if (allObservations && allObservations.length > 0) {
    const sorted = [...allObservations].sort((a, b) => {
      const ta = new Date(a.date || '').getTime() || 0
      const tb = new Date(b.date || '').getTime() || 0
      return ta - tb
    })
    const idx = sorted.findIndex((p) => p.id === post.id)
    if (idx !== -1) {
      return `No.${String(idx + 1).padStart(3, '0')}`
    }
  }
  return 'No.001'
}

