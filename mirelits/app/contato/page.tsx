import { prisma } from '@/lib/prisma'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ContatoForm } from './contato-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato — mirelits',
  description: 'Proponha um projeto de ilustração, quadrinho, capa ou padronagem.',
}

async function getProfile() {
  try {
    return await prisma.artistProfile.findFirst({
      select: { name: true, tagline: true, profileHue: true, profilePhotoUrl: true, email: true, handle: true },
    })
  } catch {
    return null
  }
}

async function getSocialLinks() {
  try { return await prisma.socialLink.findMany({ orderBy: { position: 'asc' } }) }
  catch { return [] }
}

export default async function ContatoPage() {
  const [profile, socialLinks] = await Promise.all([getProfile(), getSocialLinks()])
  const name = profile?.name ?? 'mirelits'

  return (
    <>
      <Header
        profile={{
          name,
          tagline: profile?.tagline,
          profileHue: profile?.profileHue ?? 'laranja',
          profilePhotoUrl: profile?.profilePhotoUrl,
          socialLinks,
        }}
      />

      <main style={{ flex: 1 }}>
        <div className="wrap route" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 80 }}>
          <ContatoForm
            email={profile?.email ?? 'ola@mirelits.com'}
            handle={profile?.handle ?? '@mirelits'}
          />
        </div>
      </main>

      <Footer profile={{ name, profileHue: profile?.profileHue ?? 'laranja', profilePhotoUrl: profile?.profilePhotoUrl }} />
    </>
  )
}
