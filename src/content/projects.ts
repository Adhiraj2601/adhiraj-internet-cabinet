import projectsData from './projects.json'

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

export const projects: Project[] = projectsData as Project[]
