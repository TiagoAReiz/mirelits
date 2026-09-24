# mirelits — portfólio de ilustração e quadrinhos

Site de portfólio feito sob medida para **Mirela (mirelits)**, ilustradora e quadrinista. É um projeto para cliente: a artista gerencia sozinha o conteúdo do site por uma área administrativa, sem depender de desenvolvedor.

**Site no ar:** https://mirelits.vercel.app

## Funcionalidades

### Site público
- **Início** — galeria em masonry com os projetos publicados, respeitando a proporção natural das imagens, com projetos fixados em destaque e hover com título/subtítulo.
- **Projeto** (`/projeto/[id]`) — página de cada trabalho com galeria de fotos, categoria, ano e descrição.
- **Sobre** (`/sobre`) — bio, foto de perfil, linha do tempo da carreira e redes sociais.
- **Contato** (`/contato`) — formulário que envia e-mail para a artista via Resend.
- Cabeçalho persistente entre páginas e skeletons de carregamento em cada rota.
- Identidade visual (paleta de cores e fontes) configurável pelo painel e aplicada em tempo de execução.

### Área administrativa (`/admin`)
- Login com Google (Auth.js), restrito a uma lista de e-mails autorizados.
- CRUD de projetos com status rascunho/publicado, ordenação e projetos fixados.
- Upload, ordenação e remoção de fotos (Supabase Storage), com escolha de capa.
- Edição do perfil da artista: bio curta e completa, foto, logo, cores e fontes do site.
- Gestão da linha do tempo e dos links de redes sociais.

## Stack

- **Next.js 16** (App Router, Server Components, Route Handlers) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — PostgreSQL (acessado via **Prisma**) e Storage para as imagens
- **Auth.js / NextAuth v5** com provedor Google
- **Resend** para o formulário de contato
- **Vitest** para testes unitários dos serviços
- Deploy na **Vercel**

A lógica de negócio fica em `mirelits/modules/`, organizada por domínio (projeto, foto, perfil, linha do tempo, configurações, admin) em camadas `core` (entidades e portas), `application` (serviços, testados com repositórios mockados) e `infrastructure` (Prisma e Supabase).

## Estrutura

```
mirelits/            # aplicação Next.js
  app/(site)/        # páginas públicas
  app/admin/         # painel administrativo
  app/api/           # route handlers (públicos e /admin)
  modules/           # domínio: core / application / infrastructure
  prisma/            # schema do banco
  project/           # protótipo de design original (HTML/JSX estático)
```

## Como rodar localmente

Pré-requisitos: Node.js 20+ e um projeto Supabase (Postgres + bucket de Storage público chamado `mirelits`).

```bash
cd mirelits
npm install
cp .env.example .env.local   # preencha os valores
npx prisma generate
npm run db:push              # cria/atualiza as tabelas no banco (manual, fora do deploy)
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Conexão com pooling (pgbouncer) usada pela aplicação |
| `POSTGRES_URL_NON_POOLING` | Conexão direta, usada pelo Prisma para aplicar o schema |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço usada no servidor para upload/remoção de imagens |
| `AUTH_SECRET` | Segredo do Auth.js |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciais OAuth do Google |
| `ADMIN_EMAIL` | E-mails com acesso ao `/admin`, separados por vírgula |
| `RESEND_API_KEY` | Chave do Resend (sem ela o envio de contato é apenas simulado) |
| `RESEND_FROM` | Remetente dos e-mails de contato |
| `CONTACT_EMAIL` | Destinatário do formulário (padrão: `ADMIN_EMAIL`) |

Na Vercel as variáveis ficam no painel do projeto; `vercel env pull` sincroniza para `.env.local`.

### Scripts

```bash
npm run dev     # servidor de desenvolvimento
npm test        # testes (Vitest)
npm run lint    # ESLint
npm run build   # prisma generate + next build (usado no deploy; não altera o banco)
```

> O `build` aplica o schema do Prisma ao banco configurado — rode-o apenas com credenciais do ambiente certo.
