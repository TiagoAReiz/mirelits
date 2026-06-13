import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

const HUE_HEX: Record<string, string> = {
  azul:    '#4A7FD4',
  marinho: '#2B4A8C',
  laranja: '#E07830',
  verde:   '#4DA876',
  roxo:    '#7B4DB8',
  rosa:    '#D4607E',
  ocre:    '#B8A040',
  pedra:   '#B0A880',
  ceu:     '#60A8D0',
  vinho:   '#8B2030',
}

export default async function Icon() {
  let profile: { profilePhotoUrl: string | null; profileHue: string; name: string } | null = null
  try {
    profile = await prisma.artistProfile.findFirst({
      select: { profilePhotoUrl: true, profileHue: true, name: true },
    })
  } catch { /* DB offline — use fallback */ }

  if (profile?.profilePhotoUrl) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: 64, height: 64, borderRadius: 16, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.profilePhotoUrl} width={64} height={64} style={{ objectFit: 'cover' }} />
        </div>
      ),
      { ...size },
    )
  }

  const color = HUE_HEX[profile?.profileHue ?? 'laranja'] ?? '#E07830'
  const initial = (profile?.name ?? 'M')[0]?.toUpperCase() ?? 'M'

  return new ImageResponse(
    (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 64, height: 64, borderRadius: 16,
        background: color,
        color: 'white', fontSize: 36, fontWeight: 700,
      }}>
        {initial}
      </div>
    ),
    { ...size },
  )
}
