import { prisma } from '@/lib/prisma'
import { AdminShell } from '@/components/admin-shell'
import { ProjectEditor } from '../project-editor'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { position: 'asc' } },
      coverPhoto: { select: { id: true } },
    },
  })
}

async function getArtistName() {
  try {
    const p = await prisma.artistProfile.findFirst({ select: { name: true } })
    return p?.name ?? 'mirelits'
  } catch { return 'mirelits' }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = await getProject(id)
  return { title: `${p?.title ?? 'Editar'} — Admin · mirelits` }
}

export default async function EditarProjetoPage({ params }: Props) {
  const { id } = await params
  const [project, artistName] = await Promise.all([getProject(id), getArtistName()])
  if (!project) notFound()

  const initial = {
    id: project.id,
    title: project.title,
    subtitle: project.subtitle ?? '',
    category: project.category ?? 'Ilustração',
    year: project.year ?? String(new Date().getFullYear()),
    description: project.description ?? '',
    status: project.status as 'DRAFT' | 'PUBLISHED',
    pinned: project.pinned,
    pinLabel: project.pinLabel ?? '',
    photos: project.photos.map((ph) => ({
      id: ph.id,
      url: ph.url,
      ratio: ph.ratio,
      hue: ph.hue,
      position: ph.position,
    })),
    coverPhotoId: project.coverPhoto?.id ?? null,
  }

  return (
    <AdminShell artistName={artistName}>
      <ProjectEditor initial={initial} />
    </AdminShell>
  )
}
