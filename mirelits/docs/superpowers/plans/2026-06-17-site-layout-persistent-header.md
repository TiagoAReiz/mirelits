# Layout Persistente com Header/Footer e Sliding Nav Bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover Header/Footer para um layout compartilhado (`(site)/layout.tsx`), adicionar barra deslizante no nav, e criar loading states para todas as rotas públicas.

**Architecture:** Route group `(site)` com `layout.tsx` que faz uma query ao banco para Header/Footer. Todas as páginas públicas são movidas para `(site)/` via `git mv` e têm Header/Footer removidos do seu JSX. O `Header` ganha um indicador deslizante via `useRef` + `useEffect` + `useState`. URLs não mudam.

**Tech Stack:** Next.js 16 App Router (route groups, `layout.tsx`, `loading.tsx`), React 19, TypeScript

## Global Constraints

- Route group `(site)` — parênteses são invisíveis nas URLs
- Cada `git mv` precisa que o diretório destino já exista (`mkdir -p` antes)
- Caminhos com parênteses em bash DEVEM ser citados: `'app/(site)/...'`
- `(site)/layout.tsx` é Server Component — sem `'use client'`
- Cada página pública retorna `<main style={{ flex: 1 }}>` como raiz (sem fragmento externo)
- `app/layout.tsx` (root) e `app/admin/**` não são tocados
- Sem novas dependências

---

### Task 1: Criar `app/(site)/layout.tsx`

**Files:**
- Create: `mirelits/app/(site)/layout.tsx`

**Interfaces:**
- Produces: route group `(site)` com Header/Footer — todas as tarefas seguintes dependem deste diretório existir

---

- [ ] **Step 1: Criar diretório e arquivo**

```bash
mkdir -p 'mirelits/app/(site)'
```

Criar `mirelits/app/(site)/layout.tsx` com o seguinte conteúdo:

```tsx
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

async function getHeaderData() {
  try {
    const [profile, socialLinks] = await Promise.all([
      prisma.artistProfile.findFirst({
        select: { name: true, tagline: true, profileHue: true, profilePhotoUrl: true },
      }),
      prisma.socialLink.findMany({ orderBy: { position: 'asc' } }),
    ])
    return { profile, socialLinks }
  } catch {
    return { profile: null, socialLinks: [] }
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, socialLinks } = await getHeaderData()
  const name = profile?.name ?? 'mirelits'
  const profileHue = profile?.profileHue ?? 'laranja'

  return (
    <>
      <Header
        profile={{
          name,
          tagline: profile?.tagline,
          profileHue,
          profilePhotoUrl: profile?.profilePhotoUrl,
          socialLinks,
        }}
      />
      {children}
      <Footer profile={{ name, profileHue, profilePhotoUrl: profile?.profilePhotoUrl }} />
    </>
  )
}
```

- [ ] **Step 2: Verificar que o arquivo foi criado corretamente**

```bash
cat 'mirelits/app/(site)/layout.tsx'
```

Confirmar: sem `'use client'`, importa `Header` e `Footer`, exporta `SiteLayout` como default.

- [ ] **Step 3: Commit**

```bash
git add 'mirelits/app/(site)/layout.tsx'
git commit -m "feat: criar route group (site) com layout compartilhado"
```

---

### Task 2: Mover home page para `(site)/page.tsx`

**Files:**
- Move: `mirelits/app/page.tsx` → `mirelits/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `(site)/layout.tsx` de Task 1 (fornece Header/Footer)

---

- [ ] **Step 1: Mover arquivo**

```bash
git mv 'mirelits/app/page.tsx' 'mirelits/app/(site)/page.tsx'
```

- [ ] **Step 2: Editar `app/(site)/page.tsx` — remover Header, Footer, getSocialLinks**

Substituir todo o conteúdo do arquivo por:

```tsx
import { prisma } from '@/lib/prisma'
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
  const [profile, projects] = await Promise.all([getProfile(), getProjects()])

  const name = profile?.name ?? 'mirelits'
  const tagline = profile?.tagline ?? 'Ilustradora & quadrinista'
  const location = profile?.location ?? 'São Paulo, Brasil'
  const shortBio = profile?.shortBio ?? ''
  const handle = profile?.handle ?? '@mirelits'

  return (
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

      <style>{`
        @media (min-width: 760px) {
          .hero-grid { grid-template-columns: 1fr auto !important; }
        }
        @media (max-width: 759px) {
          .hero-portrait { order: -1; }
        }
      `}</style>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add 'mirelits/app/(site)/page.tsx'
git commit -m "feat: mover home page para route group (site)"
```

---

### Task 3: Mover sobre page para `(site)/sobre/page.tsx`

**Files:**
- Move: `mirelits/app/sobre/page.tsx` → `mirelits/app/(site)/sobre/page.tsx`

**Interfaces:**
- Consumes: `(site)/layout.tsx` de Task 1

---

- [ ] **Step 1: Criar diretório e mover arquivo**

```bash
mkdir -p 'mirelits/app/(site)/sobre'
git mv 'mirelits/app/sobre/page.tsx' 'mirelits/app/(site)/sobre/page.tsx'
```

- [ ] **Step 2: Editar `app/(site)/sobre/page.tsx` — remover Header, Footer**

Substituir o conteúdo por (mantém `socialLinks` pois são usados na seção de redes sociais da própria página):

```tsx
import { prisma } from '@/lib/prisma'
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

        {socialLinks.length > 0 && (
          <section id="redes" style={{ marginTop: 'clamp(40px,7vw,72px)' }}>
            <SectionLabel color="var(--acc-2)">Redes & presença online</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
              {socialLinks.map((sl) => (
                <a key={sl.id} href={sl.url} target="_blank" rel="noopener noreferrer" className="social-card">
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

      <style>{`
        @media (min-width: 820px) {
          .about-grid { grid-template-columns: 1fr auto !important; align-items: start; }
        }
        .social-card {
          display: inline-flex; align-items: center; gap: 16px;
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
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add 'mirelits/app/(site)/sobre/page.tsx'
git commit -m "feat: mover sobre page para route group (site)"
```

---

### Task 4: Mover contato pages para `(site)/contato/`

**Files:**
- Move: `mirelits/app/contato/page.tsx` → `mirelits/app/(site)/contato/page.tsx`
- Move: `mirelits/app/contato/contato-form.tsx` → `mirelits/app/(site)/contato/contato-form.tsx`

**Interfaces:**
- Consumes: `(site)/layout.tsx` de Task 1

---

- [ ] **Step 1: Criar diretório e mover ambos os arquivos**

```bash
mkdir -p 'mirelits/app/(site)/contato'
git mv 'mirelits/app/contato/page.tsx' 'mirelits/app/(site)/contato/page.tsx'
git mv 'mirelits/app/contato/contato-form.tsx' 'mirelits/app/(site)/contato/contato-form.tsx'
```

- [ ] **Step 2: Editar `app/(site)/contato/page.tsx` — remover Header, Footer, getSocialLinks**

Substituir o conteúdo por:

```tsx
import { prisma } from '@/lib/prisma'
import { ContatoForm } from './contato-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato — mirelits',
  description: 'Proponha um projeto de ilustração, quadrinho, capa ou padronagem.',
}

async function getProfile() {
  try {
    return await prisma.artistProfile.findFirst({
      select: { name: true, tagline: true, profileHue: true, profilePhotoUrl: true, email: true, handle: true },
    })
  } catch {
    return null
  }
}

export default async function ContatoPage() {
  const profile = await getProfile()

  return (
    <main style={{ flex: 1 }}>
      <div className="wrap route" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 80 }}>
        <ContatoForm
          email={profile?.email ?? 'ola@mirelits.com'}
          handle={profile?.handle ?? '@mirelits'}
        />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verificar que `contato-form.tsx` não precisa de alterações**

Ler `mirelits/app/(site)/contato/contato-form.tsx`. O import de `'./contato-form'` na page funciona pois ambos estão no mesmo diretório. Nenhuma alteração necessária no form.

- [ ] **Step 4: Commit**

```bash
git add 'mirelits/app/(site)/contato/page.tsx' 'mirelits/app/(site)/contato/contato-form.tsx'
git commit -m "feat: mover contato page para route group (site)"
```

---

### Task 5: Mover projeto pages + simplificar loading.tsx

**Files:**
- Move: `mirelits/app/projeto/[id]/page.tsx` → `mirelits/app/(site)/projeto/[id]/page.tsx`
- Move: `mirelits/app/projeto/[id]/loading.tsx` → `mirelits/app/(site)/projeto/[id]/loading.tsx`

**Interfaces:**
- Consumes: `(site)/layout.tsx` de Task 1

---

- [ ] **Step 1: Criar diretório e mover arquivos**

```bash
mkdir -p 'mirelits/app/(site)/projeto/[id]'
git mv 'mirelits/app/projeto/[id]/page.tsx' 'mirelits/app/(site)/projeto/[id]/page.tsx'
git mv 'mirelits/app/projeto/[id]/loading.tsx' 'mirelits/app/(site)/projeto/[id]/loading.tsx'
```

- [ ] **Step 2: Editar `app/(site)/projeto/[id]/page.tsx` — remover Header, Footer, getProfile, getSocialLinks**

Substituir o conteúdo por:

```tsx
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
```

- [ ] **Step 3: Editar `app/(site)/projeto/[id]/loading.tsx` — remover Header e Footer**

Substituir o conteúdo por (mantém todo o skeleton, só remove as importações e usos de Header/Footer):

```tsx
export default function Loading() {
  return (
    <main role="status" aria-label="A carregar" style={{ flex: 1 }}>
      <article aria-hidden="true" className="wrap" style={{ paddingTop: 'clamp(28px,5vw,52px)' }}>

        {/* back link */}
        <div className="skel" style={{ width: 120, height: 13, borderRadius: 3 }} />

        {/* project header */}
        <header style={{ marginTop: 22, maxWidth: 760, borderBottom: '1px solid var(--line)', paddingBottom: 30 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="skel" style={{ width: 88, height: 22, borderRadius: 999 }} />
            <div className="skel" style={{ width: 36, height: 14 }} />
          </div>
          <div className="skel" style={{ width: '58%', height: 'clamp(38px,7vw,72px)', marginTop: 18 }} />
          <div className="skel" style={{ width: '38%', height: 20, marginTop: 14 }} />
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div className="skel" style={{ width: '88%', height: 13 }} />
            <div className="skel" style={{ width: '72%', height: 13 }} />
            <div className="skel" style={{ width: '52%', height: 13 }} />
          </div>
        </header>

        {/* image placeholders */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(20px,4vw,44px)',
          marginTop: 'clamp(28px,5vw,48px)',
        }}>
          <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '4 / 3', borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', maxWidth: 720, aspectRatio: '3 / 4', borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '16 / 9', borderRadius: 6 }} />
        </div>

      </article>

      {/* next project skeleton */}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 64 }}>
        <div className="wrap" style={{ paddingBlock: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skel" style={{ width: 100, height: 12 }} />
            <div className="skel" style={{ width: 240, height: 'clamp(26px,4vw,40px)' }} />
          </div>
          <div className="skel" style={{ width: 48, height: 48, borderRadius: 999 }} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add 'mirelits/app/(site)/projeto/[id]/page.tsx' 'mirelits/app/(site)/projeto/[id]/loading.tsx'
git commit -m "feat: mover projeto page para route group (site)"
```

---

### Task 6: Adicionar sliding bar indicator no Header

**Files:**
- Modify: `mirelits/components/header.tsx`

**Interfaces:**
- Consumes: `useRef`, `useEffect`, `useState` de `react` (já importados parcialmente)

---

- [ ] **Step 1: Ler o arquivo atual**

```
Ler: mirelits/components/header.tsx
```

Confirmar que o componente usa `usePathname`, `useState`, `Link`. O `useRef` e `useEffect` ainda não estão importados.

- [ ] **Step 2: Atualizar import de react**

Linha 1 atual: não há import de react (Next.js auto-imports). Adicionar import explícito no topo:

```tsx
'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from './avatar'
import { SocialIcon } from './social-icon'
```

- [ ] **Step 3: Adicionar estado e ref no corpo do componente**

Logo após `const [open, setOpen] = useState(false)`, adicionar:

```tsx
const navRef = useRef<HTMLElement>(null)
const [bar, setBar] = useState({ left: 0, width: 0, ready: false })

useEffect(() => {
  const nav = navRef.current
  if (!nav) return
  const active = nav.querySelector('[data-active="true"]') as HTMLElement | null
  if (!active) { setBar(b => ({ ...b, ready: false })); return }
  const navRect = nav.getBoundingClientRect()
  const linkRect = active.getBoundingClientRect()
  setBar({ left: linkRect.left - navRect.left, width: linkRect.width, ready: true })
}, [pathname])
```

- [ ] **Step 4: Atualizar a `<nav>` desktop**

Localizar o bloco `{/* desktop nav */}`. Substituir pela versão atualizada:

```tsx
{/* desktop nav */}
<nav
  ref={navRef}
  style={{ display: 'none', alignItems: 'center', gap: 26, position: 'relative', alignSelf: 'stretch' }}
  className="nav-desk"
>
  {LINKS.map((l) => {
    const active = l.match(pathname)
    return (
      <Link key={l.href} href={l.href} className="mono"
        data-active={active ? 'true' : undefined}
        style={{
          fontSize: 13, letterSpacing: '0.04em', padding: '6px 2px',
          color: active ? 'var(--ink)' : 'var(--ink-soft)',
          transition: 'color .2s',
          display: 'inline-flex', alignItems: 'center',
        }}
      >
        {l.label}
      </Link>
    )
  })}
  <Link href="/contato" className="btn btn--sm" style={{ marginLeft: 4 }}>
    Propor projeto
  </Link>

  {links.length > 0 && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10, paddingLeft: 14, borderLeft: '1px solid var(--line)' }}>
      {visibleLinks.map((sl) => (
        <a key={sl.id} href={sl.url} target="_blank" rel="noopener noreferrer"
          title={sl.label}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, color: 'var(--ink-soft)', transition: 'color .15s, background .15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLElement).style.background = 'var(--line-soft)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-soft)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <SocialIcon platform={sl.platform} size={17} />
        </a>
      ))}
      {overflow > 0 && (
        <Link href="/sobre#redes"
          className="mono"
          style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--ink-faint)', paddingInline: 7, paddingBlock: 3, borderRadius: 99, border: '1px solid var(--line)' }}
        >
          +{overflow}
        </Link>
      )}
    </div>
  )}

  {/* sliding indicator */}
  <span
    aria-hidden="true"
    style={{
      position: 'absolute',
      bottom: 0,
      left: bar.left,
      width: bar.width,
      height: 2,
      background: 'var(--acc-1)',
      borderRadius: 1,
      opacity: bar.ready ? 1 : 0,
      transition: 'left 0.25s cubic-bezier(.2,.7,.2,1), width 0.25s cubic-bezier(.2,.7,.2,1), opacity 0.15s',
      pointerEvents: 'none',
    }}
  />
</nav>
```

- [ ] **Step 5: Verificar que o arquivo está correto**

```
Ler: mirelits/components/header.tsx
```

Confirmar: `useRef`, `useEffect` importados; `navRef` e `bar` state definidos; `useEffect` com `[pathname]`; `<span>` indicador dentro da nav; `data-active` nos links.

- [ ] **Step 6: Commit**

```bash
git add mirelits/components/header.tsx
git commit -m "feat: adicionar sliding bar indicator no nav do header"
```

---

### Task 7: Loading states para home, sobre e contato

**Files:**
- Create: `mirelits/app/(site)/loading.tsx`
- Create: `mirelits/app/(site)/sobre/loading.tsx`
- Create: `mirelits/app/(site)/contato/loading.tsx`

**Interfaces:**
- Consumes: `.skel` CSS class (definida em `globals.css`)
- Consumes: route group `(site)` de Task 1 — Header/Footer já fornecidos pelo layout

---

- [ ] **Step 1: Criar `app/(site)/loading.tsx` (home skeleton)**

```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <section className="wrap" style={{ paddingTop: 'clamp(36px, 7vw, 80px)', paddingBottom: 'clamp(28px, 5vw, 52px)' }}>
        <div style={{ display: 'grid', gap: 'clamp(24px,5vw,56px)', gridTemplateColumns: '1fr', alignItems: 'start' }} className="hero-grid">
          <div style={{ maxWidth: 620 }}>
            <div className="skel" style={{ width: 80, height: 13 }} />
            <div className="skel" style={{ width: '55%', height: 'clamp(44px,9vw,88px)', marginTop: 14 }} />
            <div className="skel" style={{ width: '45%', height: 22, marginTop: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              <div className="skel" style={{ width: '85%', height: 14 }} />
              <div className="skel" style={{ width: '70%', height: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <div className="skel" style={{ width: 130, height: 38, borderRadius: 999 }} />
              <div className="skel" style={{ width: 150, height: 38, borderRadius: 999 }} />
            </div>
          </div>
          <div className="hero-portrait" style={{ justifySelf: 'start' }}>
            <div className="skel" style={{ width: 'clamp(130px,34vw,220px)', aspectRatio: '1', borderRadius: '50%' }} />
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 22, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="skel" style={{ width: 200, height: 28 }} />
          <div className="skel" style={{ width: 60, height: 13 }} />
        </div>
        <div style={{ columns: 'var(--mason-cols, 3)', columnGap: 14 }}>
          {([1.4, 0.75, 1.1, 0.6, 1.6, 1.0] as number[]).map((ratio, i) => (
            <div key={i} className="skel" style={{ marginBottom: 14, borderRadius: 4, aspectRatio: `1 / ${ratio}`, breakInside: 'avoid' }} />
          ))}
        </div>
      </section>

      <style>{`
        @media (min-width: 760px) {
          .hero-grid { grid-template-columns: 1fr auto !important; }
        }
        @media (max-width: 759px) {
          .hero-portrait { order: -1; }
        }
      `}</style>
    </main>
  )
}
```

- [ ] **Step 2: Criar `app/(site)/sobre/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 'clamp(40px,7vw,72px)' }}>
        <div style={{ display: 'grid', gap: 'clamp(28px,5vw,56px)', gridTemplateColumns: '1fr' }} className="about-grid">
          <div>
            <div className="skel" style={{ width: 100, height: 13 }} />
            <div className="skel" style={{ width: '50%', height: 'clamp(40px,7vw,76px)', marginTop: 14 }} />
            <div className="skel" style={{ width: '42%', height: 22, marginTop: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 20 }}>
              {([90, 78, 83, 65] as number[]).map((w, i) => (
                <div key={i} className="skel" style={{ width: `${w}%`, height: 14 }} />
              ))}
            </div>
          </div>
          <div className="about-portrait" style={{ justifySelf: 'start' }}>
            <div className="skel" style={{ width: 'clamp(150px,40vw,260px)', aspectRatio: '1', borderRadius: '50%' }} />
          </div>
        </div>

        <div style={{ marginTop: 'clamp(40px,7vw,72px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="skel" style={{ width: 160, height: 28 }} />
            <div className="skel" style={{ width: 110, height: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: '0 0 auto', width: 248 }}>
                <div className="skel" style={{ width: 60, height: 22 }} />
                <div className="skel" style={{ width: 13, height: 13, borderRadius: '50%', marginTop: 9 }} />
                <div className="skel" style={{ width: '70%', height: 18, marginTop: 16 }} />
                <div className="skel" style={{ width: '85%', height: 13, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 820px) {
          .about-grid { grid-template-columns: 1fr auto !important; align-items: start; }
        }
      `}</style>
    </main>
  )
}
```

- [ ] **Step 3: Criar `app/(site)/contato/loading.tsx`**

```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 80, maxWidth: 640 }}>
        <div className="skel" style={{ width: 90, height: 13 }} />
        <div className="skel" style={{ width: '55%', height: 'clamp(36px,6vw,60px)', marginTop: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          <div className="skel" style={{ width: '85%', height: 14 }} />
          <div className="skel" style={{ width: '68%', height: 14 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
          <div className="skel" style={{ width: '100%', height: 48, borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', height: 48, borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', height: 120, borderRadius: 6 }} />
          <div className="skel" style={{ width: 140, height: 44, borderRadius: 999, marginTop: 8 }} />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit e push**

```bash
git add 'mirelits/app/(site)/loading.tsx' 'mirelits/app/(site)/sobre/loading.tsx' 'mirelits/app/(site)/contato/loading.tsx'
git commit -m "feat: loading skeletons para home, sobre e contato"
git push
```

---

## Verificação manual (após deploy ou dev local)

1. Navegar entre `/`, `/sobre`, `/contato` — Header não deve piscar/re-montar
2. Navegar entre páginas no desktop — barra deve DESLIZAR suavemente para o link ativo
3. Clicar em projetos da home — skeleton deve aparecer imediatamente
4. Navegar para `/sobre` e `/contato` — skeleton deve aparecer enquanto dados carregam
5. Abrir `/admin` — admin deve continuar funcionando normalmente (sem Header público)
6. Mobile: sem regressões na navegação burger
