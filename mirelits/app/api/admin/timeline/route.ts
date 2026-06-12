import { requireAuth } from '@/lib/auth'
import { TimelineService } from '@/modules/timeline/application/timeline.service'
import { PrismaTimelineRepository } from '@/modules/timeline/infrastructure/timeline.repository'

const service = new TimelineService(new PrismaTimelineRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const entries = await service.getAll()
  return Response.json(entries)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  if (!body.title || !body.year || body.position === undefined) {
    return Response.json({ error: 'title, year e position são obrigatórios' }, { status: 400 })
  }

  const entry = await service.create({
    title: body.title,
    description: body.description,
    year: body.year,
    position: body.position,
  })
  return Response.json(entry, { status: 201 })
}
