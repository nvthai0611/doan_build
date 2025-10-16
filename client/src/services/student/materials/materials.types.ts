export interface StudentMaterial {
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

export interface StudentMaterialsResponse {
  items: StudentMaterial[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  stats: { totalSize: number; totalDownloads: number; recentUploads: number }
}

export interface GetStudentMaterialsParams {
  classId?: string
  category?: string
  page?: number
  limit?: number
  search?: string
}

