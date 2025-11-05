import { apiClient } from '../../utils/clientAxios';

export interface PublicTeacher {
  id: string;
  name: string;
  subject: string;
  experience: number;
  students: number;
  rating: number;
  avatar: string | null;
}

export interface TeachersResponse {
  success: boolean;
  data: PublicTeacher[];
  message: string;
}

class PublicTeacherService {
  /**
   * Lấy danh sách giáo viên (public API)
   */
  async getTeachers(params?: { subjectId?: string; limit?: number }): Promise<TeachersResponse> {
    try {
      const queryParams: any = {};
      if (params?.subjectId) queryParams.subjectId = params.subjectId;
      if (params?.limit) queryParams.limit = params.limit;

      const response = await apiClient.get('/shared/public/teachers', queryParams);
      return response as any;
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  }
}

export const publicTeacherService = new PublicTeacherService();