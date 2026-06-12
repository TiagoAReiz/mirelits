import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET() {
  const projects = await service.getAllPublished()
  return Response.json(projects)
}
