import sharp from 'sharp'
import type { IArtistProfileStorage } from '../core/artist-profile.storage.port'
import { supabase } from '@/lib/supabase'

const BUCKET = 'artist-assets'

export class SupabaseArtistProfileStorageAdapter implements IArtistProfileStorage {
  async uploadProfilePhoto(file: Buffer, filename: string): Promise<string> {
    return this.#upload(file, `profile/${filename}`)
  }

  async uploadLogo(file: Buffer, filename: string): Promise<string> {
    return this.#upload(file, `logo/${filename}`)
  }

  async delete(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Delete falhou: ${error.message}`)
  }

  async #upload(file: Buffer, path: string): Promise<string> {
    const compressed = await sharp(file).webp({ quality: 85 }).toBuffer()
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(`Upload falhou: ${error.message}`)
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  }
}
