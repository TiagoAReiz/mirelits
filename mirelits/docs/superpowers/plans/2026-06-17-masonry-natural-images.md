# Masonry Pinterest-style com imagens sem corte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar imagens sem corte na home masonry e na página de projeto, adicionando prop `natural` ao componente `Ph`.

**Architecture:** Adiciona prop `natural?: boolean` ao `Ph` que, quando ativo, troca `fill` + `aspectRatio` travado por `width`/`height` hint + CSS `height: auto`. Mudanças em 3 arquivos; sem alteração de CSS nem de lógica de negócio.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS columns masonry (já existente), `next/image`

## Global Constraints

- Next.js versão 16.2.9 — ler `node_modules/next/dist/docs/` se houver dúvida de API
- Sem tailwind: todos os estilos são inline ou via `globals.css`
- `ratio` é `height / width` (portrait = maior que 1, landscape = menor que 1)
- Não adicionar dependências novas
- Não alterar `globals.css`
- Não alterar os usos de `Ph` com `fill={true}` (deck spreads, etc.) — comportamento atual se mantém

---

### Task 1: Adicionar prop `natural` ao componente `Ph`

**Files:**
- Modify: `mirelits/components/ph.tsx`

**Interfaces:**
- Produces: prop `natural?: boolean` em `PhProps`; quando `true`, renderiza `<Image>` sem `fill`, com `width={1000}` e `height={Math.round(1000 * (ratio ?? 1))}` e `style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 1 }}`; container `.ph` não recebe `aspectRatio`

---

- [ ] **Step 1: Ler o arquivo atual**

```
Ler: mirelits/components/ph.tsx
```

Confirmar que a interface `PhProps` existe e que o único render com `src` usa `fill` + `aspectRatio`.

- [ ] **Step 2: Adicionar `natural` à interface e ao render**

Substituir o conteúdo de `ph.tsx` por:

```tsx
import { HUES } from '@/lib/constants'
import Image from 'next/image'

interface PhProps {
  hue?: string
  ratio?: number
  cap?: string
  src?: string | null
  className?: string
  style?: React.CSSProperties
  showCap?: boolean
  angle?: number
  fill?: boolean
  natural?: boolean
  sizes?: string
}

export function Ph({
  hue = 'pedra',
  ratio,
  cap,
  src,
  className = '',
  style = {},
  showCap = true,
  angle,
  fill,
  natural,
  sizes = '(max-width: 760px) 100vw, 50vw',
}: PhProps) {
  const h = HUES[hue] ?? HUES.pedra

  const st: React.CSSProperties = {
    '--ph-base': h.base,
    '--ph-stripe': h.stripe,
    ...(angle != null ? { '--ph-angle': `${angle}deg` } : {}),
    ...(ratio != null && !fill && !natural ? { aspectRatio: `1 / ${ratio}` } : {}),
    ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
    ...style,
  } as React.CSSProperties

  if (src) {
    if (natural) {
      return (
        <div className={`ph ${className}`} style={st}>
          <Image
            src={src}
            alt={cap ?? ''}
            width={1000}
            height={Math.round(1000 * (ratio ?? 1))}
            sizes={sizes}
            style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 1, display: 'block' }}
          />
        </div>
      )
    }

    return (
      <div className={`ph ${className}`} style={st}>
        <Image
          src={src}
          alt={cap ?? ''}
          fill
          sizes={sizes}
          style={{ objectFit: 'cover', zIndex: 1 }}
        />
      </div>
    )
  }

  return (
    <div className={`ph ${className}`} style={st}>
      {showCap && cap ? <span className="ph-cap">{cap}</span> : null}
    </div>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd mirelits && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros em `components/ph.tsx`.

- [ ] **Step 4: Commit**

```bash
cd mirelits && git add components/ph.tsx
git commit -m "feat: adicionar prop natural ao Ph para exibir imagem sem corte"
```

---

### Task 2: Atualizar `ProjectCard` para usar `natural` na cover photo

**Files:**
- Modify: `mirelits/components/project-card.tsx`

**Interfaces:**
- Consumes: `natural` prop de `Ph` (Task 1)

---

- [ ] **Step 1: Ler o arquivo atual**

```
Ler: mirelits/components/project-card.tsx
```

Localizar o `<Ph>` dentro de `<div className="pcard__img">` (cover photo). Confirmar que NÃO usa `fill`.

- [ ] **Step 2: Adicionar `natural` na cover photo**

No `<Ph>` dentro de `<div className="pcard__img">` (aproximadamente linha 71), adicionar a prop `natural`:

```tsx
{/* cover */}
<div className="pcard__img">
  {pinned && (
    <span className="pcard__pin">{pinLabel || 'Destaque'}</span>
  )}
  <Ph
    src={cover?.url}
    hue={cover?.hue ?? 'pedra'}
    ratio={cover?.ratio ?? 1.4}
    natural
    style={{ width: '100%' }}
  />
  {/* ... restante sem alteração ... */}
</div>
```

Os `<Ph>` dentro de `.pcard__deck` (deck spreads) **não mudam** — eles usam `fill` explicitamente e devem continuar assim.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd mirelits && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
cd mirelits && git add components/project-card.tsx
git commit -m "feat: usar natural no ProjectCard para exibir capa sem corte"
```

---

### Task 3: Atualizar página de projeto para exibir fotos sem corte

**Files:**
- Modify: `mirelits/app/projeto/[id]/page.tsx`

**Interfaces:**
- Consumes: `natural` prop de `Ph` (Task 1)

---

- [ ] **Step 1: Ler o arquivo atual**

```
Ler: mirelits/app/projeto/[id]/page.tsx
```

Localizar o `map` de `project.photos` (aproximadamente linha 126) e o `<Ph>` dentro do `<figure>`.

- [ ] **Step 2: Adicionar `natural` nos `<Ph>` das fotos**

Substituir o bloco do `<Ph>` dentro do `map` (mantendo o resto do `figure` intacto):

```tsx
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
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd mirelits && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 4: Build de verificação**

```bash
cd mirelits && npx next build 2>&1 | tail -20
```

Esperado: build completo sem erros. Se falhar por falta de env vars de DB, ok — o que importa é não ter erro de TypeScript/JSX.

- [ ] **Step 5: Commit e push**

```bash
cd mirelits && git add app/projeto/\[id\]/page.tsx
git commit -m "feat: exibir fotos do projeto sem corte de altura"
git push
```

---

## Verificação manual (após deploy ou dev local)

1. Abrir a home `/` — checar que cards no masonry têm alturas variadas (Pinterest), sem imagens cortadas
2. Hover em qualquer card — confirmar efeito baralho ainda funciona
3. Abrir um projeto `/projeto/[id]` — checar que as fotos aparecem completas, sem corte
4. Checar em mobile (< 760px) — masonry deve ter 2 colunas, imagens sem corte
