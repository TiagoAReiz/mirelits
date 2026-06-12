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
