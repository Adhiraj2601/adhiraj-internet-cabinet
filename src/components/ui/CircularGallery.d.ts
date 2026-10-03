import type React from 'react'

export interface CircularGalleryItem {
  image: string
  text: string
}

export interface CircularGalleryProps {
  items?: CircularGalleryItem[]
  initialIndex?: number
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  fontUrl?: string
  scrollSpeed?: number
  scrollEase?: number
  offsetY?: number
  autoplay?: 'drift' | 'off'
  speed?: number
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
  onActiveChange?: (index: number) => void
  onDetailsReady?: () => void
  onIntroComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

declare const CircularGallery: React.FC<CircularGalleryProps>
export default CircularGallery
