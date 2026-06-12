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
        id: true, title: true, subtitle: true, status: true, pinned: true, pinOrder: true,
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
