export interface SubjectItem {
  id: string
  code: string
  name: string
  description?: string | null
  createdAt?: string | Date
}

export interface CreateSubjectDto {
  code: string
  name: string
  description?: string
}

export interface UpdateSubjectDto {
  code?: string
  name?: string
  description?: string
}

export interface SubjectsResponse {
  success: boolean
  message: string
  data: SubjectItem[]
}

export interface SubjectResponse {
  success: boolean
  message: string
  data: SubjectItem
}


