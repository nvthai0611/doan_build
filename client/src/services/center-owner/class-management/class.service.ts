import {apiClient} from '../../../utils/clientAxios';

const BASE_URL = '/admin-center/classes';

export const classService = {
    // Get all classes with filters
    getClasses: async (params?: any) => {
        const response = await apiClient.get(BASE_URL, params);
        return response;
    },

    // Get teacher classes
    getClassByTeacherId: async (teacherId: string, params?: any) => {
        const response = await apiClient.get(`${BASE_URL}/${teacherId}/teacher`, { params });
        return response;
    },

    // Get single class by ID
    getClassById: async (id: string) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response;
    },

    // Create new class
    createClass: async (data: any) => {
        const response = await apiClient.post(BASE_URL, data);
        return response;
    },

    // Update class
    updateClass: async (id: string, data: any) => {
        console.log(id, data);
        
        const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
        return response;
    },

  // Lấy chi tiết lớp học
  getClassDetail: async (id: string) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

    // Delete class
    deleteClass: async (id: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response;
    },

    // Assign teacher to class
    assignTeacher: async (classId: string, data: any) => {
        const response = await apiClient.post(`${BASE_URL}/${classId}/assign-teacher`, data);
        return response;
    },

    // Remove teacher from class
    removeTeacher: async (classId: string, teacherId: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${classId}/teachers/${teacherId}`);
        return response;
    },

    // Get teachers of class
    getTeachersByClass: async (classId: string) => {
        const response = await apiClient.get(`${BASE_URL}/${classId}/teachers`);
        return response;
    },

    // Get class statistics
    getClassStats: async (classId: string) => {
        const response = await apiClient.get(`${BASE_URL}/${classId}/stats`);
        return response;
    },

    // Cập nhật lịch học
    updateClassSchedule: async (id: string, data: any) => {
        const response = await apiClient.patch(`${BASE_URL}/${id}/schedules`, data);
        return response;
    },

    // Get class sessions
    // Tạo tự động buổi học cho lớp
  generateSessions: async (classId: string, data: any) => {
    try {
      const response = await apiClient.post(`${BASE_URL}/${classId}/generate-sessions`, data);
      return response;
    } catch (error) {
      const anyErr: any = error as any;
      const message = anyErr?.response?.message || anyErr?.message || 'Lỗi không xác định';
      const status = anyErr?.response?.status ?? 0;
      throw { status, message };
    }
  },

  getClassSessions: async (classId: string, params?: any) => {
        const response = await apiClient.get(`${BASE_URL}/${classId}/sessions`,  params );
        return response;
    },

};
