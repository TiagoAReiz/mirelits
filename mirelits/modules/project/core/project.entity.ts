export type ProjectStatus = 'DRAFT' | 'PUBLISHED'

export type Project = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  status: ProjectStatus
  pinned: boolean
  pinOrder: number | null
  coverPhotoId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ProjectSummary = {
  id: string
  title: string
  subtitle: string | null
  status: ProjectStatus
  pinned: boolean
  pinOrder: number | null
  coverPhoto: { url: string } | null
}

export type ProjectDetail = Project & {
  photos: Array<{ id: string; url: string; position: number }>
  coverPhoto: { url: string } | null
}
