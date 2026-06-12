import type { Project, ProjectSummary, ProjectDetail } from './project.entity'

export type CreateProjectInput = {
  title: string
  subtitle?: string
  description?: string
}

export type UpdateProjectInput = {
  title?: string
  subtitle?: string | null
  description?: string | null
  status?: 'DRAFT' | 'PUBLISHED'
  coverPhotoId?: string | null
}

export type UpdatePinsInput = Array<{
  id: string
  pinned: boolean
  pinOrder: number | null
}>

export interface IProjectRepository {
  findAllPublished(): Promise<ProjectSummary[]>
  findAll(): Promise<ProjectSummary[]>
  findById(id: string): Promise<ProjectDetail | null>
  create(input: CreateProjectInput): Promise<Project>
  update(id: string, input: UpdateProjectInput): Promise<Project>
  delete(id: string): Promise<void>
  updatePins(updates: UpdatePinsInput): Promise<void>
}
