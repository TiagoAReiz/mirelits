import type { ArtistProfile } from './artist-profile.entity'

export type UpsertArtistProfileInput = {
  name: string
  shortBio: string
  fullBio: string
  profilePhotoUrl?: string | null
  logoUrl?: string | null
}

export interface IArtistProfileRepository {
  get(): Promise<ArtistProfile | null>
  upsert(input: UpsertArtistProfileInput): Promise<ArtistProfile>
}
