import { apiClient } from "../../../utils/clientAxios";

interface CronJobFilters {
    jobType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

/**
 * Trigger cron job tạo hóa đơn học sinh thủ công
 */
const triggerBillGeneration = async () => {
    console.warn('Kích hoạt tạo Hóa đơn HỌC SINH bằng tay!');
    const response = await apiClient.post('/admin-center/triggers/run-bill-generation');
    return response.data;
}

/**
 * Trigger cron job tạo bảng lương giáo viên thủ công
 */
const triggerPayrollGeneration = async () => {
    console.warn('Kích hoạt tạo Bảng Lương GIÁO VIÊN bằng tay!');
    const response = await apiClient.post('/admin-center/triggers/run-payroll-generation');
    return response.data;
}

/**
 * List tất cả cron job executions với filters
 * Mỗi job type lấy execution gần nhất
 */
const listCronJobExecutions = async (filters?: CronJobFilters) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.jobType) {
        queryParams.append('jobType', filters.jobType);
    }
    
    if (filters?.status) {
        queryParams.append('status', filters.status);
    }
    
    if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
    }
    
    if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
    }
    
    if (filters?.page) {
        queryParams.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = queryString 
        ? `/admin-center/triggers/executions?${queryString}`
        : '/admin-center/triggers/executions';
    
    const response = await apiClient.get(url);
    return response.data;
}

/**
 * Lấy execution mới nhất của mỗi job type
 */
const getLatestExecutions = async () => {
    const response = await apiClient.get('/admin-center/triggers/executions/latest');
    return response.data;
}

/**
 * Lấy danh sách tất cả job types có trong hệ thống
 */
const getJobTypes = async () => {
    const response = await apiClient.get('/admin-center/triggers/executions/types');
    return response.data;
}

/**
 * Xem lịch sử chạy của một job type cụ thể
 */
const getCronJobHistory = async (
    jobType: string,
    filters?: Omit<CronJobFilters, 'jobType'>
) => {
    const response = await apiClient.get(
        `/admin-center/triggers/executions/history/${jobType}`, 
        { params: filters }
    );
    return response.data;
}

/**
 * Lấy thống kê chi tiết của một job type
 */
const getCronJobStats = async (jobType: string, days?: number) => {
    const response = await apiClient.get(
        `/admin-center/triggers/executions/stats/${jobType}`, 
        { params: { days } }
    );
    return response.data;
}

/**
 * Xem chi tiết một execution cụ thể
 */
const getCronJobDetails = async (id: string) => {
    const response = await apiClient.get(`/admin-center/triggers/executions/${id}`);
    return response.data;
}

/**
 * Retry lại một cron job đã failed
 */
const retryCronJob = async (id: string) => {
    const response = await apiClient.post(`/admin-center/triggers/executions/${id}/retry`);
    return response.data;
}

export {
    triggerBillGeneration,
    triggerPayrollGeneration,
    listCronJobExecutions,
    getLatestExecutions,
    getJobTypes,
    getCronJobHistory,
    getCronJobStats,
    getCronJobDetails,
    retryCronJob
}