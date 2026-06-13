import { prisma } from '@/lib/prisma'
import { AdminShell } from '@/components/admin-shell'
import { ConfigEditor } from './config-editor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configurações — Admin · mirelits' }
export const dynamic = 'force-dynamic'

async function getData() {
  const [profile, timeline, socialLinks] = await Promise.all([
    prisma.artistProfile.findFirst(),
    prisma.timelineEntry.findMany({ orderBy: { position: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { position: 'asc' } }),
  ])
  return { profile, timeline, socialLinks }
}

const DEFAULT_PROFILE = {
  name: 'mirelits', handle: '@mirelits',
  tagline: 'Ilustradora & quadrinista', location: 'São Paulo, Brasil',
  email: 'ola@mirelits.com', shortBio: '', fullBio: '',
  profileHue: 'laranja', profilePhotoUrl: null,
  colorBg: null, colorInk: null, colorAcc1: null, colorAcc2: null, colorAcc3: null,
}

export default async function ConfiguracoesPage() {
  const { profile, timeline, socialLinks } = await getData()
  const artistName = profile?.name ?? 'mirelits'

  const profileData = {
    name: profile?.name ?? DEFAULT_PROFILE.name,
    handle: profile?.handle ?? DEFAULT_PROFILE.handle,
    tagline: profile?.tagline ?? DEFAULT_PROFILE.tagline,
    location: profile?.location ?? DEFAULT_PROFILE.location,
    email: profile?.email ?? DEFAULT_PROFILE.email,
    shortBio: profile?.shortBio ?? DEFAULT_PROFILE.shortBio,
    fullBio: profile?.fullBio ?? DEFAULT_PROFILE.fullBio,
    profileHue: profile?.profileHue ?? DEFAULT_PROFILE.profileHue,
    profilePhotoUrl: profile?.profilePhotoUrl ?? null,
    colorBg: profile?.colorBg ?? null,
    colorInk: profile?.colorInk ?? null,
    colorAcc1: profile?.colorAcc1 ?? null,
    colorAcc2: profile?.colorAcc2 ?? null,
    colorAcc3: profile?.colorAcc3 ?? null,
  }

  const timelineData = timeline.map((t) => ({
    id: t.id,
    year: t.year,
    title: t.title,
    description: t.description ?? null,
    position: t.position,
  }))

  return (
    <AdminShell artistName={artistName} profilePhotoUrl={profileData.profilePhotoUrl} profileHue={profileData.profileHue}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <span className="dot" style={{ background: 'var(--acc-2)' }} />
          <span className="label">Ajustes</span>
        </div>
        <h1 className="serif" style={{ fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.05, margin: 0, fontWeight: 500 }}>
          Configurações do site
        </h1>
      </div>

      <ConfigEditor profile={profileData} timeline={timelineData} socialLinks={socialLinks} />
    </AdminShell>
  )
}
