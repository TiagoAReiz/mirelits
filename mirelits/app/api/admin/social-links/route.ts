import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error
  const links = await prisma.socialLink.findMany({ orderBy: { position: 'asc' } })
  return Response.json(links)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  if (!body.platform || !body.url) {
    return Response.json({ error: 'platform e url são obrigatórios' }, { status: 400 })
  }
  const count = await prisma.socialLink.count()
  const link = await prisma.socialLink.create({
    data: { platform: body.platform, label: body.label ?? body.platform, url: body.url, position: count },
  })
  return Response.json(link, { status: 201 })
}
