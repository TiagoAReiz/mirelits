---
title: Layout persistente com Header/Footer compartilhado e sliding bar nav
date: 2026-06-17
status: approved
---

## Problema

Cada página pública (home, sobre, contato, projeto) renderiza seu próprio `<Header>` e `<Footer>`. Isso causa:
1. Re-montagem do Header em cada navegação — impossibilita efeito de barra deslizante
2. Cada página faz query separada de perfil/socialLinks só para alimentar o Header
3. Não há loading states para home, sobre e contato
4. O `loading.tsx` de `/projeto/[id]` renderiza Header/Footer hardcoded (gambiarra)

## Objetivo

- Header e Footer persistentes entre todas as rotas públicas (sem re-montar)
- Barra indicadora que DESLIZA suavemente entre os itens do nav ao navegar
- Loading skeletons para `/`, `/sobre`, `/contato`
- `loading.tsx` de `/projeto/[id]` simplificado (sem Header/Footer duplicados)

## Abordagem

Route group `(site)` com `layout.tsx` compartilhado. URLs não mudam.

## Mudanças

### 1. Estrutura de arquivos

**Criar:**
- `app/(site)/layout.tsx`
- `app/(site)/loading.tsx`
- `app/(site)/sobre/loading.tsx`
- `app/(site)/contato/loading.tsx`

**Mover** (sem alterar conteúdo principal, só remover Header/Footer/query de perfil para header):
- `app/page.tsx` → `app/(site)/page.tsx`
- `app/sobre/page.tsx` → `app/(site)/sobre/page.tsx`
- `app/contato/page.tsx` → `app/(site)/contato/page.tsx`
- `app/contato/contato-form.tsx` → `app/(site)/contato/contato-form.tsx`
- `app/projeto/[id]/page.tsx` → `app/(site)/projeto/[id]/page.tsx`
- `app/projeto/[id]/loading.tsx` → `app/(site)/projeto/[id]/loading.tsx`

**Não muda:**
- `app/layout.tsx` (root — fonts + theme)
- `app/admin/**` (intacto)
- `app/icon.tsx`

---

### 2. `app/(site)/layout.tsx` — novo arquivo

Server Component. Faz uma query ao banco para o Header/Footer. Não usa `'use client'`.

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

---

### 3. Páginas públicas — remover Header, Footer e query de socialLinks para header

Cada página movida para `(site)/` deve:
- Remover `import { Header }` e `import { Footer }`
- Remover o `<Header ... />` e `<Footer ... />` do JSX
- Remover a query `getSocialLinks()` (usada só para o Header) — se a página não usa socialLinks para seu próprio conteúdo
- O retorno da página começa diretamente com `<main style={{ flex: 1 }}>` (sem fragmento externo)

**`(site)/page.tsx`** (home): remove Header, Footer, getSocialLinks. O `<main>` fica como retorno raiz.

**`(site)/sobre/page.tsx`**: remove Header, Footer. A página usa `socialLinks` no seu próprio conteúdo (exibe redes sociais) — mantém a query de socialLinks para USO PRÓPRIO, mas não passa pro Header.

**`(site)/contato/page.tsx`**: remove Header, Footer, e a query de socialLinks (não usa no próprio conteúdo).

**`(site)/projeto/[id]/page.tsx`**: remove Header, Footer, getSocialLinks. O `<article>` fica dentro de `<main>` como retorno raiz.

---

### 4. `components/header.tsx` — sliding bar indicator

Adicionar indicador deslizante na nav desktop. O Header já é `'use client'`.

**Adicionar estado e ref:**
```tsx
const navRef = useRef<HTMLElement>(null)
const [bar, setBar] = useState({ left: 0, width: 0, ready: false })
```

**Adicionar `useEffect` que mede o link ativo:**
```tsx
useEffect(() => {
  if (!navRef.current) return
  const active = navRef.current.querySelector('[data-active="true"]') as HTMLElement | null
  if (!active) return
  const navRect = navRef.current.getBoundingClientRect()
  const linkRect = active.getBoundingClientRect()
  setBar({ left: linkRect.left - navRect.left, width: linkRect.width, ready: true })
}, [pathname])
```

**Nos links do nav desktop**, adicionar `data-active={active ? 'true' : undefined}` e remover o `borderBottom` inline (o indicador compartilhado o substitui).

**Adicionar `ref={navRef}` na `<nav>`** desktop e `position: 'relative'` nela.

**Adicionar o indicador `<span>` dentro da `<nav>`:**
```tsx
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
```

---

### 5. Loading states — apenas `<main>` (Header/Footer vêm do layout)

**`app/(site)/loading.tsx`** (home):
```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <section className="wrap" style={{ paddingTop: 'clamp(36px,7vw,80px)', paddingBottom: 'clamp(28px,5vw,52px)' }}>
        {/* hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
            <div className="skel" style={{ width: 80, height: 14 }} />
            <div className="skel" style={{ width: '55%', height: 'clamp(44px,9vw,88px)' }} />
            <div className="skel" style={{ width: '45%', height: 22, marginTop: 4 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div className="skel" style={{ width: '85%', height: 14 }} />
              <div className="skel" style={{ width: '70%', height: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <div className="skel" style={{ width: 120, height: 38, borderRadius: 999 }} />
              <div className="skel" style={{ width: 140, height: 38, borderRadius: 999 }} />
            </div>
          </div>
          <div className="skel" style={{ width: 'clamp(130px,34vw,220px)', aspectRatio: '1', borderRadius: '50%', flexShrink: 0 }} />
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 22, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <div className="skel" style={{ width: 180, height: 28 }} />
          <div className="skel" style={{ width: 60, height: 14 }} />
        </div>
        {/* masonry cards skeleton — 2 colunas simplificadas */}
        <div style={{ columns: 'var(--mason-cols, 3)', columnGap: 14, marginBlock: 40 }}>
          {[1.4, 0.75, 1.1, 0.6, 1.6, 1.0].map((ratio, i) => (
            <div key={i} className="skel" style={{ marginBottom: 14, borderRadius: 4, aspectRatio: `1 / ${ratio}`, breakInside: 'avoid' }} />
          ))}
        </div>
      </section>
    </main>
  )
}
```

**`app/(site)/sobre/loading.tsx`**:
```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,7vw,80px)', paddingBottom: 'clamp(28px,5vw,52px)', maxWidth: 760 }}>
        <div className="skel" style={{ width: 80, height: 14 }} />
        <div className="skel" style={{ width: '50%', height: 'clamp(36px,6vw,60px)', marginTop: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 24 }}>
          {[90, 75, 80, 65].map((w, i) => (
            <div key={i} className="skel" style={{ width: `${w}%`, height: 14 }} />
          ))}
        </div>
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div className="skel" style={{ width: 60, height: 14, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skel" style={{ width: '60%', height: 16 }} />
                <div className="skel" style={{ width: '80%', height: 13 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
```

**`app/(site)/contato/loading.tsx`**:
```tsx
export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,7vw,80px)', paddingBottom: 'clamp(28px,5vw,52px)', maxWidth: 640 }}>
        <div className="skel" style={{ width: 80, height: 14 }} />
        <div className="skel" style={{ width: '55%', height: 'clamp(36px,6vw,60px)', marginTop: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
          <div className="skel" style={{ width: '88%', height: 14 }} />
          <div className="skel" style={{ width: '70%', height: 14 }} />
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

**`app/(site)/projeto/[id]/loading.tsx`** — versão simplificada do atual (remove Header/Footer):
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(20px,4vw,44px)', marginTop: 'clamp(28px,5vw,48px)' }}>
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

---

## O que NÃO muda

- URLs (route groups são invisíveis)
- `app/layout.tsx` (root)
- `app/admin/**`
- Componentes `Header`, `Footer`, `Ph`, `ProjectCard`, etc. — exceto a adição do sliding bar no `Header`
- CSS em `globals.css` — exceto eventuais ajustes de posicionamento para a `<nav>` relativa
