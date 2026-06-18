import Link from 'next/link'
import { Ph } from './ph'

const SPREAD = [
  { dr: '-17deg', dx: '-58px', dy: '18px' },
  { dr: '15deg',  dx: '56px',  dy: '12px' },
  { dr: '-8deg',  dx: '-30px', dy: '42px' },
  { dr: '21deg',  dx: '30px',  dy: '38px' },
]

interface Photo {
  id: string
  url: string
  ratio?: number | null
  hue?: string | null
}

interface ProjectCardProps {
  id: string
  title: string
  subtitle?: string | null
  category?: string | null
  pinned?: boolean
  pinLabel?: string | null
  coverPhoto?: Photo | null
  photos: Photo[]
  hoverStyle?: 'deck' | 'dark'
}

export function ProjectCard({
  id,
  title,
  subtitle,
  category,
  pinned,
  pinLabel,
  coverPhoto,
  photos,
  hoverStyle = 'deck',
}: ProjectCardProps) {
  const cover = coverPhoto ?? photos[0]
  // exclude the cover so it doesn't duplicate in the deck spread
  const deckPhotos = photos.filter((p) => p.id !== cover?.id).slice(0, 4)

  return (
    <Link href={`/projeto/${id}`} className={`pcard pcard--${hoverStyle}`}>
      {/* deck layers (only rendered for deck style) */}
      {hoverStyle === 'deck' && deckPhotos.map((photo, i) => {
        const s = SPREAD[i]
        return (
          <div
            key={photo.id}
            className="pcard__deck"
            style={{ '--dx': s.dx, '--dy': s.dy, '--dr': s.dr, '--photo-ratio': photo.ratio ?? 1.4, '--i': i } as React.CSSProperties}
          >
            <Ph
              src={photo.url}
              hue={photo.hue ?? 'pedra'}
              ratio={photo.ratio ?? 1.4}
              fill
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          </div>
        )
      })}

      {/* cover */}
      <div className="pcard__img">
        {pinned && (
          <span className="pcard__pin">{pinLabel || 'Destaque'}</span>
        )}
        <Ph
          src={cover?.url}
          hue={cover?.hue ?? 'pedra'}
          ratio={cover?.ratio ?? 1.4}
          natural={!!cover?.url}
          style={{ width: '100%' }}
        />

        {hoverStyle === 'deck' && (
          <div className="pcard__hover-cap">
            <div className="pcard__title">{title}</div>
            {(category || subtitle) && (
              <div className="pcard__meta">
                {[category, subtitle].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        )}

        {hoverStyle === 'dark' && (
          <div className="pcard__hover-cap">
            <div className="pcard__title">{title}</div>
            {(category || subtitle) && (
              <div className="pcard__meta">
                {[category, subtitle].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
