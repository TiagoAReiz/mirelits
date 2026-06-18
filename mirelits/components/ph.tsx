import { HUES } from '@/lib/constants'
import Image from 'next/image'

interface PhProps {
  hue?: string
  ratio?: number
  cap?: string
  src?: string | null
  className?: string
  style?: React.CSSProperties
  showCap?: boolean
  angle?: number
  fill?: boolean
  natural?: boolean
  sizes?: string
}

export function Ph({ hue = 'pedra', ratio, cap, src, className = '', style = {}, showCap = true, angle, fill, natural, sizes = '(max-width: 760px) 100vw, 50vw' }: PhProps) {
  const h = HUES[hue] ?? HUES.pedra

  const st: React.CSSProperties = {
    '--ph-base': h.base,
    '--ph-stripe': h.stripe,
    ...(angle != null ? { '--ph-angle': `${angle}deg` } : {}),
    ...(ratio != null && !fill && !natural ? { aspectRatio: `1 / ${ratio}` } : {}),
    ...(fill && !natural ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}),
    ...style,
  } as React.CSSProperties

  if (src) {
    if (natural) {
      return (
        <div className={`ph ${className}`} style={st}>
          <Image
            src={src}
            alt={cap ?? ''}
            width={1000}
            height={Math.round(1000 * (ratio || 1))}
            sizes={sizes}
            style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 1, display: 'block' }}
          />
          {showCap && cap ? <span className="ph-cap">{cap}</span> : null}
        </div>
      )
    }

    return (
      <div className={`ph ${className}`} style={st}>
        <Image
          src={src}
          alt={cap ?? ''}
          fill
          sizes={sizes}
          style={{ objectFit: 'cover', zIndex: 1 }}
        />
      </div>
    )
  }

  return (
    <div className={`ph ${className}`} style={st}>
      {showCap && cap ? <span className="ph-cap">{cap}</span> : null}
    </div>
  )
}
