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
