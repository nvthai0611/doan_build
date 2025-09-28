import { ApiResponse } from "../../types/response";
import { apiClient } from "../../utils/clientAxios";

const  teacherId = "601a2029-dc56-4c2a-bc8d-440526cad471"; // Có thể lấy từ context hoặc props

const getClassByTeacherId = async(
    status: string, 
    page: number = 1, 
    limit: number = 10,
    searchQuery?: string
): Promise<ApiResponse<any>> => {
    try {
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
        const response = await apiClient.get(url);

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


const getCountByStatus = async(): Promise<ApiResponse<any>> => {
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

const getClassDetail = async (classId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`class-management/class/details?classId=${classId}`);
    if (response.status >= 200 && response.status < 300) {
      return response.data; // Trả về data gốc (any)
    } else {
        const errorData = response.data as any
      throw new Error(errorData.message || 'Lỗi khi lấy dữ liệu');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export {
    getClassByTeacherId,
    getCountByStatus,
    getClassDetail
}