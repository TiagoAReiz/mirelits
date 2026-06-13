'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Ph } from '@/components/ph'

const CATEGORIES = ['Ilustração', 'Editorial', 'Capa', 'Padronagem', 'Quadrinho', 'Retratos', 'Animação', 'Pôster']
const HUES = ['azul', 'marinho', 'laranja', 'verde', 'roxo', 'rosa', 'ocre', 'pedra', 'ceu', 'vinho']
const HUE_COLORS: Record<string, string> = {
  azul: 'oklch(0.68 0.14 245)', marinho: 'oklch(0.40 0.11 250)',
  laranja: 'oklch(0.685 0.175 45)', verde: 'oklch(0.66 0.135 158)',
  roxo: 'oklch(0.555 0.16 295)', rosa: 'oklch(0.70 0.15 0)',
  ocre: 'oklch(0.72 0.10 90)', pedra: 'oklch(0.78 0.04 85)',
  ceu: 'oklch(0.78 0.09 215)', vinho: 'oklch(0.45 0.14 15)',
}

interface Photo {
  id: string
  url: string
  ratio?: number | null
  hue?: string | null
  position: number
  _local?: boolean // newly uploaded, not yet persisted
}

interface ProjectData {
  id?: string
  title: string
  subtitle: string
  category: string
  year: string
  description: string
  status: 'DRAFT' | 'PUBLISHED'
  pinned: boolean
  pinLabel: string
  photos: Photo[]
  coverPhotoId?: string | null
}

const EMPTY: ProjectData = {
  title: '', subtitle: '', category: CATEGORIES[0],
  year: String(new Date().getFullYear()),
  description: '', status: 'DRAFT', pinned: false, pinLabel: '', photos: [],
}

export function ProjectEditor({ initial }: { initial?: ProjectData }) {
  const router = useRouter()
  const isNew = !initial?.id
  const [proj, setProj] = useState<ProjectData>(initial ?? EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIdx = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const set = (k: keyof ProjectData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProj((p) => ({ ...p, [k]: e.target.value }))

  /* ── photo drag-and-drop reorder ── */
  const imgProps = (i: number) => ({
    draggable: true,
    onDragStart: () => { dragIdx.current = i },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(i) },
    onDrop: async (e: React.DragEvent) => {
      e.preventDefault()
      const from = dragIdx.current
      if (from == null || from === i) { dragIdx.current = null; setOver(null); return }
      const next = [...proj.photos]
      const [m] = next.splice(from, 1)
      next.splice(i, 0, m)
      const reordered = next.map((p, idx) => ({ ...p, position: idx }))
      setProj((p) => ({ ...p, photos: reordered }))
      dragIdx.current = null; setOver(null)
      // persist reorder if project exists
      if (proj.id) {
        await fetch(`/api/admin/projects/${proj.id}/photos`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reordered.filter(p => !p._local).map((p) => ({ id: p.id, position: p.position }))),
        })
      }
    },
    onDragEnd: () => { dragIdx.current = null; setOver(null) },
  })

  /* ── upload photos ── */
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (!files.length) return

    let projectId: string | undefined = proj.id
    if (!projectId) {
      if (!proj.title.trim()) { setError('Dê um título ao projeto antes de adicionar fotos.'); return }
      projectId = await createProject()
      if (!projectId) return
    }

    setError('')
    const failed: string[] = []

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      setUploadMsg(`Enviando ${i + 1} de ${files.length}…`)
      try {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch(`/api/admin/projects/${projectId}/photos`, { method: 'POST', body: fd })
        if (res.ok) {
          const photo = await res.json()
          setProj((p) => ({
            ...p,
            id: projectId!,
            photos: [...p.photos, { id: photo.id, url: photo.url, ratio: 1, hue: 'pedra', position: p.photos.length }],
          }))
        } else {
          failed.push(f.name)
        }
      } catch {
        failed.push(f.name)
      }
    }

    setUploadMsg('')
    if (failed.length > 0) {
      setError(`Erro ao enviar: ${failed.join(', ')}`)
    }
  }

  const removePhoto = async (photoId: string) => {
    if (proj.id) {
      await fetch(`/api/admin/projects/${proj.id}/photos/${photoId}`, { method: 'DELETE' })
    }
    setProj((p) => ({
      ...p,
      photos: p.photos.filter((x) => x.id !== photoId),
      coverPhotoId: p.coverPhotoId === photoId ? null : p.coverPhotoId,
    }))
  }

  const setCover = async (photoId: string) => {
    setProj((p) => ({ ...p, coverPhotoId: photoId }))
    if (proj.id) {
      await fetch(`/api/admin/projects/${proj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhotoId: photoId }),
      })
    }
  }

  /* ── create project ── */
  const createProject = async (): Promise<string | undefined> => {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: proj.title, subtitle: proj.subtitle,
        description: proj.description, category: proj.category,
        year: proj.year,
      }),
    })
    if (!res.ok) { setError('Erro ao criar projeto.'); return undefined }
    const created = await res.json()
    setProj((p) => ({ ...p, id: created.id }))
    return created.id
  }

  /* ── save ── */
  const save = useCallback(async () => {
    if (!proj.title.trim()) { setError('Título é obrigatório.'); return }
    setSaving(true); setError('')
    try {
      let projectId: string | undefined = proj.id
      if (!projectId) {
        projectId = await createProject()
        if (!projectId) return
      }
      await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: proj.title, subtitle: proj.subtitle,
          description: proj.description, category: proj.category,
          year: proj.year, status: proj.status,
          pinned: proj.pinned, pinLabel: proj.pinLabel,
          coverPhotoId: proj.coverPhotoId ?? proj.photos[0]?.id ?? null,
        }),
      })
      router.push('/admin/projetos')
      router.refresh()
    } catch {
      setError('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }, [proj, router])

  const coverId = proj.coverPhotoId ?? proj.photos[0]?.id

  return (
    <div>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <span className="dot" style={{ background: 'var(--acc-2)' }} />
            <span className="label">{isNew ? 'Criar' : 'Editar'}</span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.05, margin: 0, fontWeight: 500 }}>
            {isNew ? 'Novo projeto' : 'Editar projeto'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/admin/projetos" className="btn btn--ghost btn--sm">Cancelar</a>
          <button onClick={save} disabled={saving || !proj.title.trim()} className="btn btn--accent btn--sm"
            style={{ opacity: saving || !proj.title.trim() ? 0.5 : 1, cursor: saving || !proj.title.trim() ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Salvando…' : 'Salvar projeto'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mono" style={{ fontSize: 12, color: 'var(--acc-1-ink)', marginBottom: 16, padding: '10px 12px', background: 'color-mix(in oklch, var(--acc-1) 8%, transparent)', borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: 'clamp(20px,3vw,36px)', gridTemplateColumns: '1fr' }} className="editor-grid">
        {/* left: metadata */}
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, padding: 18, display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="label">Título *</span>
              <input className="field" value={proj.title} onChange={set('title')} placeholder="Nome do projeto" autoFocus />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="label">Subtítulo</span>
              <input className="field" value={proj.subtitle} onChange={set('subtitle')} placeholder="Ex.: Série editorial · 2025" />
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, flex: 1 }}>
                <span className="label">Categoria</span>
                <select className="field" value={proj.category} onChange={set('category')}>
                  {CATEGORIES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 6, width: 110 }}>
                <span className="label">Ano</span>
                <input className="field" value={proj.year} onChange={set('year')} />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="label">Descrição</span>
              <textarea className="field" value={proj.description} onChange={set('description')} placeholder="Sobre o projeto, técnica, contexto..." />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span className="label">Status</span>
              <select className="field" value={proj.status} onChange={set('status')}>
                <option value="DRAFT">Rascunho (não aparece no site)</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </label>
            <label style={{ display: 'flex', gap: 9, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={proj.pinned}
                onChange={(e) => setProj((p) => ({ ...p, pinned: e.target.checked }))}
                style={{ accentColor: 'var(--acc-1)', width: 16, height: 16 }} />
              <span style={{ fontSize: 14 }}>Fixar na home</span>
              {proj.pinned && (
                <input className="field" style={{ padding: '5px 9px', fontSize: 12, maxWidth: 130, marginLeft: 4 }}
                  placeholder="rótulo: novo" value={proj.pinLabel} onChange={set('pinLabel')} />
              )}
            </label>
          </div>
        </div>

        {/* right: photos */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <span className="label">Fotos · arraste para ordenar</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{proj.photos.length} fotos</span>
          </div>

          {/* upload bar */}
          <div style={{ background: 'var(--paper)', border: '1px dashed var(--line)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 9 }}>Adicionar foto:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={!!uploadMsg}
                className="btn btn--ghost btn--sm"
                style={{ opacity: uploadMsg ? 0.5 : 1 }}
              >
                ↑ Enviar imagem
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: 'none' }} />
              {uploadMsg
                ? <span className="mono" style={{ fontSize: 11, color: 'var(--acc-1-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--acc-1)', animation: 'pulse 1s infinite' }} />
                    {uploadMsg}
                  </span>
                : <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                    JPEG, PNG ou WEBP · múltiplos ficheiros
                  </span>
              }
            </div>
          </div>

          {proj.photos.length === 0 ? (
            <div style={{ border: '1px dashed var(--line)', borderRadius: 10, padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }} className="mono">
              Nenhuma foto ainda.<br />Envie imagens acima.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {proj.photos.map((im, i) => (
                <div key={im.id} {...imgProps(i)}
                  style={{
                    position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'grab',
                    boxShadow: over === i ? '0 0 0 3px var(--acc-1)' : '0 0 0 1px var(--line)',
                    transition: 'box-shadow .15s',
                  }}
                >
                  <Ph src={im.url} hue={im.hue ?? 'pedra'} ratio={1} showCap={false} style={{ width: '100%' }} />
                  {im.id === coverId && (
                    <span style={{ position: 'absolute', top: 6, left: 6, background: 'var(--acc-1)', color: '#fff', fontFamily: 'var(--ff-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 99 }}>
                      CAPA
                    </span>
                  )}
                  <div
                    style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 6, opacity: 0, transition: 'opacity .2s', background: 'color-mix(in oklch, var(--ink) 30%, transparent)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(im.id) }}
                        className="mono"
                        style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--bg)', color: 'var(--ink)', fontSize: 12 }}
                      >✕</button>
                    </div>
                    {im.id !== coverId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCover(im.id) }}
                        className="mono"
                        style={{ border: 'none', background: 'var(--bg)', color: 'var(--ink)', fontSize: 10, padding: 5, borderRadius: 6, letterSpacing: '.05em' }}
                      >
                        tornar capa
                      </button>
                    )}
                  </div>
                  <span className="mono" style={{ position: 'absolute', bottom: 5, right: 6, fontSize: 9, color: '#fff', background: 'color-mix(in oklch, #000 45%, transparent)', padding: '1px 5px', borderRadius: 4 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@media (min-width:860px){ .editor-grid{ grid-template-columns: 360px 1fr !important; align-items: start; } }`}</style>
    </div>
  )
}
