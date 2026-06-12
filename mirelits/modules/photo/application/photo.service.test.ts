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
