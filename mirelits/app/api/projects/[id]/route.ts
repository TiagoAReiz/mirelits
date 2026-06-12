import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await service.getById(id)
  if (!project || project.status !== 'PUBLISHED') {
    return Response.json({ error: 'Não encontrado' }, { status: 404 })
  }
  return Response.json(project)
}
