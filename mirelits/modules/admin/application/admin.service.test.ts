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
