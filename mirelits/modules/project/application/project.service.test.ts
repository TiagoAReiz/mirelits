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
