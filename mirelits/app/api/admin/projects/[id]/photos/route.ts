import { requireAuth } from '@/lib/auth'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const service = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'file é obrigatório' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await service.upload(id, buffer, file.name)
  return Response.json(result, { status: 201 })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  // Body: Array<{ id: string; position: number }>
  const body = await req.json()
  await service.reorder(id, body)
  return new Response(null, { status: 204 })
}
