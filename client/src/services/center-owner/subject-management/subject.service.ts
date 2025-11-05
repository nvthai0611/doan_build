import { apiClient } from '../../../utils/clientAxios'
import type {
  SubjectItem,
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectsResponse,
  SubjectResponse,
} from './subject.types'

const BASE_URL = '/admin-center/subjects'

export const subjectService = {
  getSubjects: async (): Promise<SubjectItem[]> => {
    const res = await apiClient.get<SubjectsResponse>(BASE_URL)
    return (res.data?.data || res.data || []) as SubjectItem[]
  },

  getSubjectById: async (id: string): Promise<SubjectItem> => {
    const res = await apiClient.get<SubjectResponse>(`${BASE_URL}/${id}`)
    return (res.data?.data || res.data) as SubjectItem
  },

  createSubject: async (data: CreateSubjectDto): Promise<SubjectItem> => {
    const res = await apiClient.post<SubjectResponse>(BASE_URL, data)
    return (res.data?.data || res.data) as SubjectItem
  },

  updateSubject: async (id: string, data: UpdateSubjectDto): Promise<SubjectItem> => {
    const res = await apiClient.put<SubjectResponse>(`${BASE_URL}/${id}`, data)
    return (res.data?.data || res.data) as SubjectItem
  },

  deleteSubject: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`)
  },
}


