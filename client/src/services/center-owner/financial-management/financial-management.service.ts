import { apiClient } from '../../../utils/clientAxios';

export interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  period: 'per_session' | 'monthly' | 'quarterly' | 'yearly';
  description?: string;
  isActive: boolean;
  gradeId?: string;
  subjectId?: string;
  grade?: Grade;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

export interface SessionFeeMatrix {
  grade: Grade;
  subjects: Array<{
    subject: Subject;
    fee: {
      id: string;
      amount: number;
      name: string;
    } | null;
  }>;
}

export interface SessionFeeMatrixResponse {
  matrix: SessionFeeMatrix[];
  grades: Grade[];
  subjects: Subject[];
  totalGrades: number;
  totalSubjects: number;
}

export interface UpsertSessionFeeRequest {
  gradeId: string;
  subjectId: string;
  amount: number;
}

export interface BulkUpdateSessionFeesRequest {
  updates: Array<{
    gradeId: string;
    subjectId: string;
    amount: number;
  }>;
}

class FinancialManagementService {
  /**
   * Lấy danh sách học phí theo buổi
   */
  async getSessionFeeStructures() {
    try {
      const response = await apiClient.get('/admin-center/financial-management/session-fees');
      return response.data;
    } catch (error) {
      console.error('Error fetching session fee structures:', error);
      throw error;
    }
  }

  /**
   * Lấy ma trận học phí theo buổi
   */
  async getSessionFeeMatrix() {
    try {
      const response = await apiClient.get('/admin-center/financial-management/session-fees/matrix');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching session fee matrix:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách khối lớp
   */
  async getGrades() {
    try {
      const response = await apiClient.get('/admin-center/financial-management/grades');
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách môn học
   */
  async getSubjects() {
    try {
      const response = await apiClient.get('/admin-center/financial-management/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  /**
   * Tạo hoặc cập nhật học phí theo buổi
   */
  async upsertSessionFee(data: UpsertSessionFeeRequest) {
    try {
      const response = await apiClient.post('/admin-center/financial-management/session-fees', data);
      return response.data;
    } catch (error) {
      console.error('Error upserting session fee:', error);
      throw error;
    }
  }

  /**
   * Cập nhật hàng loạt học phí theo buổi
   */
  async bulkUpdateSessionFees(data: BulkUpdateSessionFeesRequest) {
    try {
      const response = await apiClient.put('/admin-center/financial-management/session-fees/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error bulk updating session fees:', error);
      throw error;
    }
  }

  /**
   * Xóa học phí theo buổi
   */
  async deleteSessionFee(id: string) {
    try {
      const response = await apiClient.delete(`/admin-center/financial-management/session-fees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session fee:', error);
      throw error;
    }
  }
}

export const financialManagementService = new FinancialManagementService();
