import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SectionLabel } from '@/components/section-label'
import { Avatar } from '@/components/avatar'
import { ProjectCard } from '@/components/project-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'mirelits — portfólio',
  description: 'Portfólio de ilustração, quadrinhos e padronagem.',
}

async function getProfile() {
  try {
    return await prisma.artistProfile.findFirst()
  } catch {
    return null
  }
}

async function getSocialLinks() {
  try {
    return await prisma.socialLink.findMany({ orderBy: { position: 'asc' } })
  } catch {
    return []
  }
}

async function getProjects() {
  try {
    return await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ pinned: 'desc' }, { pinOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, title: true, subtitle: true, category: true,
        pinned: true, pinLabel: true,
        coverPhoto: { select: { id: true, url: true, ratio: true, hue: true } },
        photos: {
          orderBy: { position: 'asc' },
          select: { id: true, url: true, ratio: true, hue: true },
          take: 5,
        },
      },
    })
  } catch {
    return []
  }
}

export default async function Home() {
  const [profile, projects, socialLinks] = await Promise.all([getProfile(), getProjects(), getSocialLinks()])

  const name = profile?.name ?? 'mirelits'
  const tagline = profile?.tagline ?? 'Ilustradora & quadrinista'
  const location = profile?.location ?? 'São Paulo, Brasil'
  const shortBio = profile?.shortBio ?? ''
  const handle = profile?.handle ?? '@mirelits'

  return (
    <>
      <Header
        profile={{
          name,
          tagline,
          profileHue: profile?.profileHue ?? 'laranja',
          profilePhotoUrl: profile?.profilePhotoUrl,
          socialLinks,
        }}
      />

      <main style={{ flex: 1 }}>
        {/* ── HERO ── */}
        <section className="wrap" style={{ paddingTop: 'clamp(36px, 7vw, 80px)', paddingBottom: 'clamp(28px, 5vw, 52px)' }}>
          <div style={{ display: 'grid', gap: 'clamp(24px,5vw,56px)', gridTemplateColumns: '1fr', alignItems: 'start' }} className="hero-grid">
            <div style={{ maxWidth: 620 }}>
              <SectionLabel>Olá, eu sou</SectionLabel>
              <h1
                className="serif"
                style={{ fontSize: 'clamp(44px, 9vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.02em', margin: '14px 0 0', fontWeight: 500 }}
              >
                {name}
              </h1>
              <p
                className="serif ital"
                style={{ fontSize: 'clamp(19px,3vw,26px)', color: 'var(--acc-1-ink)', margin: '8px 0 0', lineHeight: 1.25 }}
              >
                {tagline} · {location}
              </p>
              {shortBio && (
                <p style={{ fontSize: 'clamp(16px,2.2vw,18px)', color: 'var(--ink-soft)', marginTop: 20, maxWidth: 540, lineHeight: 1.6 }}>
                  {shortBio}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
                <a href="/sobre" className="btn btn--ghost">Sobre a artista</a>
                <a href="/contato" className="btn">Propor um projeto</a>
              </div>
            </div>
            <div className="hero-portrait" style={{ justifySelf: 'start' }}>
              <div style={{ width: 'clamp(130px, 34vw, 220px)' }}>
                <div style={{ borderRadius: '50%', overflow: 'hidden', aspectRatio: '1', boxShadow: '0 18px 40px color-mix(in oklch, var(--ink) 16%, transparent)' }}>
                  <Avatar
                    name={name}
                    profileHue={profile?.profileHue ?? 'laranja'}
                    profilePhotoUrl={profile?.profilePhotoUrl}
                    size={9999}
                  />
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 12, letterSpacing: '.08em' }}>
                  {handle}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROJECTS MASONRY ── */}
        <section className="wrap" style={{ paddingBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, borderTop: '1px solid var(--line)', paddingTop: 22, gap: 12, flexWrap: 'wrap' }}>
            <h2 className="serif" style={{ fontSize: 'clamp(24px,4vw,34px)', margin: 0, fontWeight: 500 }}>
              Projetos selecionados
            </h2>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', letterSpacing: '.06em' }}>
              {String(projects.length).padStart(2, '0')} trabalhos
            </span>
          </div>

          <div className="mason">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                title={p.title}
                category={p.category}
                pinned={p.pinned}
                pinLabel={p.pinLabel}
                coverPhoto={p.coverPhoto}
                photos={p.photos}
                hoverStyle="deck"
              />
            ))}
          </div>
        </section>
      </main>

      <Footer profile={{ name, profileHue: profile?.profileHue ?? 'laranja', profilePhotoUrl: profile?.profilePhotoUrl }} />

      <style>{`
        @media (min-width: 760px) {
          .hero-grid { grid-template-columns: 1fr auto !important; }
        }
        @media (max-width: 759px) {
          .hero-portrait { order: -1; }
        }
      `}</style>
    </>
  )
}
