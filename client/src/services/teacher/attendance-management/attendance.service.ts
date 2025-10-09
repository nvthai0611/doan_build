import { apiClient } from "../../../utils/clientAxios"

const getListStudentsByRecordId = async (recordId: any): Promise<any> => {
    try {
    const response = await apiClient.get(`/teacher/attendances/${recordId}`);
    
    if (response.status !== 200) {
      throw new Error('Lấy danh sách học sinh thất bại');
    }
    
    return response.data;
  } catch (error: any) {
    // Xử lý các loại error khác nhau
    if (error.response) {
      // Server trả về error response
      throw new Error(error.response.data?.message || 'Lấy danh sách học sinh thất bại');
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error('Không thể kết nối đến server');
    } else {
      // Các lỗi khác
      throw new Error(error.message || 'Đã có lỗi xảy ra');
    }
  }
}

const updateAttendanceStudent = async (sessionId: string, records: any[]): Promise<any> => {
  try {
    const response = await apiClient.put(`/teacher/attendances/${sessionId}`,  records );
    return response.data;
  } catch (error: any) {
    // Xu ly cac loai error khac nhau
    if (error.response) {
      // Server tra ve error response
      throw new Error(error.response.data?.message || 'Cập nhật điểm danh thất bại');
    } else if (error.request) {
      // Request dc gui nhung khong nhan dc response
      throw new Error('Không thể kết nối đến server');
    } else {
      // Cac loi khac
      throw new Error(error.message || 'Đã có lỗi xảy ra');
    }
  }
}

export {
    getListStudentsByRecordId,
    updateAttendanceStudent
}

