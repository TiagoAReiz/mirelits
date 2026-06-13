import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  const buf = readFileSync(join(process.cwd(), 'public', 'Mirela perfil.jpg'))
  const src = `data:image/jpeg;base64,${buf.toString('base64')}`
  return new ImageResponse(
    (<img src={src} width={64} height={64} style={{ objectFit: 'cover', borderRadius: 12 }} />),
    { ...size },
  )
}
