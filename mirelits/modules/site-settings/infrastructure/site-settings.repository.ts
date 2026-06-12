import type { ISiteSettingsRepository, UpdateSiteSettingsInput } from '../core/site-settings.repository.port'
import type { SiteSettings } from '../core/site-settings.entity'
import { prisma } from '@/lib/prisma'

const ID = 'singleton'

export class PrismaSiteSettingsRepository implements ISiteSettingsRepository {
  async get(): Promise<SiteSettings | null> {
    return prisma.siteSettings.findUnique({ where: { id: ID } })
  }

  async upsert(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    return prisma.siteSettings.upsert({
      where: { id: ID },
      create: { id: ID, ...input },
      update: input,
    })
  }
}
