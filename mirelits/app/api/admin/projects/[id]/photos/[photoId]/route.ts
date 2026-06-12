import { requireAuth } from '@/lib/auth'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const service = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { photoId } = await params
  await service.delete(photoId)
  return new Response(null, { status: 204 })
}
