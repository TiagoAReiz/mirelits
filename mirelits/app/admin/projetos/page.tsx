import { prisma } from '@/lib/prisma'
import { AdminShell } from '@/components/admin-shell'
import { ProjectsList } from './projects-list'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Projetos — Admin · mirelits' }
export const dynamic = 'force-dynamic'

async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ pinned: 'desc' }, { pinOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true, title: true, subtitle: true, category: true,
      status: true, pinned: true, pinOrder: true, pinLabel: true,
      coverPhoto: { select: { id: true, url: true, ratio: true, hue: true } },
      _count: { select: { photos: true } },
    },
  })
}

async function getArtistName() {
  try {
    const p = await prisma.artistProfile.findFirst({ select: { name: true } })
    return p?.name ?? 'mirelits'
  } catch { return 'mirelits' }
}

export default async function AdminProjetosPage() {
  const [projects, artistName] = await Promise.all([getProjects(), getArtistName()])

  return (
    <AdminShell artistName={artistName}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <span className="dot" style={{ background: 'var(--acc-2)' }} />
              <span className="label">Gerenciar</span>
            </div>
            <h1 className="serif" style={{ fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.05, margin: 0, fontWeight: 500 }}>
              Seus projetos
            </h1>
          </div>
          <Link href="/admin/projetos/novo" className="btn btn--accent">
            + Novo projeto
          </Link>
        </div>

        <ProjectsList initial={projects as any} />
      </div>
    </AdminShell>
  )
}
