export interface IArtistProfileStorage {
  uploadProfilePhoto(file: Buffer, filename: string): Promise<string>
  uploadLogo(file: Buffer, filename: string): Promise<string>
  delete(path: string): Promise<void>
}
