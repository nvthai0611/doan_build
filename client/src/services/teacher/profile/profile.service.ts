import { ApiService } from "../../common/api/api-client"
import type { TeacherProfile, UpdateProfileRequest, ChangePasswordRequest } from "./profile.types"

export const teacherProfileService = {
  getProfile: async (): Promise<TeacherProfile> => {
    const response = await ApiService.get<TeacherProfile>("/teacher/profile")
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<TeacherProfile> => {
    const response = await ApiService.patch<TeacherProfile>("/teacher/profile", data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await ApiService.post("/teacher/profile/change-password", data)
  },

  uploadDocument: async (file: File, docType: string): Promise<any> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("docType", docType)
    
    const response = await ApiService.uploadFile("/teacher/profile/documents", file, { docType })
    return response.data
  }
}
