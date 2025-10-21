import {apiClient} from '../../../utils/clientAxios';

const BASE_URL = '/admin-center/enrollments';

export const enrollmentService = {
    // Enroll single student
    enrollStudent: async (data: any) => {
        const response = await apiClient.post(BASE_URL, data);
        return response.data;
    },

    // Bulk enroll students
    bulkEnroll: async (data: any) => {
        const response = await apiClient.post(`${BASE_URL}/bulk`, data);
        return response.data;
    },

    // Get all enrollments with filters
    getEnrollments: async (params?: any) => {
        const response = await apiClient.get(BASE_URL, { params });
        return response.data;
    },

    // Get students by class
    getStudentsByClass: async (classId: string, params?: any) => {
        const response = await apiClient.get(`${BASE_URL}/class/${classId}`, params);
        console.log(response);
        
        return response;
    },

    // Get enrollments by student
    getEnrollmentsByStudent: async (studentId: string) => {
        const response = await apiClient.get(`${BASE_URL}/student/${studentId}`);
        return response.data;
    },

    // Check class capacity
    checkCapacity: async (classId: string) => {
        const response = await apiClient.get(`${BASE_URL}/class/${classId}/capacity`);
        return response.data;
    },

    // Update enrollment status
    updateStatus: async (enrollmentId: string, data: any) => {
        const response = await apiClient.put(`${BASE_URL}/${enrollmentId}/status`, data);
        return response.data;
    },

    // Transfer student to another class
    transferStudent: async (enrollmentId: string, data: any) => {
        const response = await apiClient.post(`${BASE_URL}/${enrollmentId}/transfer`, data);
        return response.data;
    },

    // Delete enrollment
    deleteEnrollment: async (enrollmentId: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${enrollmentId}`);
        return response.data;
    }
};

