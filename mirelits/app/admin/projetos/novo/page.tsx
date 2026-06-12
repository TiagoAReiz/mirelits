import { AdminShell } from '@/components/admin-shell'
import { ProjectEditor } from '../project-editor'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novo projeto — Admin · mirelits' }
export const dynamic = 'force-dynamic'

async function getArtistName() {
  try {
    const p = await prisma.artistProfile.findFirst({ select: { name: true } })
    return p?.name ?? 'mirelits'
  } catch { return 'mirelits' }
}

export default async function NovoProjetoPage() {
  const artistName = await getArtistName()
  return (
    <AdminShell artistName={artistName}>
      <ProjectEditor />
    </AdminShell>
  )
}
