import {apiClient} from '../../utils/clientAxios';

export interface RecruitingClass {
  id: string;
  name: string;
  classCode: string | null;
  description: string | null;
  status: string;
  maxStudents: number | null;
  currentStudents: number;
  pendingRequests: number;
  completedSessionsCount: number; // Số buổi học đã hoàn thành
  subject: {
    id: string;
    name: string;
  } | null;
  grade: {
    id: string;
    name: string;
  } | null;
  teacher: {
    id: string;
    fullName: string;
    avatar: string | null;
  } | null;
  recurringSchedule: any;
  expectedStartDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  requirePassword: boolean;
  createdAt: string;
}

export interface RecruitingClassesResponse {
  success: boolean;
  data: RecruitingClass[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface SubjectGradeResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
  }>;
  message: string;
}

class PublicClassesService {
  /**
   * Lấy danh sách lớp đang tuyển sinh (public API)
   */
  async getRecruitingClasses(params?: {
    page?: number;
    limit?: number;
    subjectId?: string;
    gradeId?: string;
  }): Promise<any> {
    try {
      const queryParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        ...(params?.subjectId && { subjectId: params.subjectId }),
        ...(params?.gradeId && { gradeId: params.gradeId }),
      };
      
      const response = await apiClient.get('/shared/public/classes/recruiting', queryParams);
      
      return response;
    } catch (error: any) {
      console.error('Error fetching recruiting classes:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách môn học (public API)
   */
  async getSubjects(): Promise<any> {
    try {
      const response = await apiClient.get('/shared/public/classes/subjects', {});
      return response;
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách khối lớp (public API)
   */
  async getGrades(): Promise<any> {
    try {
      const response = await apiClient.get('/shared/public/classes/grades', {});
      return response;
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }
}

export const publicClassesService = new PublicClassesService();

