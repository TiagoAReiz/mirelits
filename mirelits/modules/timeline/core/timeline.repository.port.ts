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
