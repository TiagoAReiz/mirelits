import { prisma } from '@/lib/prisma'
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

export default async function ContatoPage() {
  const profile = await getProfile()

  return (
    <main style={{ flex: 1 }}>
      <div className="wrap route" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 80 }}>
        <ContatoForm
          email={profile?.email ?? 'ola@mirelits.com'}
          handle={profile?.handle ?? '@mirelits'}
        />
      </div>
    </main>
  )
}
