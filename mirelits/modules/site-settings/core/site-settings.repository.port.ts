import type { SiteSettings } from './site-settings.entity'

export type UpdateSiteSettingsInput = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export interface ISiteSettingsRepository {
  get(): Promise<SiteSettings | null>
  upsert(input: UpdateSiteSettingsInput): Promise<SiteSettings>
}
