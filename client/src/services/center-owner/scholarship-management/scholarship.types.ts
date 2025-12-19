export interface Scholarship {
  id: string
  name: string
  description: string | null
  percent: number
  criteria: any | null // JSON object
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateScholarshipDto {
  name: string
  description?: string | null
  percent: number
  criteria?: any | null
  isActive?: boolean
}

export interface UpdateScholarshipDto {
  name?: string
  description?: string | null
  percent?: number
  criteria?: any | null
  isActive?: boolean
}

export interface QueryScholarshipParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface ScholarshipsResponse {
  success: boolean
  message: string
  data: Scholarship[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ScholarshipResponse {
  success: boolean
  message: string
  data: Scholarship
}

