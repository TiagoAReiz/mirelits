import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const link = await prisma.socialLink.update({
    where: { id },
    data: { platform: body.platform, label: body.label, url: body.url, position: body.position },
  })
  return Response.json(link)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await params
  await prisma.socialLink.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
