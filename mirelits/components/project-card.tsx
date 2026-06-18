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
            style={{ '--dx': s.dx, '--dy': s.dy, '--dr': s.dr } as React.CSSProperties}
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
          natural
          style={{ width: '100%' }}
        />

        {/* deck: always-visible overlay caption at bottom */}
        {hoverStyle === 'deck' && (
          <div className="pcard__cap">
            {category && <span className="pcard__cat">{category}</span>}
            <span className="pcard__title">{title}</span>
          </div>
        )}

        {/* dark: caption appears on hover */}
        {hoverStyle === 'dark' && (
          <div className="pcard__hover-cap">
            <div className="label" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{category}</div>
            <div className="serif" style={{ fontSize: 'clamp(15px, 2vw, 20px)' }}>{title}</div>
          </div>
        )}
      </div>
    </Link>
  )
}
