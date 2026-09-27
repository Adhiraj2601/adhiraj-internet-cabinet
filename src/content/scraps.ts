import scrapsData from './scraps.json'

export type ScrapItem = {
  id: string
  src: string
  alt: string
  rotation: number
  size: 'tall' | 'wide' | 'square'
  note: string
}

export const scrapItems: ScrapItem[] = scrapsData as ScrapItem[]
