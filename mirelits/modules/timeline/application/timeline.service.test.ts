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
  id: 't1', title: 'Formação', description: null, year: '2018', position: 0, createdAt: new Date(),
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
    await service.create({ title: 'Formação', year: '2018', position: 0 })
    expect(mockRepo.create).toHaveBeenCalledWith({ title: 'Formação', year: '2018', position: 0 })
  })

  it('delete chama repo.delete com o id', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)
    const service = new TimelineService(mockRepo)
    await service.delete('t1')
    expect(mockRepo.delete).toHaveBeenCalledWith('t1')
  })
})
