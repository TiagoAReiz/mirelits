import Link from 'next/link'
import { Avatar } from './avatar'

interface FooterProfile {
  name: string
  profileHue?: string
  profilePhotoUrl?: string | null
}

export function Footer({ profile }: { profile: FooterProfile }) {
  return (
    <footer style={{ borderTop: '1px solid var(--line-soft)', marginTop: 72, paddingBlock: 36 }}>
      <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={profile.name} profileHue={profile.profileHue} profilePhotoUrl={profile.profilePhotoUrl} size={30} />
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            {profile.name} © {new Date().getFullYear()}<br />
            <span style={{ color: 'var(--ink-faint)' }}>Não autorizo uso destas imagens para fins de IA.</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link href="/sobre" className="label" style={{ color: 'var(--ink-soft)' }}>Sobre</Link>
          <Link href="/contato" className="label" style={{ color: 'var(--ink-soft)' }}>Contato</Link>
          <Link href="/admin/login" className="label" title="Área da artista" style={{ color: 'var(--ink-faint)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="dot" style={{ background: 'var(--acc-2)' }} />
            Área da artista
          </Link>
        </div>
      </div>
    </footer>
  )
}
