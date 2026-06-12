import type { ISiteSettingsRepository, UpdateSiteSettingsInput } from '../core/site-settings.repository.port'
import type { SiteSettings } from '../core/site-settings.entity'

const DEFAULTS: UpdateSiteSettingsInput = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#ff0000',
}

export class SiteSettingsService {
  constructor(private readonly repo: ISiteSettingsRepository) {}

  async get(): Promise<SiteSettings> {
    const settings = await this.repo.get()
    if (settings) return settings
    return this.repo.upsert(DEFAULTS)
  }

  update(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    return this.repo.upsert(input)
  }
}
