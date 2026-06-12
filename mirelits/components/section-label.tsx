interface SectionLabelProps {
  children: React.ReactNode
  color?: string
}

export function SectionLabel({ children, color = 'var(--acc-1)' }: SectionLabelProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span className="dot" style={{ background: color }} />
      <span className="label">{children}</span>
    </div>
  )
}
