import { requireAuth } from '@/lib/auth'
import { SiteSettingsService } from '@/modules/site-settings/application/site-settings.service'
import { PrismaSiteSettingsRepository } from '@/modules/site-settings/infrastructure/site-settings.repository'

const service = new SiteSettingsService(new PrismaSiteSettingsRepository())

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const settings = await service.get()
  return Response.json(settings)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { primaryColor, secondaryColor, accentColor } = body

  if (!primaryColor || !secondaryColor || !accentColor) {
    return Response.json({ error: 'Todas as cores são obrigatórias' }, { status: 400 })
  }

  const settings = await service.update({ primaryColor, secondaryColor, accentColor })
  return Response.json(settings)
}
