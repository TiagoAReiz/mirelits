import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const projects = await service.getAll()
  return Response.json(projects)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  if (!body.title || typeof body.title !== 'string') {
    return Response.json({ error: 'title é obrigatório' }, { status: 400 })
  }

  const project = await service.create({
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,
  })
  return Response.json(project, { status: 201 })
}
