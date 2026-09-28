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
  observation?: string
  question?: string
  answer?: string
  signature?: string
}

export const posts: Post[] = postsData as Post[]

export function isObservation(post: Post): boolean {
  return post.category.toLowerCase().includes('observation')
}

