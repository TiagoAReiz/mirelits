# Loading Skeleton — Página de Projeto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar feedback visual imediato ao clicar num projeto, via skeleton animado enquanto os dados carregam.

**Architecture:** Cria `app/projeto/[id]/loading.tsx` — o Next.js App Router exibe esse arquivo automaticamente enquanto a `page.tsx` aguarda dados. Adiciona `.skel` ao CSS global (reutiliza o `@keyframes pulse` já existente). Sem dependências novas, sem Client Components.

**Tech Stack:** Next.js 16 App Router (`loading.tsx` convention), React 19, CSS inline styles + globals.css

## Global Constraints

- Sem `'use client'` no `loading.tsx` — deve ser Server Component
- Sem novas dependências
- `Header` recebe `{ name: 'mirelits', profileHue: 'laranja', socialLinks: [] }` — sem query ao banco
- `Footer` recebe `{ name: 'mirelits', profileHue: 'laranja' }` — sem query ao banco
- Reutilizar `@keyframes pulse` já existente em `globals.css` (linha ~137) — não criar novo keyframe
- Estrutura visual deve espelhar `app/projeto/[id]/page.tsx` para evitar layout shift ao carregar

---

### Task 1: Adicionar classe `.skel` ao CSS global

**Files:**
- Modify: `mirelits/app/globals.css`

**Interfaces:**
- Produces: classe `.skel` disponível globalmente — `background: var(--line); border-radius: 4px; animation: pulse 1.6s ease-in-out infinite`

---

- [ ] **Step 1: Ler o arquivo para localizar onde inserir**

```
Ler: mirelits/app/globals.css
```

Localizar o comentário `/* ---------- reduced motion ---------- */` (última seção). Inserir o bloco `.skel` ANTES dessa seção.

- [ ] **Step 2: Adicionar `.skel` antes da seção reduced motion**

Inserir imediatamente antes de `/* ---------- reduced motion ---------- */`:

```css
/* ---------- skeleton ---------- */
.skel {
  background: var(--line);
  border-radius: 4px;
  animation: pulse 1.6s ease-in-out infinite;
}
```

- [ ] **Step 3: Verificar que `@keyframes pulse` existe no arquivo**

Confirmar visualmente que `@keyframes pulse` está definido no arquivo (deve estar por volta da linha 137: `@keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`). Se não estiver, adicionar junto ao bloco `.skel`:

```css
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
```

- [ ] **Step 4: Commit**

```bash
git add mirelits/app/globals.css
git commit -m "feat: adicionar classe skel para skeleton loading"
```

---

### Task 2: Criar `loading.tsx` para a rota `/projeto/[id]`

**Files:**
- Create: `mirelits/app/projeto/[id]/loading.tsx`

**Interfaces:**
- Consumes: `.skel` de Task 1
- Consumes: `Header` de `@/components/header` — aceita `{ profile: { name: string, profileHue?: string, socialLinks?: [] } }`
- Consumes: `Footer` de `@/components/footer` — aceita `{ profile: { name: string, profileHue?: string } }`

---

- [ ] **Step 1: Criar o arquivo `loading.tsx`**

Criar `mirelits/app/projeto/[id]/loading.tsx` com o seguinte conteúdo completo:

```tsx
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Loading() {
  return (
    <>
      <Header profile={{ name: 'mirelits', profileHue: 'laranja', socialLinks: [] }} />

      <main style={{ flex: 1 }}>
        <article className="wrap" style={{ paddingTop: 'clamp(28px,5vw,52px)' }}>

          {/* back link */}
          <div className="skel" style={{ width: 120, height: 13, borderRadius: 3 }} />

          {/* project header */}
          <div style={{ marginTop: 22, maxWidth: 760, borderBottom: '1px solid var(--line)', paddingBottom: 30 }}>
            {/* category + year */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="skel" style={{ width: 88, height: 22, borderRadius: 999 }} />
              <div className="skel" style={{ width: 36, height: 14 }} />
            </div>
            {/* title */}
            <div className="skel" style={{ width: '58%', height: 'clamp(38px,7vw,68px)', marginTop: 18 }} />
            {/* subtitle */}
            <div className="skel" style={{ width: '38%', height: 20, marginTop: 14 }} />
            {/* description */}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div className="skel" style={{ width: '88%', height: 13 }} />
              <div className="skel" style={{ width: '72%', height: 13 }} />
              <div className="skel" style={{ width: '52%', height: 13 }} />
            </div>
          </div>

          {/* image placeholders */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(20px,4vw,44px)',
            marginTop: 'clamp(28px,5vw,48px)',
          }}>
            <div className="skel" style={{ width: '100%', maxWidth: 720, aspectRatio: '16 / 9', borderRadius: 6 }} />
            <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '3 / 4', borderRadius: 6 }} />
          </div>

        </article>
      </main>

      <Footer profile={{ name: 'mirelits', profileHue: 'laranja' }} />
    </>
  )
}
```

- [ ] **Step 2: Verificar estrutura do arquivo**

Ler `mirelits/app/projeto/[id]/loading.tsx` e confirmar:
- Sem `'use client'` no topo
- Importa `Header` e `Footer`
- Export default se chama `Loading`
- Nenhuma query ao banco ou import de `prisma`

- [ ] **Step 3: Commit e push**

```bash
git add mirelits/app/projeto/\[id\]/loading.tsx
git commit -m "feat: adicionar skeleton de carregamento para página de projeto"
git push
```

---

## Verificação manual (após deploy ou dev local)

1. Abrir a home e clicar num projeto — deve aparecer imediatamente o skeleton (header real + blocos cinza pulsando) antes do conteúdo real
2. Checar que o Header no skeleton exibe o nome "mirelits" com avatar placeholder (sem foto real, sem links sociais)
3. Checar que os blocos pulsam suavemente
4. Confirmar que nenhum erro aparece no console relacionado a Server/Client Component mismatch
