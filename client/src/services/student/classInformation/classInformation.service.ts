import { ApiService } from "../../common/api/api-client"

export const studentClassInformationService = {
  getEnrolledSubjects: async (): Promise<any[]> => {
    const response = await ApiService.get<any[]>("/student/class-information/enrolled-subjects")
    return (response as any)?.data ?? []
  },
  getClassMembers: async (classId: string): Promise<any[]> => {
    const response = await ApiService.get<any[]>(`/student/class-information/classes/${classId}/students`)
    return (response as any)?.data ?? []
  },
  getClassDetail: async (classId: string): Promise<any> => {
    const response = await ApiService.get<any>(`/student/class-information/classes/${classId}`)
    return (response as any)?.data
  },
}
