'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const TABS = [
  { label: 'Projetos', href: '/admin/projetos', match: (p: string) => p.startsWith('/admin/projetos') },
  { label: 'Configurações', href: '/admin/configuracoes', match: (p: string) => p.startsWith('/admin/configuracoes') },
]

interface AdminShellProps {
  children: React.ReactNode
  artistName?: string
}

export function AdminShell({ children, artistName = 'mirelits' }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, gap: 14 }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--acc-1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span className="serif" style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>M</span>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1, color: 'white', whiteSpace: 'nowrap' }}>
                {artistName}
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', opacity: 0.5, textTransform: 'uppercase', color: 'white' }}>
                modo artista
              </div>
            </div>
          </div>

          {/* tabs */}
          <nav style={{ display: 'flex', alignItems: 'stretch', gap: 0, flex: 1, marginLeft: 16 }}>
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`admin-tab${t.match(pathname) ? ' admin-tab--active' : ''}`}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          {/* right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link
              href="/"
              className="mono"
              style={{ fontSize: 11, padding: '6px 10px', color: 'color-mix(in oklch, white 55%, transparent)', letterSpacing: '.04em' }}
            >
              Ver site ↗
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mono"
              style={{
                fontSize: 11, padding: '6px 12px', borderRadius: 99,
                background: 'transparent', border: '1px solid color-mix(in oklch, white 25%, transparent)',
                color: 'color-mix(in oklch, white 65%, transparent)', letterSpacing: '.04em',
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main wrap">
        {children}
      </div>
    </div>
  )
}
