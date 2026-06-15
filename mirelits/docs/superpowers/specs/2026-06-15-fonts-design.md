# Design: Sistema de Fontes Configuráveis

**Data:** 2026-06-15  
**Status:** Aprovado

---

## Resumo

Adicionar 3 slots de fonte configuráveis pelo admin (Títulos, Subtítulos, Corpo), com prévia visual no painel de configurações. O painel admin herda as fontes escolhidas automaticamente, igual ao comportamento já existente para cores.

---

## Slots e fontes disponíveis

Três slots independentes. A mesma lista de 8 fontes está disponível em todos os slots. A fonte mono (Space Mono), usada em botões e labels de UI, não é alterável.

| Slot | CSS var | Padrão (quando null no DB) |
|---|---|---|
| Títulos | `--ff-display` | Newsreader |
| Subtítulos | `--ff-subtitle` (nova) | Newsreader |
| Corpo | `--ff-body` | Hanken Grotesk |

**Fontes disponíveis:**

| Chave | Nome | Estilo |
|---|---|---|
| `newsreader` | Newsreader | Serif elegante (padrão de títulos) |
| `playfair` | Playfair Display | Serif clássico editorial |
| `cormorant` | Cormorant Garamond | Serif fino e delicado |
| `lora` | Lora | Serif literário |
| `hanken` | Hanken Grotesk | Sans moderno (padrão de corpo) |
| `inter` | Inter | Sans neutro e limpo |
| `dm-sans` | DM Sans | Sans suave |
| `jakarta` | Plus Jakarta Sans | Sans geométrico |

---

## Banco de dados

Três campos opcionais adicionados ao modelo `ArtistProfile`:

```prisma
fontDisplay  String?   // null → usa padrão "newsreader"
fontSubtitle String?   // null → usa padrão "newsreader"
fontBody     String?   // null → usa padrão "hanken"
```

Migração Prisma necessária. Sem criar nova rota — os campos são adicionados ao payload da rota existente `PUT /api/admin/artist-profile/meta`.

---

## Carregamento e aplicação

### `layout.tsx`

1. Importar as 8 fontes via `next/font/google` (hoje só 3 são importadas). Cada fonte recebe uma CSS variable própria (ex: `--font-playfair`).
2. `getTheme()` passa a buscar `fontDisplay`, `fontSubtitle`, `fontBody` além das cores.
3. Montar bloco `<style>:root { ... }</style>` com as vars de fonte resolvidas, ex:
   ```css
   --ff-display:  var(--font-playfair), Georgia, serif;
   --ff-subtitle: var(--font-hanken), system-ui, sans-serif;
   --ff-body:     var(--font-inter), system-ui, sans-serif;
   ```
4. A lógica de resolução: dada a chave salva no DB (ex: `"playfair"`), mapear para `var(--font-playfair)` + fallback correto (serif ou sans conforme o tipo da fonte).

### `globals.css`

- Adicionar `--ff-subtitle` ao bloco `:root` com valor padrão igual a `--ff-display`.
- Aplicar `--ff-subtitle` explicitamente em `h2`, `h3` (hoje herdam implicitamente de `--ff-display`).

### Admin herda automaticamente

O admin usa `--ff-display` e `--ff-body` nos seus elementos visuais. Como essas vars são sobrescritas em `:root` pelo layout, o painel reflete as fontes escolhidas sem nenhum código extra.

---

## UI de configuração (`config-editor.tsx`)

Nova seção "Fontes do site" seguindo o mesmo padrão visual das seções de cores.

### Estrutura

Para cada slot (Títulos, Subtítulos, Corpo), uma grade de 8 cards. Cada card exibe:
- Nome da fonte escrito na própria fonte (`font-family: var(--font-X)` inline), tamanho ~20px
- Linha menor com "Aa" em itálico para sentir estilo

Card ativo tem borda destacada (igual aos temas de cores).

### Interatividade

- Clicar num card aplica a font var em `document.documentElement.style` em tempo real (mesma técnica do `applyColor` existente).
- O site e o admin mudam instantaneamente na pré-visualização.
- Só persiste ao clicar em "Salvar fontes".

### Estado e save

- Novo slot `'fonts'` no objeto `sec` (seções de save state).
- `saveFonts()` faz PUT para `/api/admin/artist-profile/meta` com `{ fontDisplay, fontSubtitle, fontBody }`.
- "Salvar tudo" inclui `saveFonts()` no `Promise.all`.

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `prisma/schema.prisma` | +3 campos em `ArtistProfile` |
| `prisma/migrations/` | nova migração gerada |
| `app/layout.tsx` | +5 font imports, `getTheme` ampliado, vars de fonte no `<style>` |
| `app/globals.css` | `--ff-subtitle` no `:root`, aplicar em `h2`/`h3` |
| `app/api/admin/artist-profile/meta/route.ts` | aceitar e persistir 3 campos novos |
| `app/admin/configuracoes/config-editor.tsx` | nova seção "Fontes do site" |

---

## Fora do escopo

- Fonte de UI/mono (Space Mono) — não configurável por decisão do design
- Fonts além da lista curada de 8 — requer novo import no `layout.tsx` para adicionar
- Preview ao vivo na página pública em outra aba — o preview acontece no próprio admin
