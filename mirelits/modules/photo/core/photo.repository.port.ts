import type { Photo } from './photo.entity'

export type CreatePhotoInput = {
  projectId: string
  storagePath: string
  url: string
  position: number
}

export type ReorderPhotosInput = Array<{ id: string; position: number }>

export interface IPhotoRepository {
  findByProject(projectId: string): Promise<Photo[]>
  findById(id: string): Promise<Photo | null>
  create(input: CreatePhotoInput): Promise<Photo>
  reorder(updates: ReorderPhotosInput): Promise<void>
  delete(id: string): Promise<void>
  deleteAllByProject(projectId: string): Promise<void>
}
