import { ApiResponse } from "../../types/response";
import { apiClient } from "../../utils/clientAxios";


const getClassByTeacherId = async(status:string):Promise<ApiResponse<any>> =>{
    try {
        const teacherId = "20536092-fcc7-4beb-82d4-acbdc86fe320"
        const response = await apiClient.get(`/class-management/teacher/${teacherId}?status=${status}`, {
            timeout: 5000, // 5 second timeout
        });
        
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
        const response = await apiClient.get(`/class-management/teacher/${teacherId}/count`, {
            timeout: 5000, // 5 second timeout
        });

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