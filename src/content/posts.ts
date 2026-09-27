import postsData from './posts.json'

export type Post = {
  id: string
  number: string
  title: string
  slug: string
  category: string
  date: string
  excerpt: string
  image?: string
  readTime?: string
  content?: string
  tags?: string[]
}

export const posts: Post[] = postsData as Post[]
