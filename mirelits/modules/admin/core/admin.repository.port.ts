import type { Admin } from './admin.entity'

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>
}
