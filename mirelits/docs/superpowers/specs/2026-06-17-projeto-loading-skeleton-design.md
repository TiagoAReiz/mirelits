---
title: Loading skeleton para página de projeto
date: 2026-06-17
status: approved
---

## Problema

Clicar em um projeto na home navega para `/projeto/[id]`, que é um Server Component que faz queries ao banco (projeto + fotos + perfil + próximo projeto). Sem `loading.tsx`, o navegador fica em branco/congelado sem nenhum feedback visual até os dados chegarem.

## Objetivo

Mostrar feedback imediato ao clique: um skeleton animado que espelha a estrutura da página de projeto, aparecendo enquanto os dados reais carregam.

## Abordagem

Criar `app/projeto/[id]/loading.tsx` — o Next.js App Router exibe automaticamente esse componente enquanto a `page.tsx` da mesma rota está aguardando dados. Zero JS de cliente, zero dependências novas.

## Mudanças

### 1. `app/globals.css` — adicionar classe `.skel` e keyframe

```css
/* ---------- skeleton ---------- */
@keyframes skel-pulse {
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0.9; }
}
.skel {
  background: var(--line);
  border-radius: 4px;
  animation: skel-pulse 1.6s ease-in-out infinite;
}
```

### 2. `app/projeto/[id]/loading.tsx` — novo arquivo

Server Component (sem `'use client'`). Estrutura:

```
<Header profile={{ name: 'mirelits', profileHue: 'laranja', socialLinks: [] }} />
<main style={{ flex: 1 }}>
  <article className="wrap" style={{ paddingTop: 'clamp(28px,5vw,52px)' }}>

    {/* ← back link */}
    <div className="skel" style={{ width: 120, height: 14, marginBottom: 22 }} />

    {/* header block */}
    <div style={{ marginTop: 22, maxWidth: 760, borderBottom: '1px solid var(--line)', paddingBottom: 30 }}>
      {/* category + year row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="skel" style={{ width: 90, height: 20, borderRadius: 999 }} />
        <div className="skel" style={{ width: 40, height: 20 }} />
      </div>
      {/* title */}
      <div className="skel" style={{ width: '58%', height: 'clamp(38px,7vw,72px)', marginTop: 18 }} />
      {/* subtitle */}
      <div className="skel" style={{ width: '38%', height: 22, marginTop: 14 }} />
      {/* description lines */}
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skel" style={{ width: '90%', height: 14 }} />
        <div className="skel" style={{ width: '75%', height: 14 }} />
        <div className="skel" style={{ width: '55%', height: 14 }} />
      </div>
    </div>

    {/* image placeholders */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(20px,4vw,44px)', marginTop: 'clamp(28px,5vw,48px)' }}>
      <div className="skel" style={{ width: '100%', maxWidth: 720, aspectRatio: '16/9', borderRadius: 6 }} />
      <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '3/4', borderRadius: 6 }} />
    </div>

  </article>
</main>
<Footer profile={{ name: 'mirelits', profileHue: 'laranja' }} />
```

### Notas

- `Header` e `Footer` recebem valores hardcoded (sem DB) — aparecem instantaneamente
- Sem `animation-delay` individual por bloco — todos pulsam em sincronia (mais simples, suficiente)
- O `loading.tsx` é descartado automaticamente assim que a `page.tsx` terminar de carregar
