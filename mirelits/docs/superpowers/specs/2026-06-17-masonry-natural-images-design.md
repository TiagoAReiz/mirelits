---
title: Masonry Pinterest-style com imagens sem corte
date: 2026-06-17
status: approved
---

## Problema

As imagens na tela inicial (masonry de projetos) e na página de projeto individual estão sendo cortadas. A causa raiz é o componente `Ph`, que usa um container com `aspectRatio: 1 / ratio` travado + `Image` com `fill` + `objectFit: cover`. Quando o `ratio` salvo no banco não bate exatamente com a imagem real, a imagem é cortada para caber no container.

## Objetivo

- Tela inicial: layout Pinterest (colunas CSS masonry já existente) onde cada card exibe a imagem de capa na sua proporção real, sem corte
- Hover deck: as fotos que se espalham ao hover continuam funcionando e também exibem na proporção correta
- Página de projeto: cada foto aparece inteira, sem altura travada, na sua proporção real

## Decisão de abordagem

**Opção B — Next.js Image com `width`/`height` + `height: auto` CSS**

Adicionar prop `natural` ao componente `Ph`. Quando ativo, usa `<Image width={1000} height={ratio*1000} />` com CSS `width: 100%; height: auto` em vez do container com `aspectRatio`. O CSS masonry de colunas já suporta alturas variáveis nativamente.

Descartadas:
- `objectFit: contain` → barras de fundo visíveis, experiência ruim
- JS masonry lib → complexidade desnecessária, CSS columns já resolve

## Mudanças

### 1. `components/ph.tsx`

Adicionar prop `natural?: boolean`.

Comportamento quando `natural=true`:
- Container `.ph` não recebe `aspectRatio`
- Renderiza `<Image width={1000} height={Math.round(1000 * (ratio ?? 1))} style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 1 }} />`
- Sem `fill` prop no Image

Comportamento padrão (`natural=false` ou omitido): inalterado — mantém compatibilidade com deck spreads e outros usos existentes.

### 2. `components/project-card.tsx`

Na cover photo (elemento `pcard__img`):
```tsx
<Ph
  src={cover?.url}
  hue={cover?.hue ?? 'pedra'}
  ratio={cover?.ratio ?? 1.4}
  natural          // ← adicionar
  style={{ width: '100%' }}
/>
```

As fotos do deck (`.pcard__deck`) **não mudam** — continuam com `fill` pois são overlays absolutos sobre o card principal. O tamanho delas acompanha o card de capa automaticamente.

### 3. `app/projeto/[id]/page.tsx`

Em cada `<Ph>` dentro do map de fotos:
```tsx
<Ph
  src={im.url}
  hue={im.hue ?? 'pedra'}
  ratio={im.ratio ?? 1}
  natural          // ← adicionar
  showCap={false}
  sizes="(max-width: 760px) 100vw, 940px"
  style={{ width: '100%', borderRadius: 6, boxShadow: '...' }}
/>
```

O `figure` wrapper mantém `maxWidth` condicional (720 landscape / 940 portrait). A altura agora flui da imagem real.

## CSS

Nenhuma mudança necessária no `globals.css`. O `.mason` com `columns` já lida com alturas variáveis via `break-inside: avoid`.

## O que não muda

- Layout CSS masonry (columns 2→3→4)
- Efeito hover deck (baralho de fotos)
- Estilos do `.ph` (background, stripes, glare)
- Todos os outros usos de `Ph` no projeto
