import {apiClient} from '../../../utils/clientAxios';

const BASE_URL = '/admin-center/classes';

export const classService = {
    // Get all classes with filters
    getClasses: async (params?: any) => {
        const response = await apiClient.get(BASE_URL, { params });
        return response.data;
    },

    // Get single class by ID
    getClassById: async (id: string) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Create new class
    createClass: async (data: any) => {
        const response = await apiClient.post(BASE_URL, data);
        return response.data;
    },

    // Update class
    updateClass: async (id: string, data: any) => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    // Delete class
    deleteClass: async (id: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Assign teacher to class
    assignTeacher: async (classId: string, data: any) => {
        const response = await apiClient.post(`${BASE_URL}/${classId}/assign-teacher`, data);
        return response.data;
    },

    // Remove teacher from class
    removeTeacher: async (classId: string, teacherId: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${classId}/teachers/${teacherId}`);
        return response.data;
    },

    // Get teachers of class
    getTeachersByClass: async (classId: string) => {
        const response = await apiClient.get(`${BASE_URL}/${classId}/teachers`);
        return response.data;
    },

    // Get class statistics
    getClassStats: async (classId: string) => {
        const response = await apiClient.get(`${BASE_URL}/${classId}/stats`);
        return response.data;
    }
};
