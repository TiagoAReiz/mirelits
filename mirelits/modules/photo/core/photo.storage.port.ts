export interface IPhotoStorage {
  upload(file: Buffer, filename: string, bucket: string): Promise<{ path: string; url: string }>
  delete(path: string, bucket: string): Promise<void>
}
