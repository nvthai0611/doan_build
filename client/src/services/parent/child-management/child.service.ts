import { apiClient } from "../../common/api/api-client"
import type { Child, ChildEnrollment, ChildAttendance, ChildGrade, ChildPayment, ChildQueryParams } from "./child.types"

export const parentChildService = {
  getChildren: async (params?: ChildQueryParams): Promise<Child[]> => {
    const response = await apiClient.get<Child[]>("/parent/student-management/children", params as any)
    return (response as any)?.data?.data ?? (response as any)?.data ?? []
  },

  getChildById: async (childId: string): Promise<Child> => {
    const response = await apiClient.get<Child>(`/parent/student-management/children/${childId}`)
    return (response as any)?.data?.data ?? (response as any)?.data
  },

  getChildEnrollments: async (childId: string): Promise<ChildEnrollment[]> => {
    const response = await apiClient.get<ChildEnrollment[]>(`/parent/children/${childId}/enrollments`)
    return (response as any)?.data
  },

  getChildAttendance: async (childId: string, classId?: string, startDate?: string, endDate?: string): Promise<ChildAttendance[]> => {
    const params: any = {}
    if (classId) params.classId = classId
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await apiClient.get<ChildAttendance[]>(`/parent/student-management/children/${childId}/attendance`, params)
    return (response as any)?.data
  },

  getChildGrades: async (childId: string, subject?: string): Promise<ChildGrade[]> => {
    const params = subject ? { subject } : {}
    const response = await apiClient.get<ChildGrade[]>(`/parent/student-management/children/${childId}/grades`, params)
    return (response as any)?.data?.data ?? (response as any)?.data
  },

  getChildPayments: async (childId: string): Promise<ChildPayment[]> => {
    const response = await apiClient.get<ChildPayment[]>(`/parent/children/${childId}/payments`)
    return (response as any)?.data
  },

  getChildReport: async (childId: string, period: string): Promise<any> => {
    const response = await apiClient.get(`/parent/student-management/children/${childId}/report`, { period })
    return (response as any)?.data
  },

  getChildSchedule: async (
    childId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/parent/student-management/children/${childId}/schedule`, params)
    return (response as any)?.data?.data ?? (response as any)?.data
  }
}
