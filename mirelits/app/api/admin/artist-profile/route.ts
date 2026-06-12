import { requireAuth } from '@/lib/auth'
import { ArtistProfileService } from '@/modules/artist-profile/application/artist-profile.service'
import { PrismaArtistProfileRepository } from '@/modules/artist-profile/infrastructure/artist-profile.repository'
import { SupabaseArtistProfileStorageAdapter } from '@/modules/artist-profile/infrastructure/artist-profile.storage.adapter'

const service = new ArtistProfileService(
  new PrismaArtistProfileRepository(),
  new SupabaseArtistProfileStorageAdapter(),
)

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const profile = await service.get()
  return Response.json(profile)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const formData = await req.formData()
  const name = formData.get('name') as string | null
  const shortBio = formData.get('shortBio') as string | null
  const fullBio = formData.get('fullBio') as string | null

  if (!name || !shortBio || !fullBio) {
    return Response.json({ error: 'name, shortBio e fullBio são obrigatórios' }, { status: 400 })
  }

  const profilePhotoFile = formData.get('profilePhoto') as File | null
  const logoFile = formData.get('logo') as File | null

  const profilePhoto = profilePhotoFile ? Buffer.from(await profilePhotoFile.arrayBuffer()) : undefined
  const logo = logoFile ? Buffer.from(await logoFile.arrayBuffer()) : undefined

  const profile = await service.update({ name, shortBio, fullBio, profilePhoto, logo })
  return Response.json(profile)
}
