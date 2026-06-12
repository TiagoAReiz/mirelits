'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const accessDenied = error === 'access_denied'

  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 'var(--gut)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--acc-1)', display: 'grid', placeItems: 'center' }}>
            <span className="serif" style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>M</span>
          </div>
        </a>

        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center', marginBottom: 8 }}>
            <span className="dot" style={{ background: 'var(--acc-2)' }} />
            <span className="label">Área da artista</span>
          </div>
          <h1 className="serif" style={{ fontSize: 38, margin: '12px 0 0', fontWeight: 500 }}>
            Entrar no ateliê
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8, fontSize: 14.5 }}>
            Acesso restrito para gerenciar projetos e ajustes do site.
          </p>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, display: 'grid', gap: 14 }}>
          {accessDenied && (
            <div className="mono" style={{ fontSize: 12, color: 'var(--acc-1-ink)', padding: '10px 12px', background: 'color-mix(in oklch, var(--acc-1) 8%, transparent)', borderRadius: 8 }}>
              Acesso negado. Esta conta Google não tem permissão de acesso.
            </div>
          )}
          {error && !accessDenied && (
            <div className="mono" style={{ fontSize: 12, color: 'var(--acc-1-ink)', padding: '10px 12px', background: 'color-mix(in oklch, var(--acc-1) 8%, transparent)', borderRadius: 8 }}>
              Erro ao autenticar. Tente novamente.
            </div>
          )}
          <button
            onClick={() => signIn('google', { callbackUrl: '/admin/projetos' })}
            className="btn"
            style={{ justifyContent: 'center', padding: '13px', gap: 12 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.5-4z" fill="currentColor" opacity=".5"/>
              <path d="M6.3 14.7l7 5.1C15.2 16.6 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.9 0-14.7 4.5-17.7 11.7z" fill="#EA4335"/>
              <path d="M24 45c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.5 36.4 26.9 37 24 37c-6 0-10.6-3.1-11.8-7.5l-7 5.4C8 41.1 15.3 45 24 45z" fill="#34A853"/>
              <path d="M44.5 20H24v8.5h11.8c-.8 2.4-2.4 4.4-4.5 5.8l6.7 5.5c4-3.7 6-9.3 6-15.8 0-1.4-.2-2.7-.5-4z" fill="#4A90D9"/>
              <path d="M6.3 14.7C4.9 17.3 4 20.1 4 23c0 2.9.9 5.7 2.3 8.3l7-5.4C12.8 24.7 12 22.4 12 20c0-2.4.8-4.7 2.3-6.7l-7-5.1-1-.1.5 6.5z" fill="#FBBC05"/>
            </svg>
            Entrar com Google
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="/" className="label" style={{ color: 'var(--ink-soft)' }}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <span className="mono" style={{ color: 'var(--ink-faint)' }}>Carregando…</span>
    </div>}>
      <LoginContent />
    </Suspense>
  )
}
