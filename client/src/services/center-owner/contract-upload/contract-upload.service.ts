import { ApiService } from "../../common/api/api-client"
import type { ContractUpload, CreateContractUploadDto, UpdateContractUploadDto } from "./contract-upload.types"

export const contractUploadService = {
  /**
   * Get all contract uploads for a student
   */
  async getByStudentId(studentId: string): Promise<ContractUpload[]> {
    try {
      const response = await ApiService.get(`/admin-center/contract-uploads/student/${studentId}`)
      console.log('🔍 API Response:', response)
      return response.data || []
    } catch (error) {
      console.error("Error fetching contract uploads:", error)
      throw error
    }
  },

  /**
   * Upload a new contract for student
   */
  async uploadContract(
    studentId: string,
    data: CreateContractUploadDto
  ): Promise<ContractUpload> {
    try {
      const formData = new FormData()
      
      if (data.parentId) {
        formData.append('parentId', data.parentId)
      }
      formData.append('contractType', data.contractType)
      
      if (data.subjectIds && data.subjectIds.length > 0) {
        formData.append('subjectIds', JSON.stringify(data.subjectIds))
      }
      
      if (data.note) {
        formData.append('note', data.note)
      }
      
      if (data.expiredAt) {
        formData.append('expiredAt', new Date(data.expiredAt).toISOString())
      }
      
      formData.append('applicationFile', data.applicationFile)

      const response = await ApiService.post(
        `/admin-center/contract-uploads/student/${studentId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } as any
      )
      
      return response.data.data
    } catch (error) {
      console.error("Error uploading contract:", error)
      throw error
    }
  },

  /**
   * Update contract
   */
  async updateContract(
    contractId: string,
    data: UpdateContractUploadDto
  ): Promise<ContractUpload> {
    try {
      const response = await ApiService.put(
        `/admin-center/contract-uploads/${contractId}`,
        data
      )
      return response.data.data
    } catch (error) {
      console.error("Error updating contract:", error)
      throw error
    }
  },

  /**
   * Delete contract
   */
  async deleteContract(contractId: string): Promise<void> {
    try {
      await ApiService.delete(`/admin-center/contract-uploads/${contractId}`)
    } catch (error) {
      console.error("Error deleting contract:", error)
      throw error
    }
  }
}
