import { motion } from 'framer-motion'

interface ArrowProps {
  className?: string
  size?: number
  direction?: 'right' | 'up-right' | 'down'
}

export function Arrow({ className = '', size = 16, direction = 'up-right' }: ArrowProps) {
  const paths: Record<string, string> = {
    'up-right': 'M5 19L19 5M19 5H9M19 5V15',
    right: 'M5 12H19M19 12L13 6M19 12L13 18',
    down: 'M12 5V19M19 12L12 19L5 12',
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[direction]} />
    </motion.svg>
  )
}
