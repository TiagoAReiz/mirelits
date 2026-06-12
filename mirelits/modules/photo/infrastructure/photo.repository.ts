import type { IPhotoRepository, CreatePhotoInput, ReorderPhotosInput } from '../core/photo.repository.port'
import type { Photo } from '../core/photo.entity'
import { prisma } from '@/lib/prisma'

export class PrismaPhotoRepository implements IPhotoRepository {
  async findByProject(projectId: string): Promise<Photo[]> {
    return prisma.photo.findMany({ where: { projectId }, orderBy: { position: 'asc' } })
  }

  async findById(id: string): Promise<Photo | null> {
    return prisma.photo.findUnique({ where: { id } })
  }

  async create(input: CreatePhotoInput): Promise<Photo> {
    return prisma.photo.create({ data: input })
  }

  async reorder(updates: ReorderPhotosInput): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, position }) =>
        prisma.photo.update({ where: { id }, data: { position } })
      )
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.photo.delete({ where: { id } })
  }

  async deleteAllByProject(projectId: string): Promise<void> {
    await prisma.photo.deleteMany({ where: { projectId } })
  }
}
