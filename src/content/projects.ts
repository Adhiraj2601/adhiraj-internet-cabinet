export type Project = {
  id: string
  number: string
  title: string
  slug: string
  category: string
  description: string
  year: string
  image?: string
  github?: string
  live?: string
  tags?: string[]
}

export const projects: Project[] = [
  {
    id: '01',
    number: '01',
    title: 'LoreGraph',
    slug: 'loregraph',
    category: 'World Building',
    description: 'A visual space for connecting ideas, characters and worlds. Built for writers who think in webs, not outlines.',
    year: '2026',
    image: '/images/projects/loregraph.jpg',
    github: 'https://github.com/adhirajsengar/loregraph',
    tags: ['React', 'Graph', 'Creative'],
  },
  {
    id: '02',
    number: '02',
    title: 'PyCasso',
    slug: 'pycasso',
    category: 'Creative Coding',
    description: 'Generative art through code. A Python toolkit for making drawings that look like they had feelings.',
    year: '2025',
    image: '/images/projects/pycasso.jpg',
    github: 'https://github.com/adhirajsengar/pycasso',
    tags: ['Python', 'Generative Art'],
  },
  {
    id: '03',
    number: '03',
    title: 'UNOCHESS',
    slug: 'unochess',
    category: 'Game',
    description: "Chess and UNO had a strange child. The rules make sense once you're playing. Kind of.",
    year: '2025',
    image: '/images/projects/unochess.jpg',
    github: 'https://github.com/adhirajsengar/unochess',
    tags: ['Game Design', 'TypeScript'],
  },
  {
    id: '04',
    number: '04',
    title: 'JS Chess',
    slug: 'js-chess',
    category: 'Game',
    description: 'A chess engine written in JavaScript because I wanted to understand how a computer thinks about chess.',
    year: '2024',
    image: '/images/projects/chess.jpg',
    github: 'https://github.com/adhirajsengar/js-chess',
    tags: ['JavaScript', 'Algorithms'],
  },
  {
    id: '05',
    number: '05',
    title: 'Stock Prediction Model',
    slug: 'stock-prediction',
    category: 'ML / AI',
    description: "Tried to predict the market. Learned a lot about statistics. The market remains unpredictable.",
    year: '2024',
    image: '/images/projects/stocks.jpg',
    github: 'https://github.com/adhirajsengar/stock-predictor',
    tags: ['Python', 'ML', 'Finance'],
  },
  {
    id: '06',
    number: '06',
    title: 'AI Voice Phishing Detection',
    slug: 'voice-phishing',
    category: 'AI / Security',
    description: 'Detecting voice phishing calls using machine learning. Because scammers keep getting smarter.',
    year: '2024',
    image: '/images/projects/vishing.jpg',
    github: 'https://github.com/adhirajsengar/ai-voice-phishing',
    tags: ['ML', 'Audio', 'Security'],
  },
  {
    id: '07',
    number: '07',
    title: 'BloodBridge',
    slug: 'bloodbridge',
    category: 'Utility / Health',
    description: 'Connecting blood donors and recipients. Built this because finding donors should not be this hard.',
    year: '2024',
    image: '/images/projects/bloodbridge.jpg',
    github: 'https://github.com/adhirajsengar/bloodbridge',
    tags: ['React', 'Health', 'Community'],
  },
]
