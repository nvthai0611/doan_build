import { ApiResponse } from "../../types/response";
import { apiClient } from "../../utils/clientAxios";


const getClassByTeacherId = async():Promise<ApiResponse<any>> =>{
    try {
        const teacherId = "db080a69-db85-4eac-b43c-e4465a16c4"
        const response = await apiClient.get(`/class-management/teacher/${teacherId}`);
        
        // Kiểm tra status code thành công (200-299)
        if(response.status >= 200 && response.status < 300){
            return response.data as ApiResponse<any>;
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
    getClassByTeacherId
}