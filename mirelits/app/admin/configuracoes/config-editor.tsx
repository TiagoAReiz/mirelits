'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ── types ── */
interface ProfileData {
  name: string
  handle: string
  tagline: string
  location: string
  email: string
  shortBio: string
  fullBio: string
  profileHue: string
  profilePhotoUrl: string | null
  colorBg: string | null
  colorInk: string | null
  colorAcc1: string | null
  colorAcc2: string | null
  colorAcc3: string | null
}

interface TimelineEntry {
  id: string
  year: string
  title: string
  description: string | null
  position: number
}

interface Props {
  profile: ProfileData
  timeline: TimelineEntry[]
}

const HUES = ['azul', 'marinho', 'laranja', 'verde', 'roxo', 'rosa', 'ocre', 'pedra', 'ceu', 'vinho']
const HUE_COLORS: Record<string, string> = {
  azul: 'oklch(0.68 0.14 245)', marinho: 'oklch(0.40 0.11 250)',
  laranja: 'oklch(0.685 0.175 45)', verde: 'oklch(0.66 0.135 158)',
  roxo: 'oklch(0.555 0.16 295)', rosa: 'oklch(0.70 0.15 0)',
  ocre: 'oklch(0.72 0.10 90)', pedra: 'oklch(0.78 0.04 85)',
  ceu: 'oklch(0.78 0.09 215)', vinho: 'oklch(0.45 0.14 15)',
}

const COLOR_PRESETS = [
  { id: 'atele', name: 'Ateliê', bg: 'oklch(0.984 0.006 85)', ink: 'oklch(0.215 0.012 65)', acc1: 'oklch(0.685 0.175 45)', acc2: 'oklch(0.66 0.135 158)', acc3: 'oklch(0.555 0.16 295)' },
  { id: 'tinta', name: 'Tinta',  bg: 'oklch(0.97 0.005 260)', ink: 'oklch(0.20 0.012 265)', acc1: 'oklch(0.68 0.14 245)',  acc2: 'oklch(0.70 0.14 0)',   acc3: 'oklch(0.66 0.14 158)' },
  { id: 'argila',name: 'Argila', bg: 'oklch(0.96 0.018 55)',  ink: 'oklch(0.28 0.025 50)',  acc1: 'oklch(0.60 0.15 25)',   acc2: 'oklch(0.62 0.12 145)', acc3: 'oklch(0.50 0.13 280)' },
  { id: 'noite', name: 'Noite',  bg: 'oklch(0.15 0.015 255)', ink: 'oklch(0.88 0.008 75)',  acc1: 'oklch(0.80 0.16 55)',   acc2: 'oklch(0.72 0.15 165)', acc3: 'oklch(0.65 0.17 305)' },
]

const COLOR_FIELDS: { key: keyof ProfileData; label: string; cssVar: string }[] = [
  { key: 'colorBg',  label: 'Fundo',  cssVar: '--bg'    },
  { key: 'colorInk', label: 'Texto',  cssVar: '--ink'   },
  { key: 'colorAcc1',label: 'Cor 1',  cssVar: '--acc-1' },
  { key: 'colorAcc2',label: 'Cor 2',  cssVar: '--acc-2' },
  { key: 'colorAcc3',label: 'Cor 3',  cssVar: '--acc-3' },
]

function card(extra?: React.CSSProperties): React.CSSProperties {
  return { background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, padding: 'clamp(16px,3vw,24px)', ...extra }
}

function Swatch({ color, active, onClick, title }: { color: string; active: boolean; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 34, height: 34, borderRadius: '50%', background: color, cursor: 'pointer',
      border: '3px solid var(--bg)', boxShadow: active ? '0 0 0 2px var(--ink)' : '0 0 0 1px var(--line)',
    }} />
  )
}

export function ConfigEditor({ profile: initProfile, timeline: initTimeline }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState(initProfile)
  const [timeline, setTimeline] = useState(initTimeline)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)
  const dragIdx = useRef<number | null>(null)
  const [tdOver, setTdOver] = useState<number | null>(null)

  const setP = (k: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile((p) => ({ ...p, [k]: e.target.value }))

  /* ── save profile ── */
  const saveProfile = useCallback(async () => {
    setSaving(true); setMsg('')
    try {
      const fd = new FormData()
      fd.append('name', profile.name)
      fd.append('shortBio', profile.shortBio)
      fd.append('fullBio', profile.fullBio)
      await fetch('/api/admin/artist-profile', { method: 'PUT', body: fd })
      // save extra fields that aren't in artist-profile PUT
      // (handle, tagline, location, email, profileHue, colors) — we use a dedicated PATCH
      await fetch('/api/admin/artist-profile/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: profile.handle, tagline: profile.tagline,
          location: profile.location, email: profile.email,
          profileHue: profile.profileHue,
          colorBg: profile.colorBg, colorInk: profile.colorInk,
          colorAcc1: profile.colorAcc1, colorAcc2: profile.colorAcc2, colorAcc3: profile.colorAcc3,
        }),
      })
      setMsg('Salvo!'); router.refresh()
    } catch {
      setMsg('Erro ao salvar.')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 2500)
    }
  }, [profile, router])

  /* ── profile photo upload ── */
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; e.target.value = ''
    const fd = new FormData(); fd.append('name', profile.name); fd.append('shortBio', profile.shortBio); fd.append('fullBio', profile.fullBio); fd.append('profilePhoto', f)
    const res = await fetch('/api/admin/artist-profile', { method: 'PUT', body: fd })
    if (res.ok) {
      const data = await res.json()
      setProfile((p) => ({ ...p, profilePhotoUrl: data.profilePhotoUrl ?? p.profilePhotoUrl }))
      router.refresh()
    }
  }

  /* ── apply a single color variable (with derived vars) ── */
  const applyColor = (key: keyof ProfileData, cssVar: string, val: string) => {
    setProfile((p) => ({ ...p, [key]: val }))
    const r = document.documentElement.style
    r.setProperty(cssVar, val)
    if (key === 'colorInk') {
      r.setProperty('--ink-soft',  `oklch(from ${val} calc(l + 0.25) c h)`)
      r.setProperty('--ink-faint', `oklch(from ${val} calc(l + 0.44) c h)`)
    }
    if (key === 'colorAcc1') {
      r.setProperty('--acc-1-ink', `oklch(from ${val} calc(l - 0.28) c h)`)
    }
  }

  /* ── color preset ── */
  const applyPreset = (pre: typeof COLOR_PRESETS[0]) => {
    setProfile((p) => ({ ...p, colorBg: pre.bg, colorInk: pre.ink, colorAcc1: pre.acc1, colorAcc2: pre.acc2, colorAcc3: pre.acc3 }))
    const r = document.documentElement.style
    r.setProperty('--bg', pre.bg); r.setProperty('--ink', pre.ink)
    r.setProperty('--ink-soft',  `oklch(from ${pre.ink} calc(l + 0.25) c h)`)
    r.setProperty('--ink-faint', `oklch(from ${pre.ink} calc(l + 0.44) c h)`)
    r.setProperty('--acc-1', pre.acc1)
    r.setProperty('--acc-1-ink', `oklch(from ${pre.acc1} calc(l - 0.28) c h)`)
    r.setProperty('--acc-2', pre.acc2); r.setProperty('--acc-3', pre.acc3)
  }

  /* ── timeline ── */
  const addTimeline = () => {
    const newEntry = { id: `_new_${Date.now()}`, year: '20—', title: 'Novo marco', description: '', position: timeline.length }
    setTimeline((t) => [...t, newEntry])
  }

  const updateTimeline = (id: string, patch: Partial<TimelineEntry>) =>
    setTimeline((ts) => ts.map((t) => t.id === id ? { ...t, ...patch } : t))

  const removeTimeline = async (id: string) => {
    setTimeline((ts) => ts.filter((t) => t.id !== id))
    if (!id.startsWith('_')) {
      await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' })
    }
  }

  const saveTimeline = async () => {
    setSaving(true); setMsg('')
    try {
      for (const t of timeline) {
        if (t.id.startsWith('_')) {
          await fetch('/api/admin/timeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: t.title, description: t.description, year: t.year, position: t.position }),
          })
        } else {
          await fetch(`/api/admin/timeline/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: t.title, description: t.description, year: t.year, position: t.position }),
          })
        }
      }
      setMsg('Linha do tempo salva!'); router.refresh()
    } catch {
      setMsg('Erro ao salvar timeline.')
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 2500)
    }
  }

  /* ── timeline drag ── */
  const tdProps = (i: number) => ({
    draggable: true,
    onDragStart: () => { dragIdx.current = i },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setTdOver(i) },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      const from = dragIdx.current
      if (from != null && from !== i) {
        const next = [...timeline]; const [m] = next.splice(from, 1); next.splice(i, 0, m)
        setTimeline(next.map((t, idx) => ({ ...t, position: idx })))
      }
      dragIdx.current = null; setTdOver(null)
    },
    onDragEnd: () => { dragIdx.current = null; setTdOver(null) },
  })

  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }} className="config-grid">

      {/* ── cores ── */}
      <section style={card()}>
        <h2 className="serif" style={{ fontSize: 22, margin: '0 0 4px', fontWeight: 500 }}>Cores do site</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 16px' }}>Muda em tempo real no site após salvar.</p>
        <span className="label">Temas</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, marginBottom: 20 }}>
          {COLOR_PRESETS.map((pre) => {
            const on = profile.colorBg === pre.bg && profile.colorAcc1 === pre.acc1
            return (
              <button key={pre.id} onClick={() => applyPreset(pre)}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 10, cursor: 'pointer', background: pre.bg, border: `2px solid ${on ? 'var(--acc-1)' : 'var(--line)'}`, minWidth: 96 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[pre.acc1, pre.acc2, pre.acc3].map((c, i) => <span key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />)}
                </div>
                <span className="mono" style={{ fontSize: 11, color: pre.ink, letterSpacing: '.04em' }}>{pre.name}</span>
              </button>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 16, marginBottom: 16 }}>
          <span className="label" style={{ display: 'block', marginBottom: 12 }}>Personalizar cores individualmente</span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {COLOR_FIELDS.map(({ key, label, cssVar }) => {
              const val = profile[key] as string | null
              const isHex = !!val?.startsWith('#')
              return (
                <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--line)', flexShrink: 0 }}>
                    {/* swatch preview using CSS variable so it always reflects current live value */}
                    <div style={{ position: 'absolute', inset: 0, background: val
                      ? (val.startsWith('#') || val.startsWith('oklch') || val.startsWith('rgb') ? val : `oklch(${val})`)
                      : `var(${cssVar})` }} />
                    <input
                      type="color"
                      value={isHex ? val! : '#ffffff'}
                      onChange={(e) => applyColor(key, cssVar, e.target.value)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <button className="btn btn--ghost btn--sm" onClick={saveProfile} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar cores'}
        </button>
      </section>

      {/* ── foto de perfil ── */}
      <section style={card()}>
        <h2 className="serif" style={{ fontSize: 22, margin: '0 0 4px', fontWeight: 500 }}>Foto de perfil</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 16px' }}>Aparece na home, no Sobre e como logo do header.</p>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            {profile.profilePhotoUrl
              ? <img src={profile.profilePhotoUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: HUE_COLORS[profile.profileHue] ?? HUE_COLORS.laranja, display: 'grid', placeItems: 'center' }}>
                  <span className="serif" style={{ color: '#fff', fontSize: 28, fontWeight: 600 }}>{profile.name[0]?.toUpperCase()}</span>
                </div>
            }
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn--ghost btn--sm" onClick={() => photoRef.current?.click()}>↑ Enviar foto</button>
              {profile.profilePhotoUrl && (
                <button className="btn btn--ghost btn--sm" onClick={() => setProfile((p) => ({ ...p, profilePhotoUrl: null }))}>Remover</button>
              )}
              <input ref={photoRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
            </div>
            {!profile.profilePhotoUrl && (
              <div>
                <span className="label">Cor de fundo</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {HUES.map((h) => (
                    <Swatch key={h} color={HUE_COLORS[h]} active={profile.profileHue === h} onClick={() => setProfile((p) => ({ ...p, profileHue: h }))} title={h} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── identidade ── */}
      <section style={card()}>
        <h2 className="serif" style={{ fontSize: 22, margin: '0 0 16px', fontWeight: 500 }}>Identidade & bio</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'grid', gap: 6, flex: '1 1 160px' }}><span className="label">Nome</span><input className="field" value={profile.name} onChange={setP('name')} /></label>
            <label style={{ display: 'grid', gap: 6, flex: '1 1 120px' }}><span className="label">@ / handle</span><input className="field" value={profile.handle} onChange={setP('handle')} /></label>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'grid', gap: 6, flex: '1 1 160px' }}><span className="label">Profissão</span><input className="field" value={profile.tagline} onChange={setP('tagline')} /></label>
            <label style={{ display: 'grid', gap: 6, flex: '1 1 120px' }}><span className="label">Local</span><input className="field" value={profile.location} onChange={setP('location')} /></label>
          </div>
          <label style={{ display: 'grid', gap: 6 }}><span className="label">E-mail de contato</span><input className="field" type="email" value={profile.email} onChange={setP('email')} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span className="label">Bio curta (home)</span><textarea className="field" value={profile.shortBio} onChange={setP('shortBio')} /></label>
          <label style={{ display: 'grid', gap: 6 }}><span className="label">Bio completa (sobre)</span><textarea className="field" style={{ minHeight: 160 }} value={profile.fullBio} onChange={setP('fullBio')} /></label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn--accent btn--sm" onClick={saveProfile} disabled={saving}>{saving ? 'Salvando…' : 'Salvar identidade'}</button>
            {msg && <span className="mono" style={{ fontSize: 12, color: 'var(--acc-2-ink, var(--acc-2))' }}>{msg}</span>}
          </div>
        </div>
      </section>

      {/* ── timeline ── */}
      <section style={card()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="serif" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>Linha do tempo</h2>
          <button className="btn btn--ghost btn--sm" onClick={addTimeline}>+ Marco</button>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {timeline.map((t, i) => (
            <div key={t.id} {...tdProps(i)}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 8, border: `1px solid ${tdOver === i ? 'var(--acc-1)' : 'var(--line)'}`, background: 'var(--bg)', cursor: 'grab' }}>
              <span className="mono" style={{ cursor: 'grab', color: 'var(--ink-faint)', fontSize: 16, paddingTop: 8 }}>⠿</span>
              <input className="field" style={{ width: 76, padding: 8, fontSize: 13 }} value={t.year} onChange={(e) => updateTimeline(t.id, { year: e.target.value })} />
              <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                <input className="field" style={{ padding: '8px 10px', fontSize: 14 }} value={t.title} onChange={(e) => updateTimeline(t.id, { title: e.target.value })} placeholder="Título" />
                <input className="field" style={{ padding: '8px 10px', fontSize: 13 }} value={t.description ?? ''} onChange={(e) => updateTimeline(t.id, { description: e.target.value })} placeholder="Descrição" />
              </div>
              <button onClick={() => removeTimeline(t.id)} className="mono" style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-soft)', flexShrink: 0 }}>✕</button>
            </div>
          ))}
        </div>
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 14 }} onClick={saveTimeline} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar linha do tempo'}
        </button>
      </section>

      <style>{`@media (min-width:920px){ .config-grid{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}
