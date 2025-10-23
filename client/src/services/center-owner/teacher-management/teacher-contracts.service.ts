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
  expiryDate?: string
  notes?: string
}

export const teacherContractsService = {
  async getTeacherContracts(teacherId: string): Promise<TeacherContract[]> {
    const res = await apiClient.get<{ contractUploads: TeacherContract[] }>(`/admin-center/teachers/${teacherId}/contracts`)
    return res.data.contractUploads || []
  },
  
  async deleteContract(teacherId: string, contractId: string): Promise<void> {
    await apiClient.delete(`/admin-center/teachers/${teacherId}/contracts/${contractId}`)
  },
}
