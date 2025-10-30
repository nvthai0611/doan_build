import {apiClient} from '../../utils/clientAxios';

export interface StudentClassRequest {
  id: string;
  studentId: string;
  classId: string;
  message: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  createdAt: string;
  processedAt: string | null;
  student: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  parent: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  class: {
    id: string;
    name: string;
    subject: string | null;
    teacher: {
      id: string;
      fullName: string;
    } | null;
  };
}

export interface StudentClassRequestDetail extends StudentClassRequest {
  student: StudentClassRequest['student'] & {
    birthDate: string | null;
  };
  class: StudentClassRequest['class'] & {
    maxStudents: number | null;
    currentStudents: number;
  };
}

export interface GetRequestsParams {
  status?: string;
  classId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface GetRequestsResponse {
  success: boolean;
  data: StudentClassRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface RequestDetailResponse {
  success: boolean;
  data: StudentClassRequestDetail;
  message: string;
}

export interface ApproveRejectResponse {
  success: boolean;
  data: any;
  message: string;
}

const studentClassRequestService = {
  /**
   * Lấy danh sách tất cả requests
   */
  async getAllRequests(params?: GetRequestsParams): Promise<GetRequestsResponse> {
    try {
      const response = await apiClient.get('/admin-center/student-class-requests',params);
      return response as any;
    } catch (error: any) {
      console.error('Error getting student class requests:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Lấy chi tiết một request
   */
  async getRequestById(id: string): Promise<RequestDetailResponse> {
    try {
      const response = await apiClient.get(`/admin-center/student-class-requests/${id}`);
      return response.data as any;
    } catch (error: any) {
      console.error('Error getting request detail:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Approve request
   */
  async approveRequest(id: string): Promise<any> {
    try {
      const response = await apiClient.post(
        `/admin-center/student-class-requests/${id}/approve`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error approving request:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Reject request
   */
  async rejectRequest(id: string, reason?: string): Promise<any> {
    try {
      const response = await apiClient.post(
        `/admin-center/student-class-requests/${id}/reject`,
        { reason }
      );
      return response;
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      throw error.response?.data || error;
    }
  },
};

export default studentClassRequestService;

