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
