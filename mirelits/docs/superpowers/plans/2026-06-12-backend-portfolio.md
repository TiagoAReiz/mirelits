# Backend Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar todo o backend do portfólio da artista — módulos hexagonais, schema Prisma, Auth.js com Google OAuth, Supabase Storage, e todos os Route Handlers públicos e admin.

**Architecture:** Arquitectura hexagonal com módulos auto-contidos (`core/` → entidades e ports, `application/` → services/casos de uso, `infrastructure/` → adaptadores Prisma/Supabase). Route Handlers em `app/api/` chamam a camada `application/` injectando as dependências manualmente.

**Tech Stack:** Next.js 16 App Router, Prisma 6 + Supabase PostgreSQL, Supabase Storage, Auth.js v5 (next-auth@beta) Google OAuth, sharp (WebP compression), Vitest

---

## Breaking Changes do Next.js 16

- `params` nos Route Handlers é uma **Promise**: `const { id } = await ctx.params`
- Tipar contexto com o helper global `RouteContext<'/path/[id]'>` (não precisa de import)
- Usar `Response.json()` nativo (ou `NextResponse.json()` — ambos funcionam)

---

## Mapa de Ficheiros

**Modificados:**
- `prisma/schema.prisma` — adicionar todos os modelos
- `package.json` — adicionar dependências

**Criados (lib + auth):**
- `lib/prisma.ts`, `lib/supabase.ts`, `lib/auth.ts`
- `auth.ts` (raiz do projecto)
- `vitest.config.ts`

**Criados (modules):**
```
modules/
  admin/core/{admin.entity,admin.repository.port}.ts
  admin/application/admin.service.ts
  admin/infrastructure/admin.repository.ts
  project/core/{project.entity,project.repository.port}.ts
  project/application/project.service.ts
  project/infrastructure/project.repository.ts
  photo/core/{photo.entity,photo.repository.port,photo.storage.port}.ts
  photo/application/photo.service.ts
  photo/infrastructure/{photo.repository,photo.storage.adapter}.ts
  artist-profile/core/{artist-profile.entity,artist-profile.repository.port,artist-profile.storage.port}.ts
  artist-profile/application/artist-profile.service.ts
  artist-profile/infrastructure/{artist-profile.repository,artist-profile.storage.adapter}.ts
  site-settings/core/{site-settings.entity,site-settings.repository.port}.ts
  site-settings/application/site-settings.service.ts
  site-settings/infrastructure/site-settings.repository.ts
  timeline/core/{timeline.entity,timeline.repository.port}.ts
  timeline/application/timeline.service.ts
  timeline/infrastructure/timeline.repository.ts
```

**Criados (tests):**
```
modules/admin/application/admin.service.test.ts
modules/project/application/project.service.test.ts
modules/photo/application/photo.service.test.ts
modules/artist-profile/application/artist-profile.service.test.ts
modules/site-settings/application/site-settings.service.test.ts
modules/timeline/application/timeline.service.test.ts
```

**Criados (Route Handlers):**
```
app/api/auth/[...nextauth]/route.ts
app/api/projects/route.ts
app/api/projects/[id]/route.ts
app/api/contact/route.ts
app/api/admin/projects/route.ts
app/api/admin/projects/[id]/route.ts
app/api/admin/projects/[id]/photos/route.ts
app/api/admin/projects/[id]/photos/[photoId]/route.ts
app/api/admin/projects/pins/route.ts
app/api/admin/artist-profile/route.ts
app/api/admin/site-settings/route.ts
app/api/admin/timeline/route.ts
app/api/admin/timeline/[id]/route.ts
```

---

## Task 1: Instalar dependências e configurar variáveis de ambiente

**Files:**
- Modify: `mirelits/package.json`

- [ ] **Step 1: Instalar dependências**

```bash
cd mirelits
npm install next-auth@beta @supabase/supabase-js
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Adicionar script de teste ao package.json**

Em `mirelits/package.json`, dentro de `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Criar ficheiros de variáveis de ambiente**

> **Porquê dois ficheiros?** O `prisma.config.ts` usa `import "dotenv/config"` que carrega **`.env`** (não `.env.local`). O CLI do Prisma (`prisma migrate dev`, `prisma generate`) precisa de ler `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` directamente, pelo que essas vars têm de estar em `.env`. O Next.js dev server carrega ambos (`.env` + `.env.local`), com `.env.local` a sobrepor-se se houver duplicados.

Criar `mirelits/.env` (não commitar — adicionar ao `.gitignore`):
```
# Prisma / Supabase PostgreSQL (lido pelo CLI do Prisma via dotenv/config)
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

Criar `mirelits/.env.local` (não commitar):
```
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."

# Auth.js
AUTH_SECRET="<gerar com: openssl rand -base64 32>"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

Verificar que `mirelits/.gitignore` contém:
```
.env
.env.local
```

- [ ] **Step 4: Commit**

```bash
git add mirelits/package.json mirelits/package-lock.json
git commit -m "chore: add next-auth, supabase-js, vitest dependencies"
```

---

## Task 2: Actualizar schema Prisma e migrar

**Files:**
- Modify: `mirelits/prisma/schema.prisma`

- [ ] **Step 1: Substituir o schema**

Conteúdo completo de `mirelits/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

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
  coverPhoto Photo?   @relation("CoverPhoto", fields: [coverPhotoId], references: [id], onDelete: SetNull)
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

- [ ] **Step 2: Gerar e correr a migração**

```bash
cd mirelits
npx prisma migrate dev --name init
```

Resultado esperado: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verificar o cliente gerado**

```bash
npx prisma generate
```

Resultado esperado: `Generated Prisma Client`.

- [ ] **Step 4: Commit**

```bash
git add mirelits/prisma/
git commit -m "feat: prisma schema com todos os modelos do portfólio"
```

---

## Task 3: Shared lib (Prisma client + Supabase client)

**Files:**
- Create: `mirelits/lib/prisma.ts`
- Create: `mirelits/lib/supabase.ts`

- [ ] **Step 1: Criar `lib/prisma.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Criar `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
```

- [ ] **Step 3: Commit**

```bash
git add mirelits/lib/
git commit -m "feat: prisma e supabase client singletons"
```

---

## Task 4: Configurar Vitest

**Files:**
- Create: `mirelits/vitest.config.ts`

- [ ] **Step 1: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Verificar que o Vitest arranca**

```bash
cd mirelits
npm test
```

Resultado esperado: `No test files found, exiting with code 0` (ou similar — sem erros).

- [ ] **Step 3: Commit**

```bash
git add mirelits/vitest.config.ts
git commit -m "chore: configurar vitest"
```

---

## Task 5: Módulo Admin

**Files:**
- Create: `mirelits/modules/admin/core/admin.entity.ts`
- Create: `mirelits/modules/admin/core/admin.repository.port.ts`
- Create: `mirelits/modules/admin/application/admin.service.ts`
- Create: `mirelits/modules/admin/application/admin.service.test.ts`
- Create: `mirelits/modules/admin/infrastructure/admin.repository.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/admin/application/admin.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminService } from './admin.service'
import type { IAdminRepository } from '../core/admin.repository.port'

const mockRepo: IAdminRepository = {
  findByEmail: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('AdminService.isAuthorized', () => {
  it('retorna true quando o email existe na tabela Admin', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue({
      id: 'cuid1', email: 'admin@test.com', name: 'Admin', createdAt: new Date(),
    })
    const service = new AdminService(mockRepo)
    expect(await service.isAuthorized('admin@test.com')).toBe(true)
  })

  it('retorna false quando o email não existe na tabela Admin', async () => {
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null)
    const service = new AdminService(mockRepo)
    expect(await service.isAuthorized('unknown@test.com')).toBe(false)
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/admin
```

Resultado esperado: FAIL com `Cannot find module './admin.service'`.

- [ ] **Step 3: Criar entidade e port**

`mirelits/modules/admin/core/admin.entity.ts`:
```ts
export type Admin = {
  id: string
  email: string
  name: string | null
  createdAt: Date
}
```

`mirelits/modules/admin/core/admin.repository.port.ts`:
```ts
import type { Admin } from './admin.entity'

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/admin/application/admin.service.ts`:
```ts
import type { IAdminRepository } from '../core/admin.repository.port'

export class AdminService {
  constructor(private readonly repo: IAdminRepository) {}

  async isAuthorized(email: string): Promise<boolean> {
    const admin = await this.repo.findByEmail(email)
    return admin !== null
  }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/admin
```

Resultado esperado: PASS (2 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/admin/infrastructure/admin.repository.ts`:
```ts
import type { IAdminRepository } from '../core/admin.repository.port'
import type { Admin } from '../core/admin.entity'
import { prisma } from '@/lib/prisma'

export class PrismaAdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { email } })
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add mirelits/modules/admin/
git commit -m "feat: módulo admin com service e repositório Prisma"
```

---

## Task 6: Módulo Project

**Files:**
- Create: `mirelits/modules/project/core/project.entity.ts`
- Create: `mirelits/modules/project/core/project.repository.port.ts`
- Create: `mirelits/modules/project/application/project.service.ts`
- Create: `mirelits/modules/project/application/project.service.test.ts`
- Create: `mirelits/modules/project/infrastructure/project.repository.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/project/application/project.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectService } from './project.service'
import type { IProjectRepository } from '../core/project.repository.port'

const mockRepo: IProjectRepository = {
  findAllPublished: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updatePins: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const baseProject = {
  id: 'p1', title: 'Arte 1', subtitle: null, description: null,
  status: 'PUBLISHED' as const, pinned: false, pinOrder: null,
  coverPhotoId: null, createdAt: new Date(), updatedAt: new Date(),
}

describe('ProjectService', () => {
  it('getAllPublished chama findAllPublished no repositório', async () => {
    vi.mocked(mockRepo.findAllPublished).mockResolvedValue([])
    const service = new ProjectService(mockRepo)
    await service.getAllPublished()
    expect(mockRepo.findAllPublished).toHaveBeenCalledOnce()
  })

  it('create chama repo.create com os dados correctos', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(baseProject)
    const service = new ProjectService(mockRepo)
    await service.create({ title: 'Arte 1' })
    expect(mockRepo.create).toHaveBeenCalledWith({ title: 'Arte 1' })
  })

  it('update chama repo.update com id e dados', async () => {
    vi.mocked(mockRepo.update).mockResolvedValue(baseProject)
    const service = new ProjectService(mockRepo)
    await service.update('p1', { title: 'Novo título' })
    expect(mockRepo.update).toHaveBeenCalledWith('p1', { title: 'Novo título' })
  })

  it('delete chama repo.delete com o id', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)
    const service = new ProjectService(mockRepo)
    await service.delete('p1')
    expect(mockRepo.delete).toHaveBeenCalledWith('p1')
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/project
```

Resultado esperado: FAIL com `Cannot find module './project.service'`.

- [ ] **Step 3: Criar entidade e port**

`mirelits/modules/project/core/project.entity.ts`:
```ts
export type ProjectStatus = 'DRAFT' | 'PUBLISHED'

export type Project = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  status: ProjectStatus
  pinned: boolean
  pinOrder: number | null
  coverPhotoId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ProjectSummary = {
  id: string
  title: string
  subtitle: string | null
  status: ProjectStatus
  pinned: boolean
  pinOrder: number | null
  coverPhoto: { url: string } | null
}

export type ProjectDetail = Project & {
  photos: Array<{ id: string; url: string; position: number }>
  coverPhoto: { url: string } | null
}
```

`mirelits/modules/project/core/project.repository.port.ts`:
```ts
import type { Project, ProjectSummary, ProjectDetail } from './project.entity'

export type CreateProjectInput = {
  title: string
  subtitle?: string
  description?: string
}

export type UpdateProjectInput = {
  title?: string
  subtitle?: string | null
  description?: string | null
  status?: 'DRAFT' | 'PUBLISHED'
  coverPhotoId?: string | null
}

export type UpdatePinsInput = Array<{
  id: string
  pinned: boolean
  pinOrder: number | null
}>

export interface IProjectRepository {
  findAllPublished(): Promise<ProjectSummary[]>
  findAll(): Promise<ProjectSummary[]>
  findById(id: string): Promise<ProjectDetail | null>
  create(input: CreateProjectInput): Promise<Project>
  update(id: string, input: UpdateProjectInput): Promise<Project>
  delete(id: string): Promise<void>
  updatePins(updates: UpdatePinsInput): Promise<void>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/project/application/project.service.ts`:
```ts
import type {
  IProjectRepository,
  CreateProjectInput,
  UpdateProjectInput,
  UpdatePinsInput,
} from '../core/project.repository.port'

export class ProjectService {
  constructor(private readonly repo: IProjectRepository) {}

  getAllPublished() { return this.repo.findAllPublished() }
  getAll() { return this.repo.findAll() }
  getById(id: string) { return this.repo.findById(id) }
  create(input: CreateProjectInput) { return this.repo.create(input) }
  update(id: string, input: UpdateProjectInput) { return this.repo.update(id, input) }
  delete(id: string) { return this.repo.delete(id) }
  updatePins(updates: UpdatePinsInput) { return this.repo.updatePins(updates) }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/project
```

Resultado esperado: PASS (4 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/project/infrastructure/project.repository.ts`:
```ts
import type {
  IProjectRepository,
  CreateProjectInput,
  UpdateProjectInput,
  UpdatePinsInput,
} from '../core/project.repository.port'
import type { Project, ProjectSummary, ProjectDetail } from '../core/project.entity'
import { prisma } from '@/lib/prisma'

export class PrismaProjectRepository implements IProjectRepository {
  async findAllPublished(): Promise<ProjectSummary[]> {
    return prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ pinned: 'desc' }, { pinOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, title: true, subtitle: true, pinned: true, pinOrder: true,
        coverPhoto: { select: { url: true } },
      },
    })
  }

  async findAll(): Promise<ProjectSummary[]> {
    return prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, subtitle: true, status: true, pinned: true, pinOrder: true,
        coverPhoto: { select: { url: true } },
      },
    })
  }

  async findById(id: string): Promise<ProjectDetail | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { position: 'asc' }, select: { id: true, url: true, position: true } },
        coverPhoto: { select: { url: true } },
      },
    })
  }

  async create(input: CreateProjectInput): Promise<Project> {
    return prisma.project.create({ data: input })
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return prisma.project.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }

  async updatePins(updates: UpdatePinsInput): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, pinned, pinOrder }) =>
        prisma.project.update({ where: { id }, data: { pinned, pinOrder } })
      )
    )
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add mirelits/modules/project/
git commit -m "feat: módulo project com service e repositório Prisma"
```

---

## Task 7: Módulo Photo

**Files:**
- Create: `mirelits/modules/photo/core/photo.entity.ts`
- Create: `mirelits/modules/photo/core/photo.repository.port.ts`
- Create: `mirelits/modules/photo/core/photo.storage.port.ts`
- Create: `mirelits/modules/photo/application/photo.service.ts`
- Create: `mirelits/modules/photo/application/photo.service.test.ts`
- Create: `mirelits/modules/photo/infrastructure/photo.repository.ts`
- Create: `mirelits/modules/photo/infrastructure/photo.storage.adapter.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/photo/application/photo.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PhotoService } from './photo.service'
import type { IPhotoRepository } from '../core/photo.repository.port'
import type { IPhotoStorage } from '../core/photo.storage.port'

const mockRepo: IPhotoRepository = {
  findByProject: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  reorder: vi.fn(),
  delete: vi.fn(),
  deleteAllByProject: vi.fn(),
}

const mockStorage: IPhotoStorage = {
  upload: vi.fn(),
  delete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const basePhoto = {
  id: 'ph1', projectId: 'p1', storagePath: 'project-photos/p1/1.webp',
  url: 'https://cdn.example.com/1.webp', position: 0, createdAt: new Date(),
}

describe('PhotoService', () => {
  it('upload comprime, sobe para storage e persiste no repositório', async () => {
    vi.mocked(mockRepo.findByProject).mockResolvedValue([])
    vi.mocked(mockStorage.upload).mockResolvedValue({
      path: 'project-photos/p1/1.webp',
      url: 'https://cdn.example.com/1.webp',
    })
    vi.mocked(mockRepo.create).mockResolvedValue(basePhoto)

    const service = new PhotoService(mockRepo, mockStorage)
    const result = await service.upload('p1', Buffer.from('img'), 'foto.jpg')

    expect(mockStorage.upload).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledWith({
      projectId: 'p1',
      storagePath: 'project-photos/p1/1.webp',
      url: 'https://cdn.example.com/1.webp',
      position: 0,
    })
    expect(result).toEqual({ id: 'ph1', url: 'https://cdn.example.com/1.webp' })
  })

  it('delete remove do storage e depois do repositório', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(basePhoto)
    vi.mocked(mockStorage.delete).mockResolvedValue(undefined)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const service = new PhotoService(mockRepo, mockStorage)
    await service.delete('ph1')

    expect(mockStorage.delete).toHaveBeenCalledWith('project-photos/p1/1.webp', 'project-photos')
    expect(mockRepo.delete).toHaveBeenCalledWith('ph1')
  })

  it('delete não faz nada se a foto não existe', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    const service = new PhotoService(mockRepo, mockStorage)
    await service.delete('inexistente')
    expect(mockStorage.delete).not.toHaveBeenCalled()
  })

  it('deleteByProject remove storage de todas as fotos e depois apaga do repo', async () => {
    vi.mocked(mockRepo.findByProject).mockResolvedValue([basePhoto])
    vi.mocked(mockStorage.delete).mockResolvedValue(undefined)
    vi.mocked(mockRepo.deleteAllByProject).mockResolvedValue(undefined)

    const service = new PhotoService(mockRepo, mockStorage)
    await service.deleteByProject('p1')

    expect(mockStorage.delete).toHaveBeenCalledWith('project-photos/p1/1.webp', 'project-photos')
    expect(mockRepo.deleteAllByProject).toHaveBeenCalledWith('p1')
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/photo
```

Resultado esperado: FAIL com `Cannot find module './photo.service'`.

- [ ] **Step 3: Criar entidade e ports**

`mirelits/modules/photo/core/photo.entity.ts`:
```ts
export type Photo = {
  id: string
  projectId: string
  storagePath: string
  url: string
  position: number
  createdAt: Date
}
```

`mirelits/modules/photo/core/photo.repository.port.ts`:
```ts
import type { Photo } from './photo.entity'

export type CreatePhotoInput = {
  projectId: string
  storagePath: string
  url: string
  position: number
}

export type ReorderPhotosInput = Array<{ id: string; position: number }>

export interface IPhotoRepository {
  findByProject(projectId: string): Promise<Photo[]>
  findById(id: string): Promise<Photo | null>
  create(input: CreatePhotoInput): Promise<Photo>
  reorder(updates: ReorderPhotosInput): Promise<void>
  delete(id: string): Promise<void>
  deleteAllByProject(projectId: string): Promise<void>
}
```

`mirelits/modules/photo/core/photo.storage.port.ts`:
```ts
export interface IPhotoStorage {
  upload(file: Buffer, filename: string, bucket: string): Promise<{ path: string; url: string }>
  delete(path: string, bucket: string): Promise<void>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/photo/application/photo.service.ts`:
```ts
import type { IPhotoRepository, ReorderPhotosInput } from '../core/photo.repository.port'
import type { IPhotoStorage } from '../core/photo.storage.port'

const BUCKET = 'project-photos'

export class PhotoService {
  constructor(
    private readonly repo: IPhotoRepository,
    private readonly storage: IPhotoStorage,
  ) {}

  async upload(projectId: string, file: Buffer, originalName: string): Promise<{ id: string; url: string }> {
    const stem = originalName.replace(/\.[^.]+$/, '')
    const filename = `${projectId}/${Date.now()}-${stem}.webp`
    const { path, url } = await this.storage.upload(file, filename, BUCKET)

    const existing = await this.repo.findByProject(projectId)
    const position = existing.length

    const photo = await this.repo.create({ projectId, storagePath: path, url, position })
    return { id: photo.id, url: photo.url }
  }

  async reorder(projectId: string, updates: ReorderPhotosInput): Promise<void> {
    await this.repo.reorder(updates)
  }

  async delete(photoId: string): Promise<void> {
    const photo = await this.repo.findById(photoId)
    if (!photo) return
    await this.storage.delete(photo.storagePath, BUCKET)
    await this.repo.delete(photoId)
  }

  async deleteByProject(projectId: string): Promise<void> {
    const photos = await this.repo.findByProject(projectId)
    await Promise.all(
      photos.map(p => this.storage.delete(p.storagePath, BUCKET).catch(() => {}))
    )
    await this.repo.deleteAllByProject(projectId)
  }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/photo
```

Resultado esperado: PASS (4 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/photo/infrastructure/photo.repository.ts`:
```ts
import type { IPhotoRepository, CreatePhotoInput, ReorderPhotosInput } from '../core/photo.repository.port'
import type { Photo } from '../core/photo.entity'
import { prisma } from '@/lib/prisma'

export class PrismaPhotoRepository implements IPhotoRepository {
  async findByProject(projectId: string): Promise<Photo[]> {
    return prisma.photo.findMany({ where: { projectId }, orderBy: { position: 'asc' } })
  }

  async findById(id: string): Promise<Photo | null> {
    return prisma.photo.findUnique({ where: { id } })
  }

  async create(input: CreatePhotoInput): Promise<Photo> {
    return prisma.photo.create({ data: input })
  }

  async reorder(updates: ReorderPhotosInput): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, position }) =>
        prisma.photo.update({ where: { id }, data: { position } })
      )
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.photo.delete({ where: { id } })
  }

  async deleteAllByProject(projectId: string): Promise<void> {
    await prisma.photo.deleteMany({ where: { projectId } })
  }
}
```

- [ ] **Step 7: Criar o storage adapter (infrastructure)**

`mirelits/modules/photo/infrastructure/photo.storage.adapter.ts`:
```ts
import sharp from 'sharp'
import type { IPhotoStorage } from '../core/photo.storage.port'
import { supabase } from '@/lib/supabase'

export class SupabasePhotoStorageAdapter implements IPhotoStorage {
  async upload(file: Buffer, filename: string, bucket: string): Promise<{ path: string; url: string }> {
    const compressed = await sharp(file).webp({ quality: 80 }).toBuffer()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, compressed, { contentType: 'image/webp', upsert: false })
    if (error) throw new Error(`Upload falhou: ${error.message}`)
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return { path: data.path, url: urlData.publicUrl }
  }

  async delete(path: string, bucket: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Delete falhou: ${error.message}`)
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add mirelits/modules/photo/
git commit -m "feat: módulo photo com compressão WebP via sharp e Supabase Storage"
```

---

## Task 8: Módulo Artist Profile

**Files:**
- Create: `mirelits/modules/artist-profile/core/artist-profile.entity.ts`
- Create: `mirelits/modules/artist-profile/core/artist-profile.repository.port.ts`
- Create: `mirelits/modules/artist-profile/core/artist-profile.storage.port.ts`
- Create: `mirelits/modules/artist-profile/application/artist-profile.service.ts`
- Create: `mirelits/modules/artist-profile/application/artist-profile.service.test.ts`
- Create: `mirelits/modules/artist-profile/infrastructure/artist-profile.repository.ts`
- Create: `mirelits/modules/artist-profile/infrastructure/artist-profile.storage.adapter.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/artist-profile/application/artist-profile.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ArtistProfileService } from './artist-profile.service'
import type { IArtistProfileRepository } from '../core/artist-profile.repository.port'
import type { IArtistProfileStorage } from '../core/artist-profile.storage.port'

const mockRepo: IArtistProfileRepository = {
  get: vi.fn(),
  upsert: vi.fn(),
}

const mockStorage: IArtistProfileStorage = {
  uploadProfilePhoto: vi.fn(),
  uploadLogo: vi.fn(),
  delete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const baseProfile = {
  id: 'singleton', name: 'Mirelits', shortBio: 'Artista', fullBio: 'Bio completa',
  profilePhotoUrl: null, logoUrl: null, updatedAt: new Date(),
}

describe('ArtistProfileService', () => {
  it('get retorna o perfil do repositório', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue(baseProfile)
    const service = new ArtistProfileService(mockRepo, mockStorage)
    const result = await service.get()
    expect(result).toEqual(baseProfile)
  })

  it('update sem ficheiros chama upsert com URLs existentes', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue({ ...baseProfile, profilePhotoUrl: 'https://old.com/p.webp' })
    vi.mocked(mockRepo.upsert).mockResolvedValue(baseProfile)
    const service = new ArtistProfileService(mockRepo, mockStorage)
    await service.update({ name: 'Nova', shortBio: 'x', fullBio: 'y' })
    expect(mockStorage.uploadProfilePhoto).not.toHaveBeenCalled()
    expect(mockRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
      profilePhotoUrl: 'https://old.com/p.webp',
    }))
  })

  it('update com profilePhoto faz upload e passa a nova URL', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue(baseProfile)
    vi.mocked(mockStorage.uploadProfilePhoto).mockResolvedValue('https://new.com/p.webp')
    vi.mocked(mockRepo.upsert).mockResolvedValue(baseProfile)
    const service = new ArtistProfileService(mockRepo, mockStorage)
    await service.update({ name: 'N', shortBio: 'x', fullBio: 'y', profilePhoto: Buffer.from('img') })
    expect(mockStorage.uploadProfilePhoto).toHaveBeenCalledOnce()
    expect(mockRepo.upsert).toHaveBeenCalledWith(expect.objectContaining({
      profilePhotoUrl: 'https://new.com/p.webp',
    }))
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/artist-profile
```

- [ ] **Step 3: Criar entidade e ports**

`mirelits/modules/artist-profile/core/artist-profile.entity.ts`:
```ts
export type ArtistProfile = {
  id: string
  name: string
  shortBio: string
  fullBio: string
  profilePhotoUrl: string | null
  logoUrl: string | null
  updatedAt: Date
}
```

`mirelits/modules/artist-profile/core/artist-profile.repository.port.ts`:
```ts
import type { ArtistProfile } from './artist-profile.entity'

export type UpsertArtistProfileInput = {
  name: string
  shortBio: string
  fullBio: string
  profilePhotoUrl?: string | null
  logoUrl?: string | null
}

export interface IArtistProfileRepository {
  get(): Promise<ArtistProfile | null>
  upsert(input: UpsertArtistProfileInput): Promise<ArtistProfile>
}
```

`mirelits/modules/artist-profile/core/artist-profile.storage.port.ts`:
```ts
export interface IArtistProfileStorage {
  uploadProfilePhoto(file: Buffer, filename: string): Promise<string>
  uploadLogo(file: Buffer, filename: string): Promise<string>
  delete(path: string): Promise<void>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/artist-profile/application/artist-profile.service.ts`:
```ts
import type { IArtistProfileRepository } from '../core/artist-profile.repository.port'
import type { IArtistProfileStorage } from '../core/artist-profile.storage.port'
import type { ArtistProfile } from '../core/artist-profile.entity'

export type UpdateArtistProfileInput = {
  name: string
  shortBio: string
  fullBio: string
  profilePhoto?: Buffer
  logo?: Buffer
}

export class ArtistProfileService {
  constructor(
    private readonly repo: IArtistProfileRepository,
    private readonly storage: IArtistProfileStorage,
  ) {}

  get(): Promise<ArtistProfile | null> {
    return this.repo.get()
  }

  async update(input: UpdateArtistProfileInput): Promise<ArtistProfile> {
    const current = await this.repo.get()
    let profilePhotoUrl = current?.profilePhotoUrl ?? null
    let logoUrl = current?.logoUrl ?? null

    if (input.profilePhoto) {
      profilePhotoUrl = await this.storage.uploadProfilePhoto(
        input.profilePhoto, `profile-${Date.now()}.webp`,
      )
    }
    if (input.logo) {
      logoUrl = await this.storage.uploadLogo(input.logo, `logo-${Date.now()}.webp`)
    }

    return this.repo.upsert({ name: input.name, shortBio: input.shortBio, fullBio: input.fullBio, profilePhotoUrl, logoUrl })
  }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/artist-profile
```

Resultado esperado: PASS (3 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/artist-profile/infrastructure/artist-profile.repository.ts`:
```ts
import type { IArtistProfileRepository, UpsertArtistProfileInput } from '../core/artist-profile.repository.port'
import type { ArtistProfile } from '../core/artist-profile.entity'
import { prisma } from '@/lib/prisma'

const ID = 'singleton'

export class PrismaArtistProfileRepository implements IArtistProfileRepository {
  async get(): Promise<ArtistProfile | null> {
    return prisma.artistProfile.findUnique({ where: { id: ID } })
  }

  async upsert(input: UpsertArtistProfileInput): Promise<ArtistProfile> {
    return prisma.artistProfile.upsert({
      where: { id: ID },
      create: { id: ID, ...input },
      update: input,
    })
  }
}
```

- [ ] **Step 7: Criar o storage adapter (infrastructure)**

`mirelits/modules/artist-profile/infrastructure/artist-profile.storage.adapter.ts`:
```ts
import sharp from 'sharp'
import type { IArtistProfileStorage } from '../core/artist-profile.storage.port'
import { supabase } from '@/lib/supabase'

const BUCKET = 'artist-assets'

export class SupabaseArtistProfileStorageAdapter implements IArtistProfileStorage {
  async uploadProfilePhoto(file: Buffer, filename: string): Promise<string> {
    return this.#upload(file, `profile/${filename}`)
  }

  async uploadLogo(file: Buffer, filename: string): Promise<string> {
    return this.#upload(file, `logo/${filename}`)
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Delete falhou: ${error.message}`)
  }

  async #upload(file: Buffer, path: string): Promise<string> {
    const compressed = await sharp(file).webp({ quality: 85 }).toBuffer()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(`Upload falhou: ${error.message}`)
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add mirelits/modules/artist-profile/
git commit -m "feat: módulo artist-profile com upsert e upload de imagens"
```

---

## Task 9: Módulo Site Settings

**Files:**
- Create: `mirelits/modules/site-settings/core/site-settings.entity.ts`
- Create: `mirelits/modules/site-settings/core/site-settings.repository.port.ts`
- Create: `mirelits/modules/site-settings/application/site-settings.service.ts`
- Create: `mirelits/modules/site-settings/application/site-settings.service.test.ts`
- Create: `mirelits/modules/site-settings/infrastructure/site-settings.repository.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/site-settings/application/site-settings.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SiteSettingsService } from './site-settings.service'
import type { ISiteSettingsRepository } from '../core/site-settings.repository.port'

const mockRepo: ISiteSettingsRepository = {
  get: vi.fn(),
  upsert: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const defaultSettings = {
  id: 'singleton', primaryColor: '#000000', secondaryColor: '#ffffff',
  accentColor: '#ff0000', updatedAt: new Date(),
}

describe('SiteSettingsService', () => {
  it('get retorna as definições existentes', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue(defaultSettings)
    const service = new SiteSettingsService(mockRepo)
    const result = await service.get()
    expect(result).toEqual(defaultSettings)
    expect(mockRepo.upsert).not.toHaveBeenCalled()
  })

  it('get cria as definições padrão quando não existem', async () => {
    vi.mocked(mockRepo.get).mockResolvedValue(null)
    vi.mocked(mockRepo.upsert).mockResolvedValue(defaultSettings)
    const service = new SiteSettingsService(mockRepo)
    await service.get()
    expect(mockRepo.upsert).toHaveBeenCalledWith({
      primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#ff0000',
    })
  })

  it('update chama upsert com as novas cores', async () => {
    vi.mocked(mockRepo.upsert).mockResolvedValue(defaultSettings)
    const service = new SiteSettingsService(mockRepo)
    await service.update({ primaryColor: '#111', secondaryColor: '#eee', accentColor: '#f00' })
    expect(mockRepo.upsert).toHaveBeenCalledWith({
      primaryColor: '#111', secondaryColor: '#eee', accentColor: '#f00',
    })
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/site-settings
```

- [ ] **Step 3: Criar entidade e port**

`mirelits/modules/site-settings/core/site-settings.entity.ts`:
```ts
export type SiteSettings = {
  id: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  updatedAt: Date
}
```

`mirelits/modules/site-settings/core/site-settings.repository.port.ts`:
```ts
import type { SiteSettings } from './site-settings.entity'

export type UpdateSiteSettingsInput = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export interface ISiteSettingsRepository {
  get(): Promise<SiteSettings | null>
  upsert(input: UpdateSiteSettingsInput): Promise<SiteSettings>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/site-settings/application/site-settings.service.ts`:
```ts
import type { ISiteSettingsRepository, UpdateSiteSettingsInput } from '../core/site-settings.repository.port'
import type { SiteSettings } from '../core/site-settings.entity'

const DEFAULTS: UpdateSiteSettingsInput = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#ff0000',
}

export class SiteSettingsService {
  constructor(private readonly repo: ISiteSettingsRepository) {}

  async get(): Promise<SiteSettings> {
    const settings = await this.repo.get()
    if (settings) return settings
    return this.repo.upsert(DEFAULTS)
  }

  update(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    return this.repo.upsert(input)
  }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/site-settings
```

Resultado esperado: PASS (3 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/site-settings/infrastructure/site-settings.repository.ts`:
```ts
import type { ISiteSettingsRepository, UpdateSiteSettingsInput } from '../core/site-settings.repository.port'
import type { SiteSettings } from '../core/site-settings.entity'
import { prisma } from '@/lib/prisma'

const ID = 'singleton'

export class PrismaSiteSettingsRepository implements ISiteSettingsRepository {
  async get(): Promise<SiteSettings | null> {
    return prisma.siteSettings.findUnique({ where: { id: ID } })
  }

  async upsert(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    return prisma.siteSettings.upsert({
      where: { id: ID },
      create: { id: ID, ...input },
      update: input,
    })
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add mirelits/modules/site-settings/
git commit -m "feat: módulo site-settings com upsert e defaults"
```

---

## Task 10: Módulo Timeline

**Files:**
- Create: `mirelits/modules/timeline/core/timeline.entity.ts`
- Create: `mirelits/modules/timeline/core/timeline.repository.port.ts`
- Create: `mirelits/modules/timeline/application/timeline.service.ts`
- Create: `mirelits/modules/timeline/application/timeline.service.test.ts`
- Create: `mirelits/modules/timeline/infrastructure/timeline.repository.ts`

- [ ] **Step 1: Escrever o teste (falha esperada)**

`mirelits/modules/timeline/application/timeline.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TimelineService } from './timeline.service'
import type { ITimelineRepository } from '../core/timeline.repository.port'

const mockRepo: ITimelineRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const baseEntry = {
  id: 't1', title: 'Formação', description: null, year: 2018, position: 0, createdAt: new Date(),
}

describe('TimelineService', () => {
  it('getAll retorna todas as entradas', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([baseEntry])
    const service = new TimelineService(mockRepo)
    const result = await service.getAll()
    expect(result).toHaveLength(1)
  })

  it('create chama repo.create com os dados', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(baseEntry)
    const service = new TimelineService(mockRepo)
    await service.create({ title: 'Formação', year: 2018, position: 0 })
    expect(mockRepo.create).toHaveBeenCalledWith({ title: 'Formação', year: 2018, position: 0 })
  })

  it('delete chama repo.delete com o id', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)
    const service = new TimelineService(mockRepo)
    await service.delete('t1')
    expect(mockRepo.delete).toHaveBeenCalledWith('t1')
  })
})
```

- [ ] **Step 2: Correr o teste — verificar que falha**

```bash
cd mirelits && npm test -- modules/timeline
```

- [ ] **Step 3: Criar entidade e port**

`mirelits/modules/timeline/core/timeline.entity.ts`:
```ts
export type TimelineEntry = {
  id: string
  title: string
  description: string | null
  year: number
  position: number
  createdAt: Date
}
```

`mirelits/modules/timeline/core/timeline.repository.port.ts`:
```ts
import type { TimelineEntry } from './timeline.entity'

export type CreateTimelineEntryInput = {
  title: string
  description?: string
  year: number
  position: number
}

export type UpdateTimelineEntryInput = {
  title?: string
  description?: string | null
  year?: number
  position?: number
}

export interface ITimelineRepository {
  findAll(): Promise<TimelineEntry[]>
  findById(id: string): Promise<TimelineEntry | null>
  create(input: CreateTimelineEntryInput): Promise<TimelineEntry>
  update(id: string, input: UpdateTimelineEntryInput): Promise<TimelineEntry>
  delete(id: string): Promise<void>
}
```

- [ ] **Step 4: Criar o service**

`mirelits/modules/timeline/application/timeline.service.ts`:
```ts
import type { ITimelineRepository, CreateTimelineEntryInput, UpdateTimelineEntryInput } from '../core/timeline.repository.port'
import type { TimelineEntry } from '../core/timeline.entity'

export class TimelineService {
  constructor(private readonly repo: ITimelineRepository) {}

  getAll(): Promise<TimelineEntry[]> { return this.repo.findAll() }
  getById(id: string): Promise<TimelineEntry | null> { return this.repo.findById(id) }
  create(input: CreateTimelineEntryInput): Promise<TimelineEntry> { return this.repo.create(input) }
  update(id: string, input: UpdateTimelineEntryInput): Promise<TimelineEntry> { return this.repo.update(id, input) }
  delete(id: string): Promise<void> { return this.repo.delete(id) }
}
```

- [ ] **Step 5: Correr o teste — verificar que passa**

```bash
cd mirelits && npm test -- modules/timeline
```

Resultado esperado: PASS (3 testes).

- [ ] **Step 6: Criar o repositório (infrastructure)**

`mirelits/modules/timeline/infrastructure/timeline.repository.ts`:
```ts
import type { ITimelineRepository, CreateTimelineEntryInput, UpdateTimelineEntryInput } from '../core/timeline.repository.port'
import type { TimelineEntry } from '../core/timeline.entity'
import { prisma } from '@/lib/prisma'

export class PrismaTimelineRepository implements ITimelineRepository {
  async findAll(): Promise<TimelineEntry[]> {
    return prisma.timelineEntry.findMany({ orderBy: { position: 'asc' } })
  }

  async findById(id: string): Promise<TimelineEntry | null> {
    return prisma.timelineEntry.findUnique({ where: { id } })
  }

  async create(input: CreateTimelineEntryInput): Promise<TimelineEntry> {
    return prisma.timelineEntry.create({ data: input })
  }

  async update(id: string, input: UpdateTimelineEntryInput): Promise<TimelineEntry> {
    return prisma.timelineEntry.update({ where: { id }, data: input })
  }

  async delete(id: string): Promise<void> {
    await prisma.timelineEntry.delete({ where: { id } })
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add mirelits/modules/timeline/
git commit -m "feat: módulo timeline com CRUD"
```

---

## Task 11: Auth.js — Google OAuth

**Files:**
- Create: `mirelits/auth.ts`
- Create: `mirelits/app/api/auth/[...nextauth]/route.ts`
- Create: `mirelits/lib/auth.ts`

- [ ] **Step 1: Correr todos os testes para confirmar que passam antes de continuar**

```bash
cd mirelits && npm test
```

Resultado esperado: todos os testes PASS (17 testes no total).

- [ ] **Step 2: Criar `auth.ts` na raiz**

`mirelits/auth.ts`:
```ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const admin = await prisma.admin.findUnique({ where: { email: user.email } })
      return admin !== null
    },
  },
})
```

- [ ] **Step 3: Criar route handler do Auth.js**

`mirelits/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Criar helper de autenticação**

`mirelits/lib/auth.ts`:
```ts
import { auth } from '@/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return {
      session: null as null,
      error: Response.json({ error: 'Não autorizado' }, { status: 401 }),
    }
  }
  return { session, error: null as null }
}
```

- [ ] **Step 5: Inserir um admin no banco para testar o login**

No Supabase SQL Editor (ou via `prisma studio`):
```sql
INSERT INTO "Admin" (id, email, name, "createdAt")
VALUES (gen_random_uuid(), 'teu-email@gmail.com', 'Admin', NOW());
```

Ou via Prisma Studio:
```bash
cd mirelits && npx prisma studio
```

- [ ] **Step 6: Commit**

```bash
git add mirelits/auth.ts mirelits/app/api/auth/ mirelits/lib/
git commit -m "feat: auth.js com Google OAuth e verificação na tabela Admin"
```

---

## Task 12: Rotas públicas

**Files:**
- Create: `mirelits/app/api/projects/route.ts`
- Create: `mirelits/app/api/projects/[id]/route.ts`
- Create: `mirelits/app/api/contact/route.ts`

- [ ] **Step 1: Criar `GET /api/projects`**

`mirelits/app/api/projects/route.ts`:
```ts
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET() {
  const projects = await service.getAllPublished()
  return Response.json(projects)
}
```

- [ ] **Step 2: Criar `GET /api/projects/[id]`**

`mirelits/app/api/projects/[id]/route.ts`:
```ts
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET(_req: Request, ctx: RouteContext<'/api/projects/[id]'>) {
  const { id } = await ctx.params
  const project = await service.getById(id)
  if (!project || project.status !== 'PUBLISHED') {
    return Response.json({ error: 'Não encontrado' }, { status: 404 })
  }
  return Response.json(project)
}
```

- [ ] **Step 3: Criar `POST /api/contact`**

`mirelits/app/api/contact/route.ts`:
```ts
export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, message } = body

  if (!name || !email || !message) {
    return Response.json({ error: 'name, email e message são obrigatórios' }, { status: 400 })
  }

  // Integração com serviço de email (Resend, etc.) a implementar separadamente
  return Response.json({ ok: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add mirelits/app/api/projects/ mirelits/app/api/contact/
git commit -m "feat: rotas públicas de projectos e contacto"
```

---

## Task 13: Admin API — Projectos

**Files:**
- Create: `mirelits/app/api/admin/projects/route.ts`
- Create: `mirelits/app/api/admin/projects/[id]/route.ts`
- Create: `mirelits/app/api/admin/projects/pins/route.ts`

- [ ] **Step 1: Criar `GET + POST /api/admin/projects`**

`mirelits/app/api/admin/projects/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const projects = await service.getAll()
  return Response.json(projects)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  if (!body.title || typeof body.title !== 'string') {
    return Response.json({ error: 'title é obrigatório' }, { status: 400 })
  }

  const project = await service.create({
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,
  })
  return Response.json(project, { status: 201 })
}
```

- [ ] **Step 2: Criar `GET + PUT + DELETE /api/admin/projects/[id]`**

`mirelits/app/api/admin/projects/[id]/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const projectService = new ProjectService(new PrismaProjectRepository())
const photoService = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function GET(_req: Request, ctx: RouteContext<'/api/admin/projects/[id]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  const project = await projectService.getById(id)
  if (!project) return Response.json({ error: 'Não encontrado' }, { status: 404 })
  return Response.json(project)
}

export async function PUT(req: Request, ctx: RouteContext<'/api/admin/projects/[id]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  const body = await req.json()
  const project = await projectService.update(id, {
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,
    status: body.status,
    coverPhotoId: body.coverPhotoId,
  })
  return Response.json(project)
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/admin/projects/[id]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  await photoService.deleteByProject(id)
  await projectService.delete(id)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 3: Criar `PUT /api/admin/projects/pins`**

`mirelits/app/api/admin/projects/pins/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { ProjectService } from '@/modules/project/application/project.service'
import { PrismaProjectRepository } from '@/modules/project/infrastructure/project.repository'

const service = new ProjectService(new PrismaProjectRepository())

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  // Body: Array<{ id: string; pinned: boolean; pinOrder: number | null }>
  const body = await req.json()
  await service.updatePins(body)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 4: Commit**

```bash
git add mirelits/app/api/admin/projects/
git commit -m "feat: admin API de projectos — CRUD e gestão de pins"
```

---

## Task 14: Admin API — Fotos

**Files:**
- Create: `mirelits/app/api/admin/projects/[id]/photos/route.ts`
- Create: `mirelits/app/api/admin/projects/[id]/photos/[photoId]/route.ts`

- [ ] **Step 1: Criar `POST + PUT /api/admin/projects/[id]/photos`**

`mirelits/app/api/admin/projects/[id]/photos/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const service = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function POST(req: Request, ctx: RouteContext<'/api/admin/projects/[id]/photos'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'file é obrigatório' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await service.upload(id, buffer, file.name)
  return Response.json(result, { status: 201 })
}

export async function PUT(req: Request, ctx: RouteContext<'/api/admin/projects/[id]/photos'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  // Body: Array<{ id: string; position: number }>
  const body = await req.json()
  await service.reorder(id, body)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 2: Criar `DELETE /api/admin/projects/[id]/photos/[photoId]`**

`mirelits/app/api/admin/projects/[id]/photos/[photoId]/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { PhotoService } from '@/modules/photo/application/photo.service'
import { PrismaPhotoRepository } from '@/modules/photo/infrastructure/photo.repository'
import { SupabasePhotoStorageAdapter } from '@/modules/photo/infrastructure/photo.storage.adapter'

const service = new PhotoService(new PrismaPhotoRepository(), new SupabasePhotoStorageAdapter())

export async function DELETE(_req: Request, ctx: RouteContext<'/api/admin/projects/[id]/photos/[photoId]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { photoId } = await ctx.params
  await service.delete(photoId)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 3: Commit**

```bash
git add mirelits/app/api/admin/projects/
git commit -m "feat: admin API de fotos — upload, reordenação e delete"
```

---

## Task 15: Admin API — Perfil e Configurações

**Files:**
- Create: `mirelits/app/api/admin/artist-profile/route.ts`
- Create: `mirelits/app/api/admin/site-settings/route.ts`

- [ ] **Step 1: Criar `GET + PUT /api/admin/artist-profile`**

`mirelits/app/api/admin/artist-profile/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { ArtistProfileService } from '@/modules/artist-profile/application/artist-profile.service'
import { PrismaArtistProfileRepository } from '@/modules/artist-profile/infrastructure/artist-profile.repository'
import { SupabaseArtistProfileStorageAdapter } from '@/modules/artist-profile/infrastructure/artist-profile.storage.adapter'

const service = new ArtistProfileService(
  new PrismaArtistProfileRepository(),
  new SupabaseArtistProfileStorageAdapter(),
)

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const profile = await service.get()
  return Response.json(profile)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const formData = await req.formData()
  const name = formData.get('name') as string | null
  const shortBio = formData.get('shortBio') as string | null
  const fullBio = formData.get('fullBio') as string | null

  if (!name || !shortBio || !fullBio) {
    return Response.json({ error: 'name, shortBio e fullBio são obrigatórios' }, { status: 400 })
  }

  const profilePhotoFile = formData.get('profilePhoto') as File | null
  const logoFile = formData.get('logo') as File | null

  const profilePhoto = profilePhotoFile ? Buffer.from(await profilePhotoFile.arrayBuffer()) : undefined
  const logo = logoFile ? Buffer.from(await logoFile.arrayBuffer()) : undefined

  const profile = await service.update({ name, shortBio, fullBio, profilePhoto, logo })
  return Response.json(profile)
}
```

- [ ] **Step 2: Criar `GET + PUT /api/admin/site-settings`**

`mirelits/app/api/admin/site-settings/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { SiteSettingsService } from '@/modules/site-settings/application/site-settings.service'
import { PrismaSiteSettingsRepository } from '@/modules/site-settings/infrastructure/site-settings.repository'

const service = new SiteSettingsService(new PrismaSiteSettingsRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const settings = await service.get()
  return Response.json(settings)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { primaryColor, secondaryColor, accentColor } = body

  if (!primaryColor || !secondaryColor || !accentColor) {
    return Response.json({ error: 'Todas as cores são obrigatórias' }, { status: 400 })
  }

  const settings = await service.update({ primaryColor, secondaryColor, accentColor })
  return Response.json(settings)
}
```

- [ ] **Step 3: Commit**

```bash
git add mirelits/app/api/admin/artist-profile/ mirelits/app/api/admin/site-settings/
git commit -m "feat: admin API de perfil da artista e configurações do site"
```

---

## Task 16: Admin API — Timeline

**Files:**
- Create: `mirelits/app/api/admin/timeline/route.ts`
- Create: `mirelits/app/api/admin/timeline/[id]/route.ts`

- [ ] **Step 1: Criar `GET + POST /api/admin/timeline`**

`mirelits/app/api/admin/timeline/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { TimelineService } from '@/modules/timeline/application/timeline.service'
import { PrismaTimelineRepository } from '@/modules/timeline/infrastructure/timeline.repository'

const service = new TimelineService(new PrismaTimelineRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const entries = await service.getAll()
  return Response.json(entries)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  if (!body.title || !body.year || body.position === undefined) {
    return Response.json({ error: 'title, year e position são obrigatórios' }, { status: 400 })
  }

  const entry = await service.create({
    title: body.title,
    description: body.description,
    year: body.year,
    position: body.position,
  })
  return Response.json(entry, { status: 201 })
}
```

- [ ] **Step 2: Criar `PUT + DELETE /api/admin/timeline/[id]`**

`mirelits/app/api/admin/timeline/[id]/route.ts`:
```ts
import { requireAuth } from '@/lib/auth'
import { TimelineService } from '@/modules/timeline/application/timeline.service'
import { PrismaTimelineRepository } from '@/modules/timeline/infrastructure/timeline.repository'

const service = new TimelineService(new PrismaTimelineRepository())

export async function PUT(req: Request, ctx: RouteContext<'/api/admin/timeline/[id]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  const body = await req.json()
  const entry = await service.update(id, {
    title: body.title,
    description: body.description,
    year: body.year,
    position: body.position,
  })
  return Response.json(entry)
}

export async function DELETE(_req: Request, ctx: RouteContext<'/api/admin/timeline/[id]'>) {
  const { error } = await requireAuth()
  if (error) return error

  const { id } = await ctx.params
  await service.delete(id)
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 3: Correr todos os testes finais**

```bash
cd mirelits && npm test
```

Resultado esperado: todos os testes PASS.

- [ ] **Step 4: Commit final**

```bash
git add mirelits/app/api/admin/timeline/
git commit -m "feat: admin API de timeline — CRUD completo"
```

---

## Task 17: Verificação final e configuração dos buckets Supabase

- [ ] **Step 1: Criar os buckets no Supabase Storage**

No dashboard Supabase → Storage → New bucket:
1. Nome: `project-photos`, acesso público: ✅
2. Nome: `artist-assets`, acesso público: ✅

- [ ] **Step 2: Correr o servidor de desenvolvimento**

```bash
cd mirelits && npm run dev
```

Resultado esperado: servidor a correr em `http://localhost:3000` sem erros de compilação.

- [ ] **Step 3: Testar o endpoint público**

```bash
curl http://localhost:3000/api/projects
```

Resultado esperado: `[]` (lista vazia — ainda não há projectos publicados).

- [ ] **Step 4: Testar o endpoint admin sem autenticação**

```bash
curl http://localhost:3000/api/admin/projects
```

Resultado esperado: `{"error":"Não autorizado"}` com status 401.

- [ ] **Step 5: Commit final de verificação**

```bash
git add -A
git commit -m "chore: verificação final — backend completo e funcional"
```
