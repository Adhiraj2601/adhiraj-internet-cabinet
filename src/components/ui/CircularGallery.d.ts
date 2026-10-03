import type React from 'react'

export interface CircularGalleryItem {
  image: string
  text: string
}

export interface CircularGalleryProps {
  items?: CircularGalleryItem[]
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  fontUrl?: string
  scrollSpeed?: number
  scrollEase?: number
  onActiveChange?: (index: number) => void
  className?: string
  style?: React.CSSProperties
}

declare const CircularGallery: React.FC<CircularGalleryProps>
export default CircularGallery
