import sharp from 'sharp'
import type { IPhotoStorage } from '../core/photo.storage.port'
import { supabase } from '@/lib/supabase'

export class SupabasePhotoStorageAdapter implements IPhotoStorage {
  async upload(file: Buffer, filename: string, bucket: string): Promise<{ path: string; url: string }> {
    const compressed = await sharp(file).webp({ quality: 80 }).toBuffer()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, compressed, { contentType: 'image/webp', upsert: false })
    if (error) throw new Error(`Upload falhou: ${error.message}`)
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return { path: data.path, url: urlData.publicUrl }
  }

  async delete(path: string, bucket: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Delete falhou: ${error.message}`)
  }
}
