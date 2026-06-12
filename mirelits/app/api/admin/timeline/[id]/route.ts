import { requireAuth } from '@/lib/auth'
import { TimelineService } from '@/modules/timeline/application/timeline.service'
import { PrismaTimelineRepository } from '@/modules/timeline/infrastructure/timeline.repository'

const service = new TimelineService(new PrismaTimelineRepository())

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const entry = await service.update(id, {
    title: body.title,
    description: body.description,
    year: body.year,
    position: body.position,
  })
  return Response.json(entry)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await params
  await service.delete(id)
  return new Response(null, { status: 204 })
}
