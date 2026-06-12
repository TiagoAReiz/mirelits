import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/artist-profile/meta
 * Updates extra fields not covered by the multipart PUT:
 * handle, tagline, location, email, profileHue, colors
 */
export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { handle, tagline, location, email, profileHue, colorBg, colorInk, colorAcc1, colorAcc2, colorAcc3 } = body

  let profile = await prisma.artistProfile.findFirst()
  if (!profile) {
    profile = await prisma.artistProfile.create({ data: {} })
  }

  const updated = await prisma.artistProfile.update({
    where: { id: profile.id },
    data: {
      ...(handle !== undefined && { handle }),
      ...(tagline !== undefined && { tagline }),
      ...(location !== undefined && { location }),
      ...(email !== undefined && { email }),
      ...(profileHue !== undefined && { profileHue }),
      ...(colorBg !== undefined && { colorBg }),
      ...(colorInk !== undefined && { colorInk }),
      ...(colorAcc1 !== undefined && { colorAcc1 }),
      ...(colorAcc2 !== undefined && { colorAcc2 }),
      ...(colorAcc3 !== undefined && { colorAcc3 }),
    },
  })

  return Response.json(updated)
}
