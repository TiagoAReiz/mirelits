# Design: Componente CustomSelect

**Data:** 2026-06-15  
**Status:** Aprovado

---

## Resumo

Criar um componente `<CustomSelect>` customizado (dropdown sem dependências externas) e usá-lo em dois lugares no painel admin: seleção de fontes (cada opção renderizada na própria fonte) e seleção de plataforma nas redes sociais (ícone + nome por opção). Substitui os 8 cards de fonte atuais e o `<select>` nativo das redes.

---

## Motivação

O select nativo do browser não suporta renderizar opções em fontes diferentes nem mostrar ícones. O picker atual de fontes usa cards grandes que ocupam muito espaço. Um dropdown customizado resolve ambos os problemas com uma API reutilizável.

---

## API do componente

```ts
interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode      // para redes sociais
  style?: React.CSSProperties // para fontes (fontFamily na opção)
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}
```

**Uso para fontes:**
```tsx
<CustomSelect
  value={profile.fontDisplay ?? 'newsreader'}
  onChange={(val) => applyFont('fontDisplay', '--ff-display', val as FontKey)}
  options={FONT_OPTIONS.map(f => ({
    value: f.key,
    label: f.label,
    style: { fontFamily: `var(${f.cssVar}), ${f.fallback}` },
  }))}
/>
```

**Uso para redes sociais:**
```tsx
<CustomSelect
  value={s.platform}
  onChange={(val) => updateSocial(s.id, {
    platform: val,
    label: SOCIAL_PLATFORMS.find(p => p.value === val)?.label ?? s.label,
  })}
  options={SOCIAL_PLATFORMS.map(p => ({
    value: p.value,
    label: p.label,
    icon: <SocialIcon platform={p.value} size={16} />,
  }))}
/>
```

---

## Visual

### Trigger (fechado)
- Estilo igual ao `.field` existente: borda `var(--line)`, fundo `var(--paper)`, `border-radius: var(--radius)`
- Conteúdo: ícone (se houver) + label da opção selecionada (no `style` da opção, se houver) + chevron `▾` à direita
- Ao abrir: borda `var(--acc-1)` + glow `box-shadow: 0 0 0 3px color-mix(in oklch, var(--acc-1) 18%, transparent)` (igual ao `.field:focus`)

### Dropdown (aberto)
- Posição: abaixo do trigger, mesma largura, `position: absolute`
- Fundo: `var(--paper)`, borda `1px solid var(--line)`, `border-radius: 8px`, sombra leve
- `z-index: 100`
- `max-height: 260px`, `overflow-y: auto` com scrollbar fina (`.hscroll`)
- Fecha ao clicar fora (listener no `document`)

### Opções
- **Fontes:** label renderizado com o `style` da opção (~17px) + linha "Aa" em itálico em `var(--ink-soft)` abaixo
- **Redes:** ícone 16px + label na mesma linha, `display: flex; align-items: center; gap: 8px`
- Hover: `background: var(--line-soft)`
- Selecionada: barra lateral `3px solid var(--acc-1)` + `background: color-mix(in oklch, var(--acc-1) 6%, var(--paper))`

---

## Integração

### Fontes (`config-editor.tsx`)
- Remove o bloco atual com os 8 botões por slot (o `.map` sobre `FONT_OPTIONS` no JSX)
- Substitui por 3 `<CustomSelect>` com label acima (`.label`) e layout `display: flex; gap: 16px; flex-wrap: wrap`
- `onChange` chama `applyFont` existente — lógica de save não muda

### Redes sociais (`config-editor.tsx`)
- Remove o `<select className="field" style={{ width: 140 }}>` nativo
- Substitui por `<CustomSelect>` com as mesmas dimensões aproximadas
- `onChange` chama `updateSocial` existente

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `components/custom-select.tsx` | Criar — o componente |
| `app/admin/configuracoes/config-editor.tsx` | Modificar — usar CustomSelect nos dois lugares |

---

## Fora do escopo

- Acessibilidade via teclado (arrow keys, escape) — pode ser adicionada depois
- Animação de abertura/fechamento do dropdown
- Busca/filtro dentro do dropdown
- Uso fora do painel admin
