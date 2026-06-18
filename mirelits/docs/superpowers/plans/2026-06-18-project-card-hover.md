# Project Card Hover Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o gradiente inferior dos cards por um overlay escuro + texto flutuante com `text-shadow`, mostrando título e `categoria · subtítulo`.

**Architecture:** Duas alterações independentes mas acopladas: (1) CSS em `globals.css` define as regras visuais; (2) `project-card.tsx` e a home page consomem essas classes. Sem JS novo, sem dependências, sem `'use client'`.

**Tech Stack:** Next.js 16 App Router, React 19, CSS (globals.css), TypeScript

## Global Constraints

- Sem novas dependências
- Sem `'use client'` (componente já é Server Component — não alterar)
- O efeito de cartas espalhadas (`.pcard__deck`, transforms) não é tocado
- `@media (hover: hover)` deve envolver todos os efeitos de hover (já existente)
- Nomes de classes CSS devem corresponder exatamente ao JSX

---

### Task 1: Atualizar CSS do card hover em `globals.css`

**Files:**
- Modify: `mirelits/app/globals.css` (linhas 195–260)

**Interfaces:**
- Produces: classes `.pcard__hover-cap`, `.pcard__title`, `.pcard__meta` prontas para o JSX da Task 2

---

- [ ] **Step 1: Ler o arquivo para confirmar contexto**

```
Ler: mirelits/app/globals.css (linhas 183–261)
```

Confirmar que `.pcard__cap` está na linha ~195, `.pcard__cat` na ~208, e o bloco `@media (hover: hover)` na ~240.

- [ ] **Step 2: Remover `.pcard__cap`, `.pcard:hover .pcard__cap` e `.pcard__cat`**

Substituir o bloco das linhas 195–214:

```css
.pcard__cap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 2;
  padding: 40px 12px 12px;
  background: linear-gradient(to top, oklch(0.08 0 0 / .78) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 3px;
  opacity: 0;
  transition: opacity .22s ease;
}
.pcard:hover .pcard__cap { opacity: 1; }
.pcard__cat {
  font-family: var(--ff-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}
```

por (vazio — apagar estas regras completamente). Resultado: `.pcard__title` passa a ser a primeira regra após `.pcard__pin`.

- [ ] **Step 3: Adicionar `text-shadow` ao `.pcard__title` e adicionar `.pcard__meta`**

Substituir o bloco `.pcard__title` atual:

```css
.pcard__title {
  font-family: var(--ff-display);
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 400;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.95);
}
```

por:

```css
.pcard__title {
  font-family: var(--ff-display);
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 400;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
}
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

- [ ] **Step 4: Adicionar overlay deck e show da hover-cap no bloco `@media (hover: hover)`**

Substituir o bloco `@media (hover: hover)` atual:

```css
@media (hover: hover) {
  .pcard--deck:hover { z-index: 10; }
  .pcard--deck:hover .pcard__deck {
    opacity: 1;
    transform: translateX(var(--dx)) translateY(calc(-1 * var(--dy))) rotate(var(--dr));
  }
  .pcard--deck:hover .pcard__img { transform: translateY(-12px) rotate(-4deg); }

  .pcard--dark:hover .pcard__img::after {
    content: '';
    position: absolute; inset: 0;
    background: oklch(0.1 0 0 / .7);
    z-index: 2;
  }
  .pcard--dark:hover .pcard__hover-cap { opacity: 1; }
}
```

por:

```css
@media (hover: hover) {
  .pcard--deck:hover { z-index: 10; }
  .pcard--deck:hover .pcard__deck {
    opacity: 1;
    transform: translateX(var(--dx)) translateY(calc(-1 * var(--dy))) rotate(var(--dr));
  }
  .pcard--deck:hover .pcard__img { transform: translateY(-12px) rotate(-4deg); }
  .pcard--deck:hover .pcard__img::after {
    content: '';
    position: absolute; inset: 0;
    background: oklch(0.1 0 0 / .52);
    z-index: 2;
    border-radius: var(--radius);
  }
  .pcard--deck:hover .pcard__hover-cap { opacity: 1; }

  .pcard--dark:hover .pcard__img::after {
    content: '';
    position: absolute; inset: 0;
    background: oklch(0.1 0 0 / .7);
    z-index: 2;
  }
  .pcard--dark:hover .pcard__hover-cap { opacity: 1; }
}
```

- [ ] **Step 5: Verificar que `.pcard__hover-cap` tem `z-index: 3`**

Confirmar que o bloco `.pcard__hover-cap` (após o `@media`) está assim:

```css
.pcard__hover-cap {
  position: absolute; bottom: 16px; left: 16px; right: 16px;
  z-index: 3; opacity: 0; color: white;
  transition: opacity .25s;
}
```

Se estiver diferente, atualizar para este valor exato.

- [ ] **Step 6: Commit**

```bash
git add mirelits/app/globals.css
git commit -m "feat: redesign hover dos cards — overlay escuro com texto flutuante"
```

---

### Task 2: Atualizar `ProjectCard` e home page

**Files:**
- Modify: `mirelits/components/project-card.tsx`
- Modify: `mirelits/app/(site)/page.tsx`

**Interfaces:**
- Consumes: `.pcard__hover-cap`, `.pcard__title`, `.pcard__meta` da Task 1
- Produces: `ProjectCard` com `subtitle` prop visível no hover

---

- [ ] **Step 1: Ler o arquivo do componente**

```
Ler: mirelits/components/project-card.tsx
```

Confirmar que `subtitle?: string | null` já existe na interface `ProjectCardProps` (linha ~21) mas NÃO está nos parâmetros desestruturados da função (linha ~30–39).

- [ ] **Step 2: Adicionar `subtitle` à desestruturação**

Substituir:

```tsx
export function ProjectCard({
  id,
  title,
  category,
  pinned,
  pinLabel,
  coverPhoto,
  photos,
  hoverStyle = 'deck',
}: ProjectCardProps) {
```

por:

```tsx
export function ProjectCard({
  id,
  title,
  subtitle,
  category,
  pinned,
  pinLabel,
  coverPhoto,
  photos,
  hoverStyle = 'deck',
}: ProjectCardProps) {
```

- [ ] **Step 3: Substituir o bloco de caption do deck**

Substituir:

```tsx
        {/* deck: always-visible overlay caption at bottom */}
        {hoverStyle === 'deck' && (
          <div className="pcard__cap">
            {category && <span className="pcard__cat">{category}</span>}
            <span className="pcard__title">{title}</span>
          </div>
        )}
```

por:

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

- [ ] **Step 4: Atualizar o bloco de caption do dark**

Substituir:

```tsx
        {/* dark: caption appears on hover */}
        {hoverStyle === 'dark' && (
          <div className="pcard__hover-cap">
            <div className="label" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{category}</div>
            <div className="serif" style={{ fontSize: 'clamp(15px, 2vw, 20px)' }}>{title}</div>
          </div>
        )}
```

por:

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

- [ ] **Step 5: Ler a home page**

```
Ler: mirelits/app/(site)/page.tsx
```

Localizar o `<ProjectCard ... />` dentro do `projects.map(...)`. Confirmar que `subtitle` NÃO está sendo passado.

- [ ] **Step 6: Adicionar `subtitle` ao `<ProjectCard>` na home page**

Localizar:

```tsx
            <ProjectCard
              key={p.id}
              id={p.id}
              title={p.title}
              category={p.category}
```

Substituir por:

```tsx
            <ProjectCard
              key={p.id}
              id={p.id}
              title={p.title}
              subtitle={p.subtitle}
              category={p.category}
```

(`p.subtitle` já está disponível — a query `getProjects()` já faz `select: { ..., subtitle: true, ... }`. Não alterar a query.)

- [ ] **Step 7: Commit e push**

```bash
git add mirelits/components/project-card.tsx mirelits/app/'(site)'/page.tsx
git commit -m "feat: mostrar subtitle no hover dos cards e usar novo overlay"
git push
```

---

## Verificação manual (após deploy ou dev local)

1. Abrir a home — passar o rato sobre um card: deve aparecer overlay escuro + título + `categoria · subtítulo`
2. Verificar que o efeito de cartas espalhadas continua a funcionar
3. Confirmar que cards sem subtítulo mostram apenas o título (sem ` · ` extra)
4. Confirmar que em mobile (sem hover) nada aparece sobreposto — as imagens ficam limpas
