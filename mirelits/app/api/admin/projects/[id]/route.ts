import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const projectService = new ProjectService(new PrismaProjectRepository())
const photoService = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const project = await projectService.getById(id)
  if (!project) return Response.json({ error: 'Não encontrado' }, { status: 404 })
  return Response.json(project)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const project = await projectService.update(id, {
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,
    status: body.status,
    coverPhotoId: body.coverPhotoId,
  })
  return Response.json(project)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  await photoService.deleteByProject(id)
  await projectService.delete(id)
  return new Response(null, { status: 204 })
}
