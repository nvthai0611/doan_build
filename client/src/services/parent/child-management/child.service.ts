import { ApiService } from "../../common/api/api-client"
import type { Child, ChildEnrollment, ChildAttendance, ChildGrade, ChildPayment, ChildQueryParams } from "./child.types"

export const parentChildService = {
  getChildren: async (params?: ChildQueryParams): Promise<Child[]> => {
    const response = await ApiService.get<Child[]>("/parent/children", params)
    return response.data as Child[]
  },

  getChildById: async (childId: string): Promise<Child> => {
    const response = await ApiService.get<Child>(`/parent/children/${childId}`)
    return response.data as Child
  },

  getChildEnrollments: async (childId: string): Promise<ChildEnrollment[]> => {
    const response = await ApiService.get<ChildEnrollment[]>(`/parent/children/${childId}/enrollments`)
    return response.data as ChildEnrollment[]
  },

  getChildAttendance: async (childId: string, classId?: string, startDate?: string, endDate?: string): Promise<ChildAttendance[]> => {
    const params: any = {}
    if (classId) params.classId = classId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await ApiService.get<ChildAttendance[]>(`/parent/children/${childId}/attendance`, params)
    return response.data as ChildAttendance[]
  },

  getChildGrades: async (childId: string, classId?: string): Promise<ChildGrade[]> => {
    const params = classId ? { classId } : {}
    const response = await ApiService.get<ChildGrade[]>(`/parent/children/${childId}/grades`, params)
    return response.data as ChildGrade[]
  },

  getChildPayments: async (childId: string): Promise<ChildPayment[]> => {
    const response = await ApiService.get<ChildPayment[]>(`/parent/children/${childId}/payments`)
    return response.data as ChildPayment[]
  },

  getChildReport: async (childId: string, period: string): Promise<any> => {
    const response = await ApiService.get(`/parent/children/${childId}/report`, { period })
    return response.data as any
  }
}
