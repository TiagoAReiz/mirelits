import { prisma } from '@/lib/prisma'
import { Ph } from '@/components/ph'
import { SectionLabel } from '@/components/section-label'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

async function getProject(id: string) {
  try {
    return await prisma.project.findUnique({
      where: { id, status: 'PUBLISHED' },
      include: {
        photos: { orderBy: { position: 'asc' } },
        coverPhoto: true,
      },
    })
  } catch {
    return null
  }
}

async function getNextProject(id: string) {
  try {
    return await prisma.project.findFirst({
      where: { status: 'PUBLISHED', id: { not: id } },
      orderBy: [{ pinned: 'desc' }, { pinOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, title: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await getProject(id)
  if (!project) return { title: 'Projeto não encontrado' }
  return {
    title: `${project.title} — mirelits`,
    description: project.description ?? undefined,
  }
}

export default async function ProjetoPage({ params }: Props) {
  const { id } = await params
  const [project, nextProject] = await Promise.all([
    getProject(id),
    getNextProject(id),
  ])

  if (!project) notFound()

  return (
    <main style={{ flex: 1 }}>
      <article className="wrap" style={{ paddingTop: 'clamp(28px,5vw,52px)' }}>
        <a href="/" className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', letterSpacing: '.06em', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15 }}>←</span> Todos os projetos
        </a>

        <header style={{ marginTop: 22, maxWidth: 760, borderBottom: '1px solid var(--line)', paddingBottom: 30 }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {project.category && (
              <SectionLabel color="var(--acc-2)">{project.category}</SectionLabel>
            )}
            {project.year && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '.08em' }}>
                {project.year}
              </span>
            )}
          </div>
          <h1
            className="serif"
            style={{ fontSize: 'clamp(38px,7vw,72px)', lineHeight: 1.0, letterSpacing: '-0.02em', margin: '14px 0 0', fontWeight: 500 }}
          >
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="serif ital" style={{ fontSize: 'clamp(17px,2.6vw,22px)', color: 'var(--acc-1-ink)', margin: '10px 0 0' }}>
              {project.subtitle}
            </p>
          )}
          {project.description && (
            <p style={{ fontSize: 17, color: 'var(--ink-soft)', marginTop: 18, lineHeight: 1.65, maxWidth: 620 }}>
              {project.description}
            </p>
          )}
        </header>

        {/* image stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(20px,4vw,44px)', marginTop: 'clamp(28px,5vw,48px)' }}>
          {project.photos.map((im, i) => (
            <figure key={im.id} style={{ margin: 0, width: '100%', maxWidth: (im.ratio ?? 1) > 1.1 ? 720 : 940 }}>
              <Ph
                src={im.url}
                hue={im.hue ?? 'pedra'}
                ratio={im.ratio ?? 1}
                natural
                showCap={false}
                sizes="(max-width: 760px) 100vw, 940px"
                style={{ width: '100%', borderRadius: 6, boxShadow: '0 6px 24px color-mix(in oklch, var(--ink) 10%, transparent)' }}
              />
              <figcaption className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 9, letterSpacing: '.06em', textAlign: 'center' }}>
                {project.title} — {String(i + 1).padStart(2, '0')} / {String(project.photos.length).padStart(2, '0')}
              </figcaption>
            </figure>
          ))}
        </div>
      </article>

      {/* next project */}
      {nextProject && (
        <a href={`/projeto/${nextProject.id}`} style={{ display: 'block', borderTop: '1px solid var(--line)', marginTop: 64 }}>
          <div className="wrap" style={{ paddingBlock: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div className="label">Próximo projeto</div>
              <div className="serif" style={{ fontSize: 'clamp(26px,4vw,40px)', marginTop: 8, fontWeight: 500 }}>{nextProject.title}</div>
            </div>
            <span className="serif" style={{ fontSize: 'clamp(30px,5vw,48px)', color: 'var(--acc-1)' }}>→</span>
          </div>
        </a>
      )}
    </main>
  )
}
