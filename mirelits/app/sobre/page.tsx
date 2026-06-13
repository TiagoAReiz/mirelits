import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar } from '@/components/avatar'
import { SectionLabel } from '@/components/section-label'
import { SocialIcon } from '@/components/social-icon'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre — mirelits',
  description: 'Conheça a trajetória de mirelits, ilustradora e quadrinista baseada em São Paulo.',
}

async function getData() {
  try {
    const [profile, timeline, socialLinks] = await Promise.all([
      prisma.artistProfile.findFirst(),
      prisma.timelineEntry.findMany({ orderBy: { position: 'asc' } }),
      prisma.socialLink.findMany({ orderBy: { position: 'asc' } }),
    ])
    return { profile, timeline, socialLinks }
  } catch {
    return { profile: null, timeline: [], socialLinks: [] }
  }
}

async function getCategories() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      select: { category: true },
    })
    return [...new Set(projects.map((p) => p.category).filter(Boolean))] as string[]
  } catch {
    return []
  }
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
}

export default async function SobrePage() {
  const [{ profile, timeline, socialLinks }, cats] = await Promise.all([getData(), getCategories()])

  const name = profile?.name ?? 'mirelits'
  const tagline = profile?.tagline ?? 'Ilustradora & quadrinista'
  const location = profile?.location ?? 'São Paulo, Brasil'
  const fullBio = profile?.fullBio ?? ''

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
        <div className="wrap route" style={{ paddingTop: 'clamp(36px,6vw,68px)' }}>
          <div style={{ display: 'grid', gap: 'clamp(28px,5vw,56px)', gridTemplateColumns: '1fr' }} className="about-grid">
            <div>
              <SectionLabel>Sobre a artista</SectionLabel>
              <h1 className="serif" style={{ fontSize: 'clamp(40px,7vw,76px)', lineHeight: 0.98, letterSpacing: '-0.02em', margin: '14px 0 0', fontWeight: 500 }}>
                {name}
              </h1>
              <p className="serif ital" style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: 'var(--acc-1-ink)', margin: '8px 0 0' }}>
                {tagline} — {location}
              </p>
              {fullBio.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} style={{ fontSize: 17, color: 'var(--ink-soft)', marginTop: 18, lineHeight: 1.7, maxWidth: 640 }}>
                  {para}
                </p>
              ))}

              {cats.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <span className="label">Trabalho com</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {cats.map((c) => (
                      <span key={c} className="mono" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, border: '1px solid var(--line)', color: 'var(--ink-soft)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="about-portrait" style={{ justifySelf: 'start' }}>
              <div style={{ width: 'clamp(150px,40vw,260px)', borderRadius: '50%', overflow: 'hidden', aspectRatio: '1', boxShadow: '0 18px 44px color-mix(in oklch, var(--ink) 18%, transparent)' }}>
                <Avatar
                  name={name}
                  profileHue={profile?.profileHue ?? 'laranja'}
                  profilePhotoUrl={profile?.profilePhotoUrl}
                  size={9999}
                />
              </div>
            </div>
          </div>

          {/* timeline horizontal */}
          {timeline.length > 0 && (
            <section style={{ marginTop: 'clamp(40px,7vw,72px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 className="serif" style={{ fontSize: 'clamp(24px,4vw,34px)', margin: 0, fontWeight: 500 }}>
                  Linha do tempo
                </h2>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '.06em' }}>
                  arraste para o lado →
                </span>
              </div>

              <div className="hscroll" style={{ overflowX: 'auto', paddingBottom: 14, marginInline: 'calc(-1 * var(--gut))', paddingInline: 'var(--gut)' }}>
                <div style={{ display: 'flex', gap: 0, minWidth: 'min-content', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 46, height: 2, background: 'var(--line)' }} />
                  {timeline.map((t) => (
                    <div key={t.id} style={{ flex: '0 0 auto', width: 248, paddingRight: 28, position: 'relative', scrollSnapAlign: 'start' }}>
                      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--acc-1-ink)' }}>{t.year}</div>
                      <div style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--bg)', border: '3px solid var(--acc-1)', marginTop: 9, position: 'relative', zIndex: 1 }} />
                      <div className="serif" style={{ fontSize: 21, marginTop: 16, fontWeight: 500, lineHeight: 1.1 }}>{t.title}</div>
                      {t.description && (
                        <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', marginTop: 7, lineHeight: 1.55 }}>{t.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* redes sociais */}
          {socialLinks.length > 0 && (
            <section id="redes" style={{ marginTop: 'clamp(40px,7vw,72px)' }}>
              <SectionLabel color="var(--acc-2)">Redes & presença online</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
                {socialLinks.map((sl) => (
                  <a
                    key={sl.id}
                    href={sl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-card"
                  >
                    <span style={{ color: 'var(--acc-1)', display: 'flex' }}>
                      <SocialIcon platform={sl.platform} size={20} />
                    </span>
                    <div>
                      <div className="serif" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.1 }}>{sl.label}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '.04em', marginTop: 2 }}>
                        {hostname(sl.url)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div style={{ marginTop: 48, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/" className="btn btn--ghost">Ver projetos</a>
            <a href="/contato" className="btn">Propor um projeto</a>
          </div>
        </div>
      </main>

      <Footer profile={{ name, profileHue: profile?.profileHue ?? 'laranja', profilePhotoUrl: profile?.profilePhotoUrl }} />

      <style>{`
        @media (min-width: 820px) {
          .about-grid { grid-template-columns: 1fr auto !important; align-items: start; }
        }
        .social-card {
          display: inline-flex; align-items: center; gap: 10;
          padding: 12px 18px; border-radius: 12px;
          border: 1px solid var(--line); background: var(--paper);
          color: var(--ink); text-decoration: none;
          transition: border-color .18s, transform .18s, box-shadow .18s;
        }
        @media (hover: hover) {
          .social-card:hover {
            border-color: var(--acc-1);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px color-mix(in oklch, var(--ink) 8%, transparent);
          }
        }
      `}</style>
    </>
  )
}
