# CustomSelect — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um componente `<CustomSelect>` com dropdown customizado e usá-lo na seleção de fontes (prévia na própria fonte) e na seleção de plataforma nas redes sociais (ícone + nome).

**Architecture:** Componente client-side puro com estado local (`open`), listener de click-fora via `useEffect`, e opções renderizadas com `style` (para fontes) ou `icon` (para redes). Sem dependências externas. Integrado em dois pontos do `config-editor.tsx` existente.

**Tech Stack:** React 19, Next.js 16 (App Router), TypeScript, CSS custom properties do projeto (`var(--ink)`, `var(--acc-1)`, etc.).

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `components/custom-select.tsx` | Criar | Componente CustomSelect completo |
| `app/admin/configuracoes/config-editor.tsx` | Modificar | Usar CustomSelect em fontes e redes sociais |

---

## Task 1: Criar `components/custom-select.tsx`

**Files:**
- Create: `components/custom-select.tsx`

- [ ] **Passo 1: Criar o arquivo com o conteúdo completo**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  style?: React.CSSProperties
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function CustomSelect({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          background: 'var(--paper)',
          border: `1px solid ${open ? 'var(--acc-1)' : 'var(--line)'}`,
          borderRadius: 'var(--radius)',
          boxShadow: open
            ? '0 0 0 3px color-mix(in oklch, var(--acc-1) 18%, transparent)'
            : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          color: 'var(--ink)',
          fontSize: 15,
          fontFamily: 'var(--ff-body)',
        }}
      >
        {selected?.icon && (
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--acc-1)' }}>
            {selected.icon}
          </span>
        )}
        <span style={{ flex: 1, ...(selected?.style ?? {}) }}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        <span style={{ color: 'var(--ink-soft)', fontSize: 11, flexShrink: 0 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            boxShadow: '0 4px 16px color-mix(in oklch, var(--ink) 10%, transparent)',
            zIndex: 100,
            maxHeight: 260,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--line) transparent',
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: isActive
                    ? 'color-mix(in oklch, var(--acc-1) 6%, var(--paper))'
                    : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? 'var(--acc-1)' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--ink)',
                  fontFamily: 'var(--ff-body)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = 'var(--line-soft)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {opt.icon && (
                  <span style={{ display: 'flex', flexShrink: 0, color: 'var(--acc-1)' }}>
                    {opt.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      ...(opt.style ?? {}),
                      fontSize: opt.style ? 17 : 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {opt.label}
                  </span>
                  {opt.style && (
                    <span
                      style={{
                        display: 'block',
                        ...(opt.style ?? {}),
                        fontStyle: 'italic',
                        fontSize: 12,
                        color: 'var(--ink-soft)',
                        marginTop: 2,
                      }}
                    >
                      Aa
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Passo 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Saída esperada: nenhum erro.

- [ ] **Passo 3: Commit**

```bash
git add components/custom-select.tsx
git commit -m "feat: componente CustomSelect com dropdown e prévia visual"
```

---

## Task 2: Integrar CustomSelect no `config-editor.tsx`

**Files:**
- Modify: `app/admin/configuracoes/config-editor.tsx`

### Passo 1 — Adicionar o import do CustomSelect

No topo do arquivo, após os imports existentes, adicionar:

```ts
import { CustomSelect } from '@/components/custom-select'
```

O bloco de imports completo ficará assim:

```ts
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SocialIcon, SOCIAL_PLATFORMS } from '@/components/social-icon'
import { FONT_REGISTRY, type FontKey } from '@/lib/font-registry'
import { CustomSelect } from '@/components/custom-select'
```

### Passo 2 — Substituir o picker de fontes (cards → 3 selects em linha)

Localizar o bloco do picker de fontes no JSX (as linhas que contêm o `.map` sobre os slots de fonte com os cards de botão):

```tsx
          {(
            [
              { label: 'TÍTULOS',    profileKey: 'fontDisplay'  as const, cssVar: '--ff-display',  defaultKey: 'newsreader' },
              { label: 'SUBTÍTULOS', profileKey: 'fontSubtitle' as const, cssVar: '--ff-subtitle', defaultKey: 'newsreader' },
              { label: 'CORPO',      profileKey: 'fontBody'     as const, cssVar: '--ff-body',     defaultKey: 'hanken'     },
            ] as const
          ).map(({ label, profileKey, cssVar, defaultKey }) => (
            <div key={profileKey} style={{ marginBottom: 20 }}>
              <span className="label" style={{ display: 'block', marginBottom: 10 }}>{label}</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {FONT_OPTIONS.map((opt) => {
                  const active = (profile[profileKey] ?? defaultKey) === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => applyFont(profileKey, cssVar, opt.key as FontKey)}
                      style={{
                        fontFamily: `var(${opt.cssVar}), ${opt.fallback}`,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `2px solid ${active ? 'var(--acc-1)' : 'var(--line)'}`,
                        background: active
                          ? 'color-mix(in oklch, var(--acc-1) 8%, var(--paper))'
                          : 'var(--paper)',
                        cursor: 'pointer',
                        minWidth: 110,
                        textAlign: 'left' as const,
                        transition: 'border-color .15s, background .15s',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 3 }}>
                        Aa
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
```

Substituir por:

```tsx
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {(
              [
                { label: 'TÍTULOS',    profileKey: 'fontDisplay'  as const, cssVar: '--ff-display',  defaultKey: 'newsreader' },
                { label: 'SUBTÍTULOS', profileKey: 'fontSubtitle' as const, cssVar: '--ff-subtitle', defaultKey: 'newsreader' },
                { label: 'CORPO',      profileKey: 'fontBody'     as const, cssVar: '--ff-body',     defaultKey: 'hanken'     },
              ] as const
            ).map(({ label, profileKey, cssVar, defaultKey }) => (
              <div key={profileKey} style={{ flex: '1 1 160px', minWidth: 160 }}>
                <span className="label" style={{ display: 'block', marginBottom: 8 }}>{label}</span>
                <CustomSelect
                  value={profile[profileKey] ?? defaultKey}
                  onChange={(val) => applyFont(profileKey, cssVar, val as FontKey)}
                  options={FONT_OPTIONS.map((f) => ({
                    value: f.key,
                    label: f.label,
                    style: { fontFamily: `var(${f.cssVar}), ${f.fallback}` },
                  }))}
                />
              </div>
            ))}
          </div>
```

### Passo 3 — Substituir o `<select>` nativo das redes sociais

Localizar no JSX da seção de redes sociais o elemento:

```tsx
                <select className="field" style={{ width: 140, padding: '8px 10px', fontSize: 13 }}
                  value={s.platform}
                  onChange={(e) => updateSocial(s.id, { platform: e.target.value, label: SOCIAL_PLATFORMS.find(p => p.value === e.target.value)?.label ?? s.label })}>
                  {SOCIAL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
```

Substituir por:

```tsx
                <div style={{ width: 160, flexShrink: 0 }}>
                  <CustomSelect
                    value={s.platform}
                    onChange={(val) => updateSocial(s.id, {
                      platform: val,
                      label: SOCIAL_PLATFORMS.find((p) => p.value === val)?.label ?? s.label,
                    })}
                    options={SOCIAL_PLATFORMS.map((p) => ({
                      value: p.value,
                      label: p.label,
                      icon: <SocialIcon platform={p.value} size={16} />,
                    }))}
                  />
                </div>
```

- [ ] **Passo 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Saída esperada: nenhum erro.

- [ ] **Passo 5: Commit**

```bash
git add app/admin/configuracoes/config-editor.tsx
git commit -m "feat: usar CustomSelect em fontes e redes sociais"
```
