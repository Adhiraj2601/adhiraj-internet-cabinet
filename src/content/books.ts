import booksData from './books.json'

export type Book = {
  id: string
  title: string
  author: string
  note: string
  status: 'reading' | 'read' | 'want-to-read'
  year?: string
  cover?: string
}

export const books: Book[] = booksData as Book[]
