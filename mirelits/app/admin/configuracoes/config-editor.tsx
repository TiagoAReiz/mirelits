'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SocialIcon, SOCIAL_PLATFORMS } from '@/components/social-icon'
import { FONT_REGISTRY, type FontKey } from '@/lib/font-registry'

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
  fontDisplay:  string | null
  fontSubtitle: string | null
  fontBody:     string | null
}

interface TimelineEntry {
  id: string
  year: string
  title: string
  description: string | null
  position: number
}

interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
  position: number
}

interface Props {
  profile: ProfileData
  timeline: TimelineEntry[]
  socialLinks: SocialLink[]
}

/* ── section save state ── */
type Sec = 'colors' | 'photo' | 'identity' | 'timeline' | 'social' | 'fonts'
interface SecState { saving: boolean; msg: string }
const IDLE: SecState = { saving: false, msg: '' }

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

const FONT_OPTIONS = (Object.entries(FONT_REGISTRY) as [FontKey, typeof FONT_REGISTRY[FontKey]][]).map(
  ([key, { cssVar, fallback, label }]) => ({ key, cssVar, fallback, label })
)

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

function SaveRow({ state, onSave, label = 'Salvar' }: { state: SecState; onSave: () => void; label?: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
      <button className="btn btn--accent btn--sm" onClick={onSave} disabled={state.saving}
        style={{ opacity: state.saving ? 0.6 : 1 }}>
        {state.saving ? 'Salvando…' : label}
      </button>
      {state.msg && (
        <span className="mono" style={{ fontSize: 12, color: state.msg.startsWith('Erro') ? 'var(--acc-1-ink)' : 'var(--acc-2)' }}>
          {state.msg}
        </span>
      )}
    </div>
  )
}

export function ConfigEditor({ profile: initProfile, timeline: initTimeline, socialLinks: initSocial }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState(initProfile)
  const [timeline, setTimeline] = useState(initTimeline)
  const [social, setSocial] = useState<SocialLink[]>(initSocial)

  /* per-section save state */
  const [sec, setSec] = useState<Record<Sec, SecState>>({
    colors: IDLE, photo: IDLE, identity: IDLE, timeline: IDLE, social: IDLE, fonts: IDLE,
  })
  const [allSaving, setAllSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)

  const photoRef = useRef<HTMLInputElement>(null)
  const dragIdx = useRef<number | null>(null)
  const [tdOver, setTdOver] = useState<number | null>(null)
  const sdragIdx = useRef<number | null>(null)
  const [sdOver, setSdOver] = useState<number | null>(null)

  const setP = (k: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile((p) => ({ ...p, [k]: e.target.value }))

  /* ── section state helpers ── */
  const startSec = (s: Sec) => setSec((p) => ({ ...p, [s]: { saving: true, msg: '' } }))
  const endSec = (s: Sec, msg: string) => {
    setSec((p) => ({ ...p, [s]: { saving: false, msg } }))
    setTimeout(() => setSec((p) => ({ ...p, [s]: { ...p[s], msg: '' } })), 2500)
  }

  /* ── save colors ── */
  const saveColors = useCallback(async () => {
    startSec('colors')
    try {
      await fetch('/api/admin/artist-profile/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorBg: profile.colorBg, colorInk: profile.colorInk,
          colorAcc1: profile.colorAcc1, colorAcc2: profile.colorAcc2, colorAcc3: profile.colorAcc3,
        }),
      })
      endSec('colors', 'Cores salvas!')
      router.refresh()
    } catch {
      endSec('colors', 'Erro ao salvar.')
    }
  }, [profile, router])

  /* ── save photo / hue ── */
  const savePhoto = useCallback(async () => {
    startSec('photo')
    try {
      await fetch('/api/admin/artist-profile/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileHue: profile.profileHue, profilePhotoUrl: profile.profilePhotoUrl }),
      })
      endSec('photo', 'Salvo!')
      router.refresh()
    } catch {
      endSec('photo', 'Erro ao salvar.')
    }
  }, [profile, router])

  /* ── upload photo ── */
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; e.target.value = ''
    setPhotoUploading(true)
    const fd = new FormData()
    fd.append('name', profile.name)
    fd.append('shortBio', profile.shortBio)
    fd.append('fullBio', profile.fullBio)
    fd.append('profilePhoto', f)
    try {
      const res = await fetch('/api/admin/artist-profile', { method: 'PUT', body: fd })
      if (res.ok) {
        const data = await res.json()
        setProfile((p) => ({ ...p, profilePhotoUrl: data.profilePhotoUrl ?? p.profilePhotoUrl }))
        router.refresh()
      } else {
        endSec('photo', 'Erro no upload.')
      }
    } catch {
      endSec('photo', 'Erro no upload.')
    } finally {
      setPhotoUploading(false)
    }
  }

  /* ── save identity ── */
  const saveIdentity = useCallback(async () => {
    startSec('identity')
    try {
      const fd = new FormData()
      fd.append('name', profile.name)
      fd.append('shortBio', profile.shortBio)
      fd.append('fullBio', profile.fullBio)
      await fetch('/api/admin/artist-profile', { method: 'PUT', body: fd })
      await fetch('/api/admin/artist-profile/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: profile.handle, tagline: profile.tagline,
          location: profile.location, email: profile.email,
        }),
      })
      endSec('identity', 'Identidade salva!')
      router.refresh()
    } catch {
      endSec('identity', 'Erro ao salvar.')
    }
  }, [profile, router])

  /* ── save timeline ── */
  const saveTimeline = useCallback(async () => {
    startSec('timeline')
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
      endSec('timeline', 'Linha do tempo salva!')
      router.refresh()
    } catch {
      endSec('timeline', 'Erro ao salvar.')
    }
  }, [timeline, router])

  /* ── save social ── */
  const saveSocial = useCallback(async () => {
    startSec('social')
    try {
      for (const s of social) {
        if (s.id.startsWith('_')) {
          if (!s.url.trim()) continue
          await fetch('/api/admin/social-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: s.platform, label: s.label, url: s.url, position: s.position }),
          })
        } else {
          await fetch(`/api/admin/social-links/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: s.platform, label: s.label, url: s.url, position: s.position }),
          })
        }
      }
      endSec('social', 'Redes salvas!')
      router.refresh()
    } catch {
      endSec('social', 'Erro ao salvar.')
    }
  }, [social, router])

  /* ── color helpers ── */
  const applyColor = (key: keyof ProfileData, cssVar: string, val: string) => {
    setProfile((p) => ({ ...p, [key]: val }))
    const r = document.documentElement.style
    r.setProperty(cssVar, val)
    if (key === 'colorInk') {
      r.setProperty('--ink-soft',  `oklch(from ${val} calc(l + 0.25) c h)`)
      r.setProperty('--ink-faint', `oklch(from ${val} calc(l + 0.44) c h)`)
    }
    if (key === 'colorAcc1') r.setProperty('--acc-1-ink', `oklch(from ${val} calc(l - 0.28) c h)`)
  }

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

  /* ── apply font (live preview) ── */
  const applyFont = (profileKey: 'fontDisplay' | 'fontSubtitle' | 'fontBody', cssVar: string, fontKey: FontKey) => {
    setProfile((p) => ({ ...p, [profileKey]: fontKey }))
    const opt = FONT_OPTIONS.find((f) => f.key === fontKey)
    if (opt) {
      document.documentElement.style.setProperty(cssVar, `var(${opt.cssVar}), ${opt.fallback}`)
    }
  }

  /* ── save fonts ── */
  const saveFonts = useCallback(async () => {
    startSec('fonts')
    try {
      const res = await fetch('/api/admin/artist-profile/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fontDisplay:  profile.fontDisplay,
          fontSubtitle: profile.fontSubtitle,
          fontBody:     profile.fontBody,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      endSec('fonts', 'Fontes salvas!')
      router.refresh()
    } catch {
      endSec('fonts', 'Erro ao salvar.')
    }
  }, [profile, router])

  /* ── save all ── */
  const saveAll = useCallback(async () => {
    setAllSaving(true)
    await Promise.all([saveColors(), savePhoto(), saveIdentity(), saveTimeline(), saveSocial(), saveFonts()])
    setAllSaving(false)
  }, [saveColors, savePhoto, saveIdentity, saveTimeline, saveSocial, saveFonts])

  /* ── timeline helpers ── */
  const addTimeline = () =>
    setTimeline((t) => [...t, { id: `_new_${Date.now()}`, year: '20—', title: 'Novo marco', description: '', position: t.length }])

  const updateTimeline = (id: string, patch: Partial<TimelineEntry>) =>
    setTimeline((ts) => ts.map((t) => t.id === id ? { ...t, ...patch } : t))

  const removeTimeline = async (id: string) => {
    setTimeline((ts) => ts.filter((t) => t.id !== id))
    if (!id.startsWith('_')) await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' })
  }

  /* ── social helpers ── */
  const addSocial = () =>
    setSocial((s) => [...s, { id: `_new_${Date.now()}`, platform: 'instagram', label: 'Instagram', url: '', position: s.length }])

  const updateSocial = (id: string, patch: Partial<SocialLink>) =>
    setSocial((ss) => ss.map((s) => s.id === id ? { ...s, ...patch } : s))

  const removeSocial = async (id: string) => {
    setSocial((ss) => ss.filter((s) => s.id !== id))
    if (!id.startsWith('_')) await fetch(`/api/admin/social-links/${id}`, { method: 'DELETE' })
  }

  /* ── drag helpers ── */
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

  const sdProps = (i: number) => ({
    draggable: true,
    onDragStart: () => { sdragIdx.current = i },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setSdOver(i) },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      const from = sdragIdx.current
      if (from != null && from !== i) {
        const next = [...social]; const [m] = next.splice(from, 1); next.splice(i, 0, m)
        setSocial(next.map((s, idx) => ({ ...s, position: idx })))
      }
      sdragIdx.current = null; setSdOver(null)
    },
    onDragEnd: () => { sdragIdx.current = null; setSdOver(null) },
  })

  const anySaving = Object.values(sec).some((s) => s.saving) || allSaving

  return (
    <div>
      {/* ── barra salvar tudo ── */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 40, marginBottom: 20,
        background: 'color-mix(in oklch, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--line)', borderRadius: 10,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '.06em' }}>
          CONFIGURAÇÕES
        </span>
        <button
          className="btn btn--accent btn--sm"
          onClick={saveAll}
          disabled={anySaving}
          style={{ opacity: anySaving ? 0.6 : 1 }}
        >
          {allSaving ? 'Salvando tudo…' : 'Salvar tudo'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1fr' }} className="config-grid">

        {/* ── fontes ── */}
        <section style={card()}>
          <h2 className="serif" style={{ fontSize: 22, margin: '0 0 4px', fontWeight: 500 }}>Fontes do site</h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 20px' }}>Muda em tempo real no site após salvar.</p>

          {(
            [
              { label: 'TÍTULOS',    profileKey: 'fontDisplay'  as const, cssVar: '--ff-display',  defaultKey: 'newsreader' },
              { label: 'SUBTÍTULOS', profileKey: 'fontSubtitle' as const, cssVar: '--ff-subtitle', defaultKey: 'newsreader' },
              { label: 'CORPO',      profileKey: 'fontBody'     as const, cssVar: '--ff-body',     defaultKey: 'hanken'     },
            ] as const
          ).map(({ label, profileKey, cssVar, defaultKey }) => (
            <div key={profileKey} style={{ marginBottom: 20 }}>
              <span className="label" style={{ display: 'block', marginBottom: 10 }}>{label}</span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {FONT_OPTIONS.map((opt) => {
                  const active = (profile[profileKey] ?? defaultKey) === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => applyFont(profileKey, cssVar, opt.key as FontKey)}
                      style={{
                        fontFamily: `var(${opt.cssVar}), ${opt.fallback}`,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `2px solid ${active ? 'var(--acc-1)' : 'var(--line)'}`,
                        background: active
                          ? 'color-mix(in oklch, var(--acc-1) 8%, var(--paper))'
                          : 'var(--paper)',
                        cursor: 'pointer',
                        minWidth: 110,
                        textAlign: 'left' as const,
                        transition: 'border-color .15s, background .15s',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.2 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 3 }}>
                        Aa
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <SaveRow state={sec.fonts} onSave={saveFonts} label="Salvar fontes" />
        </section>

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

          <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 16, marginBottom: 4 }}>
            <span className="label" style={{ display: 'block', marginBottom: 12 }}>Personalizar cores individualmente</span>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {COLOR_FIELDS.map(({ key, label, cssVar }) => {
                const val = profile[key] as string | null
                const isHex = !!val?.startsWith('#')
                return (
                  <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                    <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--line)', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', inset: 0, background: val
                        ? (val.startsWith('#') || val.startsWith('oklch') || val.startsWith('rgb') ? val : `oklch(${val})`)
                        : `var(${cssVar})` }} />
                      <input type="color" value={isHex ? val! : '#ffffff'}
                        onChange={(e) => applyColor(key, cssVar, e.target.value)}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>{label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <SaveRow state={sec.colors} onSave={saveColors} label="Salvar cores" />
        </section>

        {/* ── foto de perfil ── */}
        <section style={card()}>
          <h2 className="serif" style={{ fontSize: 22, margin: '0 0 4px', fontWeight: 500 }}>Foto de perfil</h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '0 0 16px' }}>Aparece na home, no Sobre e como logo do header.</p>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              {profile.profilePhotoUrl
                ? <img src={profile.profilePhotoUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: HUE_COLORS[profile.profileHue] ?? HUE_COLORS.laranja, display: 'grid', placeItems: 'center' }}>
                    <span className="serif" style={{ color: '#fff', fontSize: 28, fontWeight: 600 }}>{profile.name[0]?.toUpperCase()}</span>
                  </div>
              }
              {photoUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in oklch, #000 50%, transparent)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite', display: 'block' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn btn--ghost btn--sm" onClick={() => photoRef.current?.click()} disabled={photoUploading}>
                  {photoUploading ? 'Enviando…' : '↑ Enviar foto'}
                </button>
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
                      <Swatch key={h} color={HUE_COLORS[h]} active={profile.profileHue === h}
                        onClick={() => setProfile((p) => ({ ...p, profileHue: h }))} title={h} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <SaveRow state={sec.photo} onSave={savePhoto} label="Salvar foto & cor" />
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
          </div>
          <SaveRow state={sec.identity} onSave={saveIdentity} label="Salvar identidade" />
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
            {timeline.length === 0 && (
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', padding: '18px 0', textAlign: 'center' }}>
                Nenhum marco ainda. Clique em "+ Marco" acima.
              </div>
            )}
          </div>
          <SaveRow state={sec.timeline} onSave={saveTimeline} label="Salvar linha do tempo" />
        </section>

        {/* ── redes sociais ── */}
        <section style={card({ gridColumn: '1 / -1' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>Redes sociais</h2>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
                Aparecem no cabeçalho (máx. 3 ícones) e na página Sobre.
              </p>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={addSocial}>+ Rede</button>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {social.map((s, i) => (
              <div key={s.id} {...sdProps(i)}
                style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, borderRadius: 8, border: `1px solid ${sdOver === i ? 'var(--acc-1)' : 'var(--line)'}`, background: 'var(--bg)', cursor: 'grab', flexWrap: 'wrap' }}>
                <span className="mono" style={{ cursor: 'grab', color: 'var(--ink-faint)', fontSize: 16 }}>⠿</span>
                <span style={{ color: 'var(--acc-1)', display: 'flex', flexShrink: 0 }}>
                  <SocialIcon platform={s.platform} size={20} />
                </span>
                <select className="field" style={{ width: 140, padding: '8px 10px', fontSize: 13 }}
                  value={s.platform}
                  onChange={(e) => updateSocial(s.id, { platform: e.target.value, label: SOCIAL_PLATFORMS.find(p => p.value === e.target.value)?.label ?? s.label })}>
                  {SOCIAL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input className="field" style={{ width: 130, padding: '8px 10px', fontSize: 13 }}
                  placeholder="Rótulo" value={s.label}
                  onChange={(e) => updateSocial(s.id, { label: e.target.value })} />
                <input className="field" style={{ flex: 1, minWidth: 180, padding: '8px 10px', fontSize: 13 }}
                  placeholder="https://..." value={s.url}
                  onChange={(e) => updateSocial(s.id, { url: e.target.value })} />
                <button onClick={() => removeSocial(s.id)} className="mono"
                  style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-soft)', flexShrink: 0 }}>✕</button>
              </div>
            ))}
            {social.length === 0 && (
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', padding: '18px 0', textAlign: 'center' }}>
                Nenhuma rede adicionada ainda. Clique em "+ Rede" acima.
              </div>
            )}
          </div>
          <SaveRow state={sec.social} onSave={saveSocial} label="Salvar redes" />
        </section>

        <style>{`
          @media (min-width:920px){ .config-grid{ grid-template-columns: 1fr 1fr !important; } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  )
}
