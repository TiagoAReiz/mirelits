import type { IArtistProfileRepository, UpsertArtistProfileInput } from '../core/artist-profile.repository.port'
import type { ArtistProfile } from '../core/artist-profile.entity'
import { prisma } from '@/lib/prisma'

const ID = 'singleton'

export class PrismaArtistProfileRepository implements IArtistProfileRepository {
  async get(): Promise<ArtistProfile | null> {
    return prisma.artistProfile.findUnique({ where: { id: ID } })
  }

  async upsert(input: UpsertArtistProfileInput): Promise<ArtistProfile> {
    return prisma.artistProfile.upsert({
      where: { id: ID },
      create: { id: ID, ...input },
      update: input,
    })
  }
}
