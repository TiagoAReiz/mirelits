'use client'

import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  style?: React.CSSProperties
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function CustomSelect({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          background: 'var(--paper)',
          border: `1px solid ${open ? 'var(--acc-1)' : 'var(--line)'}`,
          borderRadius: 'var(--radius)',
          boxShadow: open
            ? '0 0 0 3px color-mix(in oklch, var(--acc-1) 18%, transparent)'
            : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color .18s ease, box-shadow .18s ease',
          color: 'var(--ink)',
          fontSize: 15,
          fontFamily: 'var(--ff-body)',
        }}
      >
        {selected?.icon && (
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--acc-1)' }}>
            {selected.icon}
          </span>
        )}
        <span style={{ flex: 1, ...(selected?.style ?? {}) }}>
          {selected?.label ?? placeholder ?? '—'}
        </span>
        <span style={{ color: 'var(--ink-soft)', fontSize: 11, flexShrink: 0 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            boxShadow: '0 4px 16px color-mix(in oklch, var(--ink) 10%, transparent)',
            zIndex: 100,
            maxHeight: 260,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--line) transparent',
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: isActive
                    ? 'color-mix(in oklch, var(--acc-1) 6%, var(--paper))'
                    : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? 'var(--acc-1)' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--ink)',
                  fontFamily: 'var(--ff-body)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = 'var(--line-soft)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {opt.icon && (
                  <span style={{ display: 'flex', flexShrink: 0, color: 'var(--acc-1)' }}>
                    {opt.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      ...(opt.style ?? {}),
                      fontSize: opt.style ? 17 : 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {opt.label}
                  </span>
                  {opt.style && (
                    <span
                      style={{
                        display: 'block',
                        ...(opt.style ?? {}),
                        fontStyle: 'italic',
                        fontSize: 12,
                        color: 'var(--ink-soft)',
                        marginTop: 2,
                      }}
                    >
                      Aa
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
