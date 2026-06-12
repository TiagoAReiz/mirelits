import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  // Body: Array<{ id: string; pinned: boolean; pinOrder: number | null }>
  const body = await req.json()
  await service.updatePins(body)
  return new Response(null, { status: 204 })
}
