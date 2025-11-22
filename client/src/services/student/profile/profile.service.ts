import { ApiService } from "../../common/api/api-client"
import type { StudentProfile } from "./profile.types"

export const studentProfileService = {
  getProfile: async (): Promise<StudentProfile> => {
    const response = await ApiService.get<StudentProfile>("/student/profile")
    return response.data as StudentProfile
  }
}
