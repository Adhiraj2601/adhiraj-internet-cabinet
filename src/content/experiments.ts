import experimentsData from './experiments.json'

export type ExperimentStatus = 'EXPERIMENT' | 'WIP' | 'IDEA' | 'ABANDONED' | 'PLAYING'

export type Experiment = {
  id: string
  title: string
  description: string
  status: ExperimentStatus
  year: string
  github?: string
  link?: string
}

export const experiments: Experiment[] = experimentsData as Experiment[]
