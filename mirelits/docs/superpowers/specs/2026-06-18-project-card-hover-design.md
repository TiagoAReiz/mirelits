---
title: Project card hover redesign — overlay escuro com texto flutuante
date: 2026-06-18
status: approved
---

## Problema

O hover dos cards de projeto na home usa um gradiente escurecido apenas na base da imagem com categoria (mono pequeno) + título (serif). O efeito é genérico e a legibilidade depende muito do conteúdo da imagem. O `subtitle` do projeto existe na base de dados e na query mas não é exibido em lado nenhum.

## Objetivo

- Substituir o gradiente inferior (`.pcard__cap`) por um overlay escuro sobre toda a imagem + texto flutuante
- Mostrar título + `categoria · subtítulo` com `text-shadow` (sem barra de fundo)
- Manter o efeito de cartas espalhadas intacto

## Abordagem

Opção C aprovada: overlay `::after` sobre `.pcard__img` + `.pcard__hover-cap` com texto branco e `text-shadow`. Apenas CSS — sem `'use client'`, sem JS.

## Mudanças

### 1. `components/project-card.tsx`

**Adicionar `subtitle` aos props desestruturados:**
```tsx
export function ProjectCard({
  id,
  title,
  subtitle,   // ← novo
  category,
  pinned,
  pinLabel,
  coverPhoto,
  photos,
  hoverStyle = 'deck',
}: ProjectCardProps)
```
(`subtitle?: string | null` já existe na interface `ProjectCardProps` — não adicionar de novo.)

**Substituir o bloco deck caption:**

Remover:
```tsx
{/* deck: always-visible overlay caption at bottom */}
{hoverStyle === 'deck' && (
  <div className="pcard__cap">
    {category && <span className="pcard__cat">{category}</span>}
    <span className="pcard__title">{title}</span>
  </div>
)}
```

Adicionar (dentro de `<div className="pcard__img">`):
```tsx
{hoverStyle === 'deck' && (
  <div className="pcard__hover-cap">
    <div className="pcard__title">{title}</div>
    {(category || subtitle) && (
      <div className="pcard__meta">
        {[category, subtitle].filter(Boolean).join(' · ')}
      </div>
    )}
  </div>
)}
```

O bloco `dark` não muda (já usa `.pcard__hover-cap`). Apenas adicionar a linha de meta também ao dark:
```tsx
{hoverStyle === 'dark' && (
  <div className="pcard__hover-cap">
    <div className="pcard__title">{title}</div>
    {(category || subtitle) && (
      <div className="pcard__meta">
        {[category, subtitle].filter(Boolean).join(' · ')}
      </div>
    )}
  </div>
)}
```

### 2. `app/(site)/page.tsx` — home page

Adicionar `subtitle` ao `<ProjectCard>`:
```tsx
<ProjectCard
  key={p.id}
  id={p.id}
  title={p.title}
  subtitle={p.subtitle}   // ← novo
  category={p.category}
  pinned={p.pinned}
  pinLabel={p.pinLabel}
  coverPhoto={p.coverPhoto}
  photos={p.photos}
  hoverStyle="deck"
/>
```

(`subtitle` já é fetched na query `getProjects()` — não alterar a query.)

### 3. `app/globals.css`

**Remover** a classe `.pcard__cap` e `.pcard__cat` inteiras (já não são usadas):
```css
/* REMOVER: */
.pcard__cap { ... }
.pcard:hover .pcard__cap { opacity: 1; }
.pcard__cat { ... }
```

**Manter** `.pcard__title` (usado em ambos os estilos).

**Adicionar `.pcard__meta`** (linha categoria · subtítulo):
```css
.pcard__meta {
  font-family: var(--ff-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 4px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}
```

**Atualizar `.pcard__hover-cap`** — adicionar `text-shadow` ao título e alinhar bottom:
```css
.pcard__hover-cap {
  position: absolute;
  bottom: 16px; left: 16px; right: 16px;
  z-index: 3;
  opacity: 0;
  color: white;
  transition: opacity .25s;
}
.pcard__title {
  font-family: var(--ff-display);
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 400;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
}
```

**Adicionar overlay para deck no hover** (dentro do bloco `@media (hover: hover)`):
```css
@media (hover: hover) {
  /* deck overlay — mesmo comportamento do dark */
  .pcard--deck:hover .pcard__img::after {
    content: '';
    position: absolute; inset: 0;
    background: oklch(0.1 0 0 / .52);
    z-index: 2;
    border-radius: var(--radius);
  }
  .pcard--deck:hover .pcard__hover-cap { opacity: 1; }

  /* dark (mantém) */
  .pcard--dark:hover .pcard__img::after {
    content: '';
    position: absolute; inset: 0;
    background: oklch(0.1 0 0 / .7);
    z-index: 2;
  }
  .pcard--dark:hover .pcard__hover-cap { opacity: 1; }
}
```

## O que NÃO muda

- Efeito de cartas espalhadas (`.pcard__deck`, transforms, opacidade)
- `hoverStyle` prop e a lógica existente
- Query `getProjects()` — `subtitle` já é fetched
- Admin, `sobre`, `contato` — não usam `ProjectCard`
