'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from './avatar'

interface HeaderProfile {
  name: string
  tagline?: string | null
  profileHue?: string
  profilePhotoUrl?: string | null
}

const LINKS = [
  { label: 'Projetos', href: '/', match: (p: string) => p === '/' || p.startsWith('/projeto') },
  { label: 'Sobre',    href: '/sobre',   match: (p: string) => p === '/sobre' },
  { label: 'Contato',  href: '/contato', match: (p: string) => p === '/contato' },
]

export function Header({ profile }: { profile: HeaderProfile }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'color-mix(in oklch, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 }}>
        {/* logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <Avatar name={profile.name} profileHue={profile.profileHue} profilePhotoUrl={profile.profilePhotoUrl} size={34} />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05, minWidth: 0 }}>
            <span className="serif" style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              {profile.name}
            </span>
            {profile.tagline && (
              <span className="mono" style={{ fontSize: 9.5, letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                {profile.tagline}
              </span>
            )}
          </span>
        </Link>

        {/* desktop nav */}
        <nav style={{ display: 'none', alignItems: 'center', gap: 26 }} className="nav-desk">
          {LINKS.map((l) => {
            const active = l.match(pathname)
            return (
              <Link key={l.href} href={l.href} className="mono" style={{
                fontSize: 13, letterSpacing: '0.04em', padding: '6px 2px',
                color: active ? 'var(--ink)' : 'var(--ink-soft)',
                borderBottom: `2px solid ${active ? 'var(--acc-1)' : 'transparent'}`,
                transition: 'color .2s, border-color .2s',
              }}>
                {l.label}
              </Link>
            )
          })}
          <Link href="/contato" className="btn btn--sm" style={{ marginLeft: 4 }}>
            Propor projeto
          </Link>
        </nav>

        {/* mobile burger */}
        <button
          className="nav-burger"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((o) => !o)}
          style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, background: 'none', border: 'none', padding: 8 }}
        >
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'transform .25s', transform: open ? 'translateY(6px) rotate(45deg)' : 'none', display: 'block' }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, opacity: open ? 0 : 1, transition: 'opacity .2s', display: 'block' }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'transform .25s', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none', display: 'block' }} />
        </button>
      </div>

      {/* mobile menu */}
      <div style={{
        overflow: 'hidden',
        borderBottom: open ? '1px solid var(--line-soft)' : 'none',
        maxHeight: open ? 320 : 0,
        transition: 'max-height .3s cubic-bezier(.2,.7,.2,1)',
        background: 'var(--bg)',
      }}>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBlock: open ? 12 : 0 }}>
          {LINKS.map((l) => {
            const active = l.match(pathname)
            return (
              <Link key={l.href} href={l.href} className="serif" onClick={() => setOpen(false)} style={{
                fontSize: 28, padding: '8px 0',
                color: active ? 'var(--acc-1-ink)' : 'var(--ink)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {active && <span className="dot" style={{ background: 'var(--acc-1)' }} />}
                {l.label}
              </Link>
            )
          })}
          <Link href="/contato" className="btn" onClick={() => setOpen(false)} style={{ marginTop: 8, justifyContent: 'center' }}>
            Propor projeto
          </Link>
        </div>
      </div>

      <style>{`
        @media (min-width: 760px) {
          .nav-desk { display: flex !important; }
          .nav-burger { display: none !important; }
        }
      `}</style>
    </header>
  )
}
