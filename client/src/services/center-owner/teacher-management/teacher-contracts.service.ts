import { apiClient } from '../../../utils/clientAxios'

export interface TeacherContract {
  id: string
  uploadedImageName?: string
  fileName?: string
  uploadedImageUrl: string
  contractType?: string
  type?: string
  uploadedAt?: string
  uploadDate?: string
  startDate?: string
  expiryDate?: string
  teacherSalaryPercent?: number
  notes?: string
  status?: "active" | "expiring_soon" | "expired"
}

export const teacherContractsService = {
  async getTeacherContracts(teacherId: string): Promise<TeacherContract[]> {
    const res = await apiClient.get<{ contractUploads: TeacherContract[] }>(`/admin-center/teachers/${teacherId}/contracts`)
    return res.data.contractUploads || []
  },

  async uploadContract(teacherId: string, formData: FormData): Promise<any> {
    const res = await apiClient.post(`/admin-center/teachers/${teacherId}/contracts/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  async deleteContract(teacherId: string, contractId: string): Promise<void> {
    await apiClient.delete(`/admin-center/teachers/${teacherId}/contracts/${contractId}`)
  },
}
