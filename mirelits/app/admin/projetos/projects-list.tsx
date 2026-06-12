'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ph } from '@/components/ph'

interface Photo {
  id: string
  url: string
  ratio?: number | null
  hue?: string | null
}

interface Project {
  id: string
  title: string
  subtitle?: string | null
  category?: string | null
  status: string
  pinned: boolean
  pinOrder?: number | null
  pinLabel?: string | null
  coverPhoto?: Photo | null
  _count: { photos: number }
}

export function ProjectsList({ initial }: { initial: Project[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState(initial)
  const [editLabel, setEditLabel] = useState<string | null>(null)
  const [labelVal, setLabelVal] = useState('')
  const dragIdx = useRef<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  /* ── drag-to-reorder ── */
  const itemProps = (i: number) => ({
    draggable: true,
    onDragStart: () => { dragIdx.current = i },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(i) },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      const from = dragIdx.current
      if (from != null && from !== i) reorder(from, i)
      dragIdx.current = null; setOver(null)
    },
    onDragEnd: () => { dragIdx.current = null; setOver(null) },
  })

  const reorder = useCallback(async (from: number, to: number) => {
    const next = [...projects]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setProjects(next)
    // persist pin order for pinned items
    const pinned = next
      .filter((p) => p.pinned)
      .map((p, idx) => ({ id: p.id, pinned: true, pinOrder: idx }))
    if (pinned.length > 0) {
      await fetch('/api/admin/projects/pins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinned),
      })
    }
  }, [projects])

  const togglePin = async (id: string) => {
    const p = projects.find((x) => x.id === id)!
    const next = !p.pinned
    setProjects((ps) => ps.map((x) => x.id === id ? { ...x, pinned: next } : x))
    if (next) { setEditLabel(id); setLabelVal(p.pinLabel ?? '') }
    await fetch('/api/admin/projects/pins', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id, pinned: next, pinOrder: next ? 0 : null }]),
    })
    router.refresh()
  }

  const saveLabel = async (id: string) => {
    setProjects((ps) => ps.map((x) => x.id === id ? { ...x, pinLabel: labelVal } : x))
    setEditLabel(null)
    await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinLabel: labelVal }),
    })
  }

  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"?`)) return
    setProjects((ps) => ps.filter((x) => x.id !== id))
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>⠿ arraste para reordenar</span>
        <span><span className="dot" style={{ background: 'var(--acc-1)', marginRight: 5 }} />fixados sobem para o topo da home</span>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {projects.map((p, i) => (
          <div
            key={p.id}
            {...itemProps(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--paper)', border: `1px solid ${over === i ? 'var(--acc-1)' : 'var(--line)'}`,
              borderRadius: 10, padding: 12, cursor: 'grab',
              transition: 'border-color .15s, box-shadow .15s',
              boxShadow: over === i ? '0 0 0 2px color-mix(in oklch, var(--acc-1) 20%, transparent)' : 'none',
            }}
          >
            <span className="mono" style={{ color: 'var(--ink-faint)', fontSize: 18, userSelect: 'none' }}>⠿</span>

            {/* thumb */}
            <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
              <Ph
                src={p.coverPhoto?.url}
                hue={p.coverPhoto?.hue ?? 'pedra'}
                ratio={1}
                showCap={false}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{p.title}</span>
                {p.status === 'DRAFT' && (
                  <span className="mono" style={{ fontSize: 9, background: 'var(--line)', color: 'var(--ink-soft)', padding: '2px 7px', borderRadius: 99, letterSpacing: '.06em' }}>
                    RASCUNHO
                  </span>
                )}
                {p.pinned && p.pinLabel && (
                  <span className="mono" style={{ fontSize: 9.5, background: 'var(--acc-1)', color: '#fff', padding: '2px 7px', borderRadius: 99, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {p.pinLabel}
                  </span>
                )}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                {p.subtitle} · {p._count.photos} fotos
              </div>
              {editLabel === p.id && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                  <input
                    className="field"
                    style={{ padding: '6px 9px', fontSize: 12, maxWidth: 160 }}
                    value={labelVal}
                    placeholder="destaque, novo..."
                    onChange={(e) => setLabelVal(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(p.id) }}
                  />
                  <button className="btn btn--sm btn--ghost" onClick={() => saveLabel(p.id)}>ok</button>
                </div>
              )}
            </div>

            {/* actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button
                title={p.pinned ? 'Desafixar' : 'Fixar / destacar'}
                onClick={() => togglePin(p.id)}
                className="mono"
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 15,
                  border: `1px solid ${p.pinned ? 'var(--acc-1)' : 'var(--line)'}`,
                  background: p.pinned ? 'color-mix(in oklch, var(--acc-1) 14%, transparent)' : 'var(--bg)',
                  color: p.pinned ? 'var(--acc-1-ink)' : 'var(--ink-soft)',
                }}
              >
                {p.pinned ? '★' : '☆'}
              </button>
              {p.pinned && (
                <button
                  onClick={() => { setEditLabel(editLabel === p.id ? null : p.id); setLabelVal(p.pinLabel ?? '') }}
                  className="btn btn--sm btn--ghost"
                  style={{ fontSize: 10 }}
                >
                  rótulo
                </button>
              )}
              <Link href={`/admin/projetos/${p.id}`} className="btn btn--sm btn--ghost">Editar</Link>
              <button
                onClick={() => deleteProject(p.id, p.title)}
                className="mono"
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink-soft)', fontSize: 14 }}
                title="Excluir"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', border: '1px dashed var(--line)', borderRadius: 10 }}>
            <p className="serif" style={{ fontSize: 20, color: 'var(--ink-soft)' }}>Nenhum projeto ainda.</p>
            <Link href="/admin/projetos/novo" className="btn" style={{ marginTop: 16 }}>+ Criar o primeiro</Link>
          </div>
        )}
      </div>
    </div>
  )
}
