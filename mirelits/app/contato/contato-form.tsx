'use client'

import { useState } from 'react'

const TIPOS = ['Ilustração', 'Editorial', 'Capa de livro', 'Padronagem', 'Quadrinho', 'Animação', 'Outro']

export function ContatoForm({ email, handle }: { email: string; handle: string }) {
  const [form, setForm] = useState({ nome: '', email: '', tipo: TIPOS[0], msg: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.nome, email: form.email, projectType: form.tipo, message: form.msg }),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setSent(true)
    } catch {
      setErr('Algo correu mal. Tenta novamente ou escreve directamente para ' + email)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ paddingTop: 'clamp(48px,10vw,120px)', maxWidth: 620, textAlign: 'center', marginInline: 'auto' }} className="route">
        <span className="dot" style={{ background: 'var(--acc-2)', width: 12, height: 12, margin: '0 auto' }} />
        <h1 className="serif" style={{ fontSize: 'clamp(34px,6vw,56px)', margin: '20px 0 0', fontWeight: 500 }}>
          Proposta enviada!
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 14, fontSize: 17 }}>
          Obrigada, {form.nome.split(' ')[0] || 'tudo bem'}. Respondo no e-mail{' '}
          <strong>{form.email}</strong> em até alguns dias.
        </p>
        <button
          className="btn btn--ghost"
          style={{ marginTop: 26 }}
          onClick={() => { setSent(false); setForm({ nome: '', email: '', tipo: TIPOS[0], msg: '' }) }}
        >
          Enviar outra
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'clamp(28px,5vw,64px)', gridTemplateColumns: '1fr' }} className="contact-grid">
      {/* left info */}
      <div style={{ maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <span className="dot" style={{ background: 'var(--acc-3)' }} />
          <span className="label">Vamos trabalhar juntas</span>
        </div>
        <h1 className="serif" style={{ fontSize: 'clamp(38px,7vw,68px)', lineHeight: 1.0, letterSpacing: '-0.02em', margin: '14px 0 0', fontWeight: 500 }}>
          Conte sobre<br />o seu projeto
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 18, fontSize: 17, lineHeight: 1.6 }}>
          Editorial, capa, padronagem, quadrinho ou algo que ainda não tem nome — me escreva uma proposta e retorno com prazos e orçamento.
        </p>
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href={`mailto:${email}`} className="mono" style={{ fontSize: 14, color: 'var(--ink)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <span className="dot" style={{ background: 'var(--acc-1)' }} />
            {email}
          </a>
          <span className="mono" style={{ fontSize: 14, color: 'var(--ink-soft)', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <span className="dot" style={{ background: 'var(--acc-2)' }} />
            {handle}
          </span>
        </div>
      </div>

      {/* form */}
      <form
        onSubmit={submit}
        style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: 'clamp(20px,4vw,32px)', maxWidth: 560 }}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 7 }}>
            <span className="label">Seu nome</span>
            <input className="field" required value={form.nome} onChange={set('nome')} placeholder="Como você se chama?" />
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span className="label">E-mail</span>
            <input className="field" type="email" required value={form.email} onChange={set('email')} placeholder="voce@email.com" />
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span className="label">Tipo de projeto</span>
            <select className="field" value={form.tipo} onChange={set('tipo')}>
              {TIPOS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 7 }}>
            <span className="label">Mensagem</span>
            <textarea className="field" required value={form.msg} onChange={set('msg')} placeholder="Prazo, formato, referências, orçamento..." />
          </label>
          {err && <div className="mono" style={{ fontSize: 12, color: 'var(--acc-1-ink)' }}>{err}</div>}
          <button type="submit" disabled={loading} className="btn btn--accent" style={{ justifyContent: 'center', padding: '13px 18px', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Enviando…' : 'Enviar proposta'}
          </button>
        </div>
      </form>

      <style>{`@media (min-width:820px){ .contact-grid{ grid-template-columns: 0.9fr 1.1fr !important; } }`}</style>
    </div>
  )
}
