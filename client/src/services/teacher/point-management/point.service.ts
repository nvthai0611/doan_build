import { apiClient } from '../../../utils/clientAxios'
import { Assessment, AssessmentGradeView, RecordGradesPayload, TeacherStudentSummary, UpdateGradePayload } from './point.types'

const base = '/teacher/grades'

export const pointService = {
  getClassStudents: async (classId: string) => {
    const res = await apiClient.get<{ success: boolean; data: TeacherStudentSummary[] }>(`${base}/class-students`, { classId })
    return res.data
  },

  getAssessments: async (classId: string) => {
    const res = await apiClient.get<{ success: boolean; data: Assessment[] }>(`${base}/assessments`, { classId })
    return res.data
  },

  getAssessmentTypes: async (classId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: string[] }>(`${base}/assessment-types`, classId ? { classId } : undefined)
    return res.data
  },

  getAssessmentGrades: async (assessmentId: string) => {
    const res = await apiClient.get<{ success: boolean; data: AssessmentGradeView[] }>(`${base}/assessments/${assessmentId}/grades`)
    return res.data
  },

  recordGrades: async (payload: RecordGradesPayload) => {
    const res = await apiClient.post<{ success: boolean; data: { assessmentId: string } }>(`${base}/record`, payload)
    return res.data
  },

  updateGrade: async (payload: UpdateGradePayload) => {
    const res = await apiClient.put<{ success: boolean; data: any }>(`${base}/update`, payload)
    return res.data
  },
}

export type PointService = typeof pointService

