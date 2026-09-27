export type Post = {
  id: string
  number: string
  title: string
  slug: string
  category: string
  date: string
  excerpt: string
  image?: string
}

export const posts: Post[] = [
  {
    id: '01',
    number: '01',
    title: 'Why I keep rebuilding my portfolio',
    slug: 'rebuilding-portfolio',
    category: 'Thought',
    date: '14 Sep 2026',
    excerpt: "Every new portfolio is a new idea of who I am. This one might actually stick.",
  },
  {
    id: '02',
    number: '02',
    title: 'Games are strange teachers',
    slug: 'games-as-teachers',
    category: 'Observation',
    date: '02 Aug 2026',
    excerpt: 'Games taught me more about systems thinking than most courses did.',
  },
  {
    id: '03',
    number: '03',
    title: 'What I learned from building LoreGraph',
    slug: 'loregraph-learnings',
    category: 'Build',
    date: '11 Jul 2026',
    excerpt: 'Graph databases, React Flow, and why relationships between things matter more than the things themselves.',
  },
  {
    id: '04',
    number: '04',
    title: 'Things books make me notice',
    slug: 'books-and-noticing',
    category: 'Reading',
    date: '20 Jun 2026',
    excerpt: 'Reading fiction has made me a better debugger. That sentence sounds wrong but I mean it.',
  },
  {
    id: '05',
    number: '05',
    title: 'On starting things I never finish',
    slug: 'starting-not-finishing',
    category: 'Thought',
    date: '03 May 2026',
    excerpt: 'Half the things in my GitHub are abandoned. I think that might be fine.',
  },
]
