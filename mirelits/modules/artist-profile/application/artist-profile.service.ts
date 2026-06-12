import type { IArtistProfileRepository } from '../core/artist-profile.repository.port'
import type { IArtistProfileStorage } from '../core/artist-profile.storage.port'
import type { ArtistProfile } from '../core/artist-profile.entity'

export type UpdateArtistProfileInput = {
  name: string
  shortBio: string
  fullBio: string
  profilePhoto?: Buffer
  logo?: Buffer
}

export class ArtistProfileService {
  constructor(
    private readonly repo: IArtistProfileRepository,
    private readonly storage: IArtistProfileStorage,
  ) {}

  get(): Promise<ArtistProfile | null> {
    return this.repo.get()
  }

  async update(input: UpdateArtistProfileInput): Promise<ArtistProfile> {
    const current = await this.repo.get()
    let profilePhotoUrl = current?.profilePhotoUrl ?? null
    let logoUrl = current?.logoUrl ?? null

    if (input.profilePhoto) {
      profilePhotoUrl = await this.storage.uploadProfilePhoto(
        input.profilePhoto, `profile-${Date.now()}.webp`,
      )
    }
    if (input.logo) {
      logoUrl = await this.storage.uploadLogo(input.logo, `logo-${Date.now()}.webp`)
    }

    return this.repo.upsert({ name: input.name, shortBio: input.shortBio, fullBio: input.fullBio, profilePhotoUrl, logoUrl })
  }
}
