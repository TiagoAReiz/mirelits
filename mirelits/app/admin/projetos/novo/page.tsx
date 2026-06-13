import { AdminShell } from '@/components/admin-shell'
import { ProjectEditor } from '../project-editor'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo projeto — Admin · mirelits' }
export const dynamic = 'force-dynamic'

async function getArtistProfile() {
  try {
    const p = await prisma.artistProfile.findFirst({ select: { name: true, profilePhotoUrl: true, profileHue: true } })
    return { name: p?.name ?? 'mirelits', profilePhotoUrl: p?.profilePhotoUrl ?? null, profileHue: p?.profileHue ?? 'laranja' }
  } catch { return { name: 'mirelits', profilePhotoUrl: null, profileHue: 'laranja' } }
}

export default async function NovoProjetoPage() {
  const artist = await getArtistProfile()
  return (
    <AdminShell artistName={artist.name} profilePhotoUrl={artist.profilePhotoUrl} profileHue={artist.profileHue}>
      <ProjectEditor />
    </AdminShell>
  )
}
