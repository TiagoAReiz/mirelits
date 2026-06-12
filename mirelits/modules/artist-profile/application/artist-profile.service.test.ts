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
