import { ApiService } from "../../common/api/api-client"
import type { StudentProfile, UpdateProfileRequest, ChangePasswordRequest } from "./profile.types"

export const studentProfileService = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await ApiService.get<StudentProfile>("/student/profile")
    return response.data as StudentProfile
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<StudentProfile> => {
    const response = await ApiService.patch<StudentProfile>("/student/profile", data)
    return response.data as StudentProfile
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await ApiService.post("/student/profile/change-password", data)
  }
}
