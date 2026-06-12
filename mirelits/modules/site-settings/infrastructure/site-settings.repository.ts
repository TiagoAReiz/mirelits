import type { ISiteSettingsRepository, UpdateSiteSettingsInput } from '../core/site-settings.repository.port'
import type { SiteSettings } from '../core/site-settings.entity'
import { prisma } from '@/lib/prisma'

/**
 * NOTE: The SiteSettings model was merged into ArtistProfile (colorBg, colorInk, colorAcc1-3).
 * This repository is kept for backwards compatibility with the API route but delegates
 * color storage to ArtistProfile.
 */
export class PrismaSiteSettingsRepository implements ISiteSettingsRepository {
  async get(): Promise<SiteSettings | null> {
    const profile = await prisma.artistProfile.findFirst({
      select: { colorAcc1: true, colorAcc2: true, colorAcc3: true },
    })
    if (!profile) return null
    return {
      id: 'singleton',
      primaryColor: profile.colorAcc1 ?? '#000000',
      secondaryColor: profile.colorAcc2 ?? '#ffffff',
      accentColor: profile.colorAcc3 ?? '#ff0000',
    }
  }

  async upsert(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    let profile = await prisma.artistProfile.findFirst()
    if (!profile) profile = await prisma.artistProfile.create({ data: {} })

    await prisma.artistProfile.update({
      where: { id: profile.id },
      data: {
        colorAcc1: input.primaryColor,
        colorAcc2: input.secondaryColor,
        colorAcc3: input.accentColor,
      },
    })

    return {
      id: 'singleton',
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
    }
  }
}
