'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from './avatar'
import { SocialIcon } from './social-icon'

interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
}

interface HeaderProfile {
  name: string
  tagline?: string | null
  profileHue?: string
  profilePhotoUrl?: string | null
  socialLinks?: SocialLink[]
}

const LINKS = [
  { label: 'Projetos', href: '/', match: (p: string) => p === '/' || p.startsWith('/projeto') },
  { label: 'Sobre',    href: '/sobre',   match: (p: string) => p === '/sobre' },
  { label: 'Contato',  href: '/contato', match: (p: string) => p === '/contato' },
]

const MAX_ICONS = 3

export function Header({ profile }: { profile: HeaderProfile }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const [bar, setBar] = useState({ left: 0, width: 0, ready: false })

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector('[data-active="true"]') as HTMLElement | null
    if (!active) { setBar(b => ({ ...b, ready: false })); return }
    const navRect = nav.getBoundingClientRect()
    const linkRect = active.getBoundingClientRect()
    setBar({ left: linkRect.left - navRect.left, width: linkRect.width, ready: true })
  }, [pathname])

  const links = profile.socialLinks ?? []
  const visibleLinks = links.slice(0, MAX_ICONS)
  const overflow = links.length - MAX_ICONS

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
        <nav
          ref={navRef}
          style={{ display: 'none', alignItems: 'center', gap: 26, position: 'relative', alignSelf: 'stretch' }}
          className="nav-desk"
        >
          {LINKS.map((l) => {
            const active = l.match(pathname)
            return (
              <Link key={l.href} href={l.href} className="mono"
                data-active={active ? 'true' : undefined}
                style={{
                  fontSize: 13, letterSpacing: '0.04em', padding: '6px 2px',
                  color: active ? 'var(--ink)' : 'var(--ink-soft)',
                  transition: 'color .2s',
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                {l.label}
              </Link>
            )
          })}
          <Link href="/contato" className="btn btn--sm" style={{ marginLeft: 4 }}>
            Propor projeto
          </Link>

          {links.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10, paddingLeft: 14, borderLeft: '1px solid var(--line)' }}>
              {visibleLinks.map((sl) => (
                <a key={sl.id} href={sl.url} target="_blank" rel="noopener noreferrer"
                  title={sl.label}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, color: 'var(--ink-soft)', transition: 'color .15s, background .15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; (e.currentTarget as HTMLElement).style.background = 'var(--line-soft)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-soft)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <SocialIcon platform={sl.platform} size={17} />
                </a>
              ))}
              {overflow > 0 && (
                <Link href="/sobre#redes"
                  className="mono"
                  style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--ink-faint)', paddingInline: 7, paddingBlock: 3, borderRadius: 99, border: '1px solid var(--line)' }}
                >
                  +{overflow}
                </Link>
              )}
            </div>
          )}

          {/* sliding indicator */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: bar.left,
              width: bar.width,
              height: 2,
              background: 'var(--acc-1)',
              borderRadius: 1,
              opacity: bar.ready ? 1 : 0,
              transition: 'left 0.25s cubic-bezier(.2,.7,.2,1), width 0.25s cubic-bezier(.2,.7,.2,1), opacity 0.15s',
              pointerEvents: 'none',
            }}
          />
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

          {/* social links on mobile */}
          {links.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
              {links.map((sl) => (
                <a key={sl.id} href={sl.url} target="_blank" rel="noopener noreferrer"
                  title={sl.label}
                  onClick={() => setOpen(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 99, border: '1px solid var(--line)', color: 'var(--ink-soft)', fontSize: 13 }}
                >
                  <SocialIcon platform={sl.platform} size={15} />
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '.04em' }}>{sl.label}</span>
                </a>
              ))}
            </div>
          )}
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
