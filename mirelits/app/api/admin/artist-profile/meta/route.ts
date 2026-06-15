import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ID = 'singleton'

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const {
    handle, tagline, location, email, profileHue, profilePhotoUrl,
    colorBg, colorInk, colorAcc1, colorAcc2, colorAcc3,
    fontDisplay, fontSubtitle, fontBody,
  } = body

  await prisma.artistProfile.deleteMany({
    where: { id: { not: ID } },
  })

  const updated = await prisma.artistProfile.upsert({
    where: { id: ID },
    create: {
      id: ID,
      handle: handle ?? '',
      tagline: tagline ?? '',
      location: location ?? '',
      email: email ?? '',
      profileHue: profileHue ?? 'laranja',
      colorBg: colorBg ?? null,
      colorInk: colorInk ?? null,
      colorAcc1: colorAcc1 ?? null,
      colorAcc2: colorAcc2 ?? null,
      colorAcc3: colorAcc3 ?? null,
      fontDisplay: fontDisplay ?? null,
      fontSubtitle: fontSubtitle ?? null,
      fontBody: fontBody ?? null,
    },
    update: {
      ...(handle !== undefined && { handle }),
      ...(tagline !== undefined && { tagline }),
      ...(location !== undefined && { location }),
      ...(email !== undefined && { email }),
      ...(profileHue !== undefined && { profileHue }),
      ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
      ...(colorBg !== undefined && { colorBg }),
      ...(colorInk !== undefined && { colorInk }),
      ...(colorAcc1 !== undefined && { colorAcc1 }),
      ...(colorAcc2 !== undefined && { colorAcc2 }),
      ...(colorAcc3 !== undefined && { colorAcc3 }),
      ...(fontDisplay !== undefined && { fontDisplay }),
      ...(fontSubtitle !== undefined && { fontSubtitle }),
      ...(fontBody !== undefined && { fontBody }),
    },
  })

  return Response.json(updated)
}
