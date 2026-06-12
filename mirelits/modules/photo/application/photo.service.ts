import type { IPhotoRepository, ReorderPhotosInput } from '../core/photo.repository.port'
import type { IPhotoStorage } from '../core/photo.storage.port'

const BUCKET = 'project-photos'

export class PhotoService {
  constructor(
    private readonly repo: IPhotoRepository,
    private readonly storage: IPhotoStorage,
  ) {}

  async upload(projectId: string, file: Buffer, originalName: string): Promise<{ id: string; url: string }> {
    const stem = originalName.replace(/\.[^.]+$/, '')
    const filename = `${projectId}/${Date.now()}-${stem}.webp`
    const { path, url } = await this.storage.upload(file, filename, BUCKET)

    const existing = await this.repo.findByProject(projectId)
    const position = existing.length

    const photo = await this.repo.create({ projectId, storagePath: path, url, position })
    return { id: photo.id, url: photo.url }
  }

  async reorder(projectId: string, updates: ReorderPhotosInput): Promise<void> {
    await this.repo.reorder(updates)
  }

  async delete(photoId: string): Promise<void> {
    const photo = await this.repo.findById(photoId)
    if (!photo) return
    await this.storage.delete(photo.storagePath, BUCKET)
    await this.repo.delete(photoId)
  }

  async deleteByProject(projectId: string): Promise<void> {
    const photos = await this.repo.findByProject(projectId)
    await Promise.all(
      photos.map(p => this.storage.delete(p.storagePath, BUCKET).catch(() => {}))
    )
    await this.repo.deleteAllByProject(projectId)
  }
}
