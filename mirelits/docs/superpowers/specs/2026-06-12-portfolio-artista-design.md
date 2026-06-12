---
name: portfolio-artista-design
description: Design completo do backend e banco de dados para o portfólio da artista — arquitectura hexagonal modular, schema Prisma, endpoints API
metadata:
  type: project
---

# Design: Portfólio da Artista — Backend

**Data:** 2026-06-12  
**Stack:** Next.js 16 (App Router), Prisma, Supabase PostgreSQL, Supabase Storage, Auth.js (Google OAuth)

---

## Contexto

Aplicação de portfólio para uma única artista. O frontend é construído pela artista/designer; este documento cobre exclusivamente o backend (API Route Handlers) e a base de dados.

A artista autentica-se via Google OAuth e, como admin, pode gerir projetos, fotos, o seu perfil e as configurações visuais do site. O público acede apenas a endpoints públicos sem autenticação.

---

## Autenticação

- **Auth.js (NextAuth)** com provider Google OAuth.
- Após login Google, o callback verifica se o `email` existe na tabela `Admin`.
- Quem não estiver na tabela `Admin` é rejeitado — sem fluxo de registo.
- Admins são inseridos manualmente na base de dados.
- Todos os routes em `/api/admin/*` verificam a sessão antes de qualquer operação.

---

## Entidades do Banco de Dados

### `Admin`
Controlo de acesso. Inserção manual apenas.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| email | String | unique |
| name | String? | opcional |
| createdAt | DateTime | auto |

### `Project`
Projecto de arte com estado de publicação e suporte a fixar na home.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| title | String | obrigatório |
| subtitle | String? | opcional |
| description | String? | texto longo, opcional |
| status | ProjectStatus | DRAFT \| PUBLISHED, default DRAFT |
| pinned | Boolean | default false |
| pinOrder | Int? | posição entre fixados; null = não fixado |
| coverPhotoId | String? | FK → Photo (unique), nullable |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

### `Photo`
Foto de um projecto. Armazenada no Supabase Storage como WebP comprimido.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| projectId | String | FK → Project, cascade delete |
| storagePath | String | caminho no bucket Supabase |
| url | String | URL pública |
| position | Int | ordem de exibição no projecto |
| createdAt | DateTime | auto |

### `ArtistProfile` *(singleton)*
Uma única linha. Gerida via upsert.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| name | String | |
| shortBio | String | exibido na home |
| fullBio | String | exibido no about |
| profilePhotoUrl | String? | foto de perfil (home + about) |
| logoUrl | String? | logo do header e site |
| updatedAt | DateTime | auto |

### `SiteSettings` *(singleton)*
Uma única linha. Gerida via upsert.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| primaryColor | String | default #000000 |
| secondaryColor | String | default #ffffff |
| accentColor | String | default #ff0000 |
| updatedAt | DateTime | auto |

### `TimelineEntry`
Entradas da linha do tempo da artista (exibida no about).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String | cuid, PK |
| title | String | ex: "Formação em Belas Artes" |
| description | String? | opcional |
| year | Int | ano do evento |
| position | Int | ordem de exibição |
| createdAt | DateTime | auto |

---

## Schema Prisma

```prisma
enum ProjectStatus {
  DRAFT
  PUBLISHED
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}

model Project {
  id           String        @id @default(cuid())
  title        String
  subtitle     String?
  description  String?
  status       ProjectStatus @default(DRAFT)
  pinned       Boolean       @default(false)
  pinOrder     Int?
  coverPhotoId String?       @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  photos     Photo[]  @relation("ProjectPhotos")
  coverPhoto Photo?   @relation("CoverPhoto", fields: [coverPhotoId], references: [id])
}

model Photo {
  id          String   @id @default(cuid())
  projectId   String
  storagePath String
  url         String
  position    Int
  createdAt   DateTime @default(now())

  project        Project  @relation("ProjectPhotos", fields: [projectId], references: [id], onDelete: Cascade)
  coverOfProject Project? @relation("CoverPhoto")
}

model ArtistProfile {
  id              String   @id @default(cuid())
  name            String
  shortBio        String
  fullBio         String
  profilePhotoUrl String?
  logoUrl         String?
  updatedAt       DateTime @updatedAt
}

model SiteSettings {
  id             String   @id @default(cuid())
  primaryColor   String   @default("#000000")
  secondaryColor String   @default("#ffffff")
  accentColor    String   @default("#ff0000")
  updatedAt      DateTime @updatedAt
}

model TimelineEntry {
  id          String   @id @default(cuid())
  title       String
  description String?
  year        Int
  position    Int
  createdAt   DateTime @default(now())
}
```

---

## Arquitectura: Módulos Hexagonais

Cada entidade é um módulo auto-contido com três camadas internas.

```
modules/
├── project/
│   ├── core/               # entidade + interface do repositório
│   ├── application/        # casos de uso (service)
│   └── infrastructure/     # implementação Prisma
├── photo/
│   ├── core/               # entidade + interface repositório + interface storage
│   ├── application/        # orquestra compressão, upload e persistência
│   └── infrastructure/     # Prisma repository + Supabase storage adapter (sharp → WebP)
├── admin/
│   ├── core/
│   ├── application/        # findByEmail para validar acesso OAuth
│   └── infrastructure/
├── artist-profile/
│   ├── core/
│   ├── application/        # upsert, upload de foto de perfil e logo
│   └── infrastructure/     # Prisma + Supabase storage adapter
├── site-settings/
│   ├── core/
│   ├── application/        # upsert
│   └── infrastructure/
└── timeline/
    ├── core/
    ├── application/        # CRUD + reordenação
    └── infrastructure/

lib/
├── prisma.ts               # singleton PrismaClient
└── supabase.ts             # singleton SupabaseClient (storage only)
```

### Regra de dependências

```
app/api/ → application/ → core/
infrastructure/ → core/ (implementa interfaces)
infrastructure/ → lib/ (usa clientes singleton)
```

A camada `core/` não importa nada externo. A camada `application/` conhece apenas as interfaces definidas em `core/`. Os Route Handlers instanciam as dependências e injectam no service:

```ts
// app/api/admin/projects/route.ts
const repo = new PrismaProjectRepository()
const service = new ProjectService(repo)
```

---

## Endpoints da API

### Públicos

| Método | Rota | Resposta |
|--------|------|----------|
| GET | `/api/projects` | Lista de projectos PUBLISHED ordenados: fixados primeiro (por pinOrder ASC), depois restantes por createdAt DESC. Retorna id, title, subtitle, pinned, pinOrder, coverPhoto.url |
| GET | `/api/projects/:id` | Projecto completo com fotos ordenadas por position |

### Admin (requerem sessão)

| Método | Rota | Operação |
|--------|------|----------|
| GET | `/api/admin/projects` | Lista todos (DRAFT + PUBLISHED) |
| POST | `/api/admin/projects` | Criar projecto |
| PUT | `/api/admin/projects/:id` | Editar title, subtitle, description, status, coverPhotoId |
| DELETE | `/api/admin/projects/:id` | Apagar projecto + fotos Storage + fotos DB (cascade) |
| POST | `/api/admin/projects/:id/photos` | Upload foto (compress → WebP → Supabase → DB) |
| PUT | `/api/admin/projects/:id/photos` | Reordenar fotos (array de {id, position}) |
| DELETE | `/api/admin/projects/:id/photos/:photoId` | Apagar foto do Storage + DB |
| PUT | `/api/admin/projects/pins` | Reordenar/actualizar projectos fixados |
| GET | `/api/admin/artist-profile` | Obter perfil |
| PUT | `/api/admin/artist-profile` | Actualizar perfil (com upload opcional de foto/logo) |
| GET | `/api/admin/site-settings` | Obter cores |
| PUT | `/api/admin/site-settings` | Actualizar cores |
| GET | `/api/admin/timeline` | Listar entradas ordenadas por position |
| POST | `/api/admin/timeline` | Criar entrada |
| PUT | `/api/admin/timeline/:id` | Editar entrada |
| DELETE | `/api/admin/timeline/:id` | Apagar entrada |

---

## Supabase Storage

Dois buckets:

| Bucket | Conteúdo |
|--------|----------|
| `project-photos` | Fotos dos projectos (WebP comprimido via sharp) |
| `artist-assets` | Foto de perfil e logo da artista |

O upload é feito exclusivamente pelo servidor (Route Handler → service → storage adapter). O cliente nunca acede ao Supabase directamente.

---

## Formulário de Contacto

O endpoint `/api/contact` (público) recebe nome, email e mensagem e envia email para a artista. Não armazena mensagens na base de dados. A implementação do envio de email (Resend ou similar) fica fora do âmbito deste spec.

---

## Decisões e Restrições

- Prisma é o único ponto de acesso à base de dados — sem queries directas ao Supabase.
- `POSTGRES_PRISMA_URL` usa pgbouncer (transaction mode) — nunca correr migrações com esta URL.
- `POSTGRES_URL_NON_POOLING` exclusivamente para `prisma migrate deploy` em CI/CD.
- Sem RLS no Supabase — a protecção é feita no código Next.js.
- `onDelete: Cascade` em `Photo` garante que apagar um projecto limpa as fotos no DB; o service é responsável por apagar do Storage antes de apagar o projecto.
- `ArtistProfile` e `SiteSettings` são singletons geridos via upsert no service.
- Fotos são sempre comprimidas para WebP antes do upload — nunca armazenar o ficheiro original.
