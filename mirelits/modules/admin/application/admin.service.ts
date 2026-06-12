import type { IAdminRepository } from '../core/admin.repository.port'

export class AdminService {
  constructor(private readonly repo: IAdminRepository) {}

  async isAuthorized(email: string): Promise<boolean> {
    const admin = await this.repo.findByEmail(email)
    return admin !== null
  }
}
