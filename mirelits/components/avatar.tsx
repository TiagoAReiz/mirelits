import { HUES } from '@/lib/constants'
import Image from 'next/image'

interface AvatarProps {
  name: string
  profileHue?: string
  profilePhotoUrl?: string | null
  size?: number
  ring?: boolean
}

export function Avatar({ name, profileHue = 'laranja', profilePhotoUrl, size = 36, ring = false }: AvatarProps) {
  const h = HUES[profileHue] ?? HUES.laranja
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const fill = size >= 1000

  const dim = fill ? '100%' : `${size}px`
  const fontPx = fill ? 72 : size * 0.4

  const boxStyle: React.CSSProperties = {
    width: dim,
    height: dim,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    boxShadow: ring ? '0 0 0 3px var(--bg), 0 0 0 5px var(--line)' : 'none',
  }

  if (profilePhotoUrl) {
    return (
      <div style={boxStyle}>
        <Image src={profilePhotoUrl} alt={name} fill style={{ objectFit: 'cover' }} sizes="120px" />
      </div>
    )
  }

  return (
    <div style={{ ...boxStyle, background: h.base, display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(125deg, transparent 0 7px, color-mix(in oklch, ${h.stripe} 14%, transparent) 7px 8px)`,
        }}
      />
      <span
        className="serif"
        style={{ position: 'relative', color: '#fff', fontSize: fontPx, fontWeight: 600, lineHeight: 1, textShadow: `0 1px 2px color-mix(in oklch, ${h.stripe} 50%, transparent)` }}
      >
        {initials}
      </span>
    </div>
  )
}
