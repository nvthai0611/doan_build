import { apiClient } from '../../../utils/clientAxios';

export const parentClassJoinService = {
  async getClassInfo(data: { codeOrLink: string }) {
    try {
      console.log("step1");
      
      const response = await apiClient.post('/parent/class-join/get-class-info', data);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  async requestJoinClassForm(params: { classId: string; studentId: string; contractUploadId: string; password?: string; message?: string }) {
    try {
      const formData = new FormData();
      formData.append('classId', params.classId);
      formData.append('studentId', params.studentId);
      formData.append('contractUploadId', params.contractUploadId);
      if (params.password) formData.append('password', params.password);
      if (params.message) formData.append('message', params.message);

      const response = await apiClient.post('/parent/class-join/request-join', formData, {
        contentType: 'multipart/form-data'
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  async getMyRequests(params?: { status?: string; page?: number; limit?: number }) {
    try {
      const response = await apiClient.get('/parent/class-join/my-requests', params);
      return response;
    } catch (error: any) {
      throw error;
    }
  },
};

