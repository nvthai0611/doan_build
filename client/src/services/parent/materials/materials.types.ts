export interface ParentMaterial {
  id: number
  title: string
  description?: string
  fileName: string
  fileType?: string
  fileSize?: number
  category?: string
  fileUrl?: string
  uploadedAt: string
  classId: string
  className?: string
  teacherName?: string
  downloads: number
}

export interface ParentMaterialsResponse {
  items: ParentMaterial[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  stats: { totalSize: number; recentUploads: number }
}

export interface GetParentMaterialsParams {
  childId: string
  classId?: string
  category?: string
  page?: number
  limit?: number
  search?: string
}


