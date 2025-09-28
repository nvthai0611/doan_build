import { ApiService } from "../../common/api/api-client"
import type { StudentEnrollment, EnrollmentRequest, EnrollmentQueryParams } from "./enrollment.types"

export const studentEnrollmentService = {
  getEnrollments: async (params?: EnrollmentQueryParams): Promise<StudentEnrollment[]> => {
    const response = await ApiService.get<StudentEnrollment[]>("/student/enrollments", params)
    return response.data as StudentEnrollment[]
  },

  requestEnrollment: async (data: EnrollmentRequest): Promise<any> => {
    const response = await ApiService.post("/student/enrollments/request", data)
    return response.data as any 
  },

  cancelEnrollment: async (enrollmentId: string): Promise<void> => {
    await ApiService.delete(`/student/enrollments/${enrollmentId}`)
  }
}
