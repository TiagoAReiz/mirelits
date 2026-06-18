import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

async function getHeaderData() {
  try {
    const [profile, socialLinks] = await Promise.all([
      prisma.artistProfile.findFirst({
        select: { name: true, tagline: true, profileHue: true, profilePhotoUrl: true },
      }),
      prisma.socialLink.findMany({ orderBy: { position: 'asc' } }),
    ])
    return { profile, socialLinks }
  } catch {
    return { profile: null, socialLinks: [] }
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { profile, socialLinks } = await getHeaderData()
  const name = profile?.name ?? 'mirelits'
  const profileHue = profile?.profileHue ?? 'laranja'

  return (
    <>
      <Header
        profile={{
          name,
          tagline: profile?.tagline,
          profileHue,
          profilePhotoUrl: profile?.profilePhotoUrl,
          socialLinks,
        }}
      />
      {children}
      <Footer profile={{ name, profileHue, profilePhotoUrl: profile?.profilePhotoUrl }} />
    </>
  )
}
