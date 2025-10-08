import { ApiResponse } from "../../types/response";
import { apiClient } from "../../utils/clientAxios";


const getClassByTeacherId = async(
    status: string, 
    page: number = 1, 
    limit: number = 10,
    searchQuery?: string,
    academicYear?: string // Thêm tham số
): Promise<ApiResponse<any>> => {
    try {
        // Xây dựng query string thủ công để tránh vấn đề serialization
        const queryParams = new URLSearchParams();
        // queryParams.append('status', 'all')
        if (status && status !== 'undefined') {
            queryParams.append('status', status);
        }
        
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        // Thêm các tham số filter và search
        if (searchQuery && searchQuery.trim() !== '') {
            queryParams.append('search', searchQuery.trim());
        }

        if (academicYear) {
            queryParams.append('academicYear', academicYear);
        }
        

        
        const url = `/teacher/class-management/classes?${queryParams.toString()}`;
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
        const response = await apiClient.get(`teacher/class-management/classes/count-by-status`);

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

const getClassDetail = async (teacherClassAssignmentId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`teacher/class-management/classes/details?teacherClassAssignmentId=${teacherClassAssignmentId}`);
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

// Cập nhật hàm fetchClassData
const fetchClassData = async ( 
  { status, page, limit, searchQuery, academicYear }: { 
    status: string,
    page: number,
    limit: number,
    searchQuery?: string,
    academicYear?: string // Thêm tham số academicYear
  }
) => {
  const res = await getClassByTeacherId(status, page, limit, searchQuery, academicYear);
  return res;
};

export {
    getClassByTeacherId,
    getCountByStatus,
    getClassDetail,
    fetchClassData
}