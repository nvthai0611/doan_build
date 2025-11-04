export interface ContractUpload {
  id: string
  studentId?: string
  parentId?: string
  enrollmentId?: string
  teacherId?: string
  contractType: string
  subjectIds: string[]
  uploadedImageUrl: string
  uploadedImageName?: string
  uploadedAt: Date | string
  startDate?: Date | string
  expiredAt?: Date | string
  note?: string
  status?: string
}

export interface CreateContractUploadDto {
  parentId?: string
  contractType: string
  subjectIds?: string[]
  note?: string
  expiredAt?: Date | string
  applicationFile: File
}

export interface UpdateContractUploadDto {
  subjectIds?: string[]
  note?: string
  expiredAt?: Date | string
  status?: string
}
