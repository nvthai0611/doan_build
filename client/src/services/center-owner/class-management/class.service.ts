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
        
        const response = await apiClient.patch(`${BASE_URL}/${id}`, data.schedules);
        return response;
    },

    updateClassSchedule: async (id: string, data: any) => {
        const response = await apiClient.patch(`${BASE_URL}/${id}/schedules`, data);
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
    }
};
