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

  async requestJoinClass(data: { classId: string; studentId: string; password?: string; message?: string; commitmentImageUrl?: string }) {
    try {
      const response = await apiClient.post('/parent/class-join/request-join', data);
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

