import { apiClient } from '../../../utils/clientAxios';

export interface StudentCommitment {
  id: string;
  contractType: string;
  uploadedImageUrl: string;
  uploadedImageName: string;
  uploadedAt: string;
  expiredAt: string | null;
  status: string;
  note: string | null;
  subjectIds: string[];
}

export const parentCommitmentsService = {
  /**
   * Lấy danh sách hợp đồng của học sinh
   */
  async getStudentCommitments(studentId: string): Promise<{ data: StudentCommitment[] }> {
    try {
      const response = await apiClient.get(`/parent/commitments/student/${studentId}`);
      return response as any;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Upload hợp đồng mới
   */
  async uploadCommitment(params: {
    studentId: string;
    file: File;
    subjectIds: string[];
    note?: string;
  }): Promise<{ data: StudentCommitment }> {
    try {
      const formData = new FormData();
      formData.append('studentId', params.studentId);
      formData.append('file', params.file);
      formData.append('subjectIds', JSON.stringify(params.subjectIds));
      if (params.note) formData.append('note', params.note);

      const response = await apiClient.post('/parent/commitments/upload', formData, {
        contentType: 'multipart/form-data'
      });
      return response as any;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Xóa hợp đồng
   */
  async deleteCommitment(commitmentId: string, studentId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/parent/commitments/${commitmentId}/student/${studentId}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },
};

