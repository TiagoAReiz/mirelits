import type { IAdminRepository } from '../core/admin.repository.port'
import type { Admin } from '../core/admin.entity'
import { prisma } from '@/lib/prisma'

export class PrismaAdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { email } })
  }
}
