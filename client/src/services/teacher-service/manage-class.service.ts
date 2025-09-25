import { ApiResponse } from "../../types/response";
import { apiClient } from "../../utils/clientAxios";


const getClassByTeacherId = async(
    teacherId: string,
    status: string, 
    page: number = 1, 
    limit: number = 10,
    searchQuery?: string
): Promise<ApiResponse<any>> => {
    try {
        console.log('Service - Params before sending:', { status, page, limit, searchQuery });
        
        // Xây dựng query string thủ công để tránh vấn đề serialization
        const queryParams = new URLSearchParams();
        
        if (status && status !== 'undefined' && status !== 'all') {
            queryParams.append('status', status);
        }
        
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        // Thêm các tham số filter và search
        if (searchQuery && searchQuery.trim() !== '') {
            queryParams.append('search', searchQuery.trim());
        }
        

        
        const url = `/class-management/teacher/${teacherId}?${queryParams.toString()}`;
        console.log('Service - Final URL:', url);
        
        const response = await apiClient.get(url);
        
        console.log('Service - Response status:', response.status);
        
        // Kiểm tra status code thành công (200-299)
        if(response.status >= 200 && response.status < 300){
            return response as ApiResponse<any>;
        } else {
            const errorData: ApiResponse<any> = response.data as ApiResponse<any>;
            throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


const getCountByStatus = async(teacherId: string): Promise<ApiResponse<any>> => {
    try {
        const response = await apiClient.get(`/class-management/teacher/${teacherId}/count-by-status`);

        // Kiểm tra status code thành công (200-299)
        if (response.status >= 200 && response.status < 300) {
            return response as ApiResponse<any>;
        } else {
            const errorData: ApiResponse<any> = response.data as ApiResponse<any>;
            throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export {
    getClassByTeacherId,
    getCountByStatus
}