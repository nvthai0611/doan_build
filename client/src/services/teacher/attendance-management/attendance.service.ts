import { apiClient } from '../../../utils/clientAxios'

interface AttendanceRecord {
  studentId: string
  status: 'present' | 'absent' | 'excused' | 'late'
  note?: string
}

interface LeaveRequest {
  id: string
  studentId: string
  status: string
  startDate: string
  endDate: string
  student: {
    id: string
    user: {
      fullName: string
    }
  }
  createdByUser: {
    fullName: string
  }
}

interface AttendanceResponse {
  data: any
  message: string
}

const getListStudentsByRecordId = async (recordId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/teacher/attendances/${recordId}`)

    if (response.status !== 200) {
      throw new Error('Lấy danh sách học sinh thất bại')
    }

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lấy danh sách học sinh thất bại')
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server')
    } else {
      throw new Error(error.message || 'Đã có lỗi xảy ra')
    }
  }
}

const getListStudentBySessionId = async (sessionId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/teacher/attendances/${sessionId}/students`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lấy danh sách học sinh thất bại')
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server')
    } else {
      throw new Error(error.message || 'Đã có lỗi xảy ra')
    }
  }
}

/**
 * Lấy danh sách đơn xin nghỉ trong ngày học
 * @param sessionId - ID của buổi học
 * @returns Danh sách đơn xin nghỉ pending
 */
const getLeaveRequestsBySessionId = async (sessionId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`/teacher/attendances/${sessionId}/leave-requests`)
    return response.data as any[]
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Lấy danh sách đơn xin nghỉ thất bại')
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server')
    } else {
      throw new Error(error.message || 'Đã có lỗi xảy ra')
    }
  }
}

/**
 * Cập nhật điểm danh học sinh
 * Nếu status là 'excused', đơn xin nghỉ sẽ được tự động duyệt
 * @param sessionId - ID của buổi học
 * @param records - Danh sách bản ghi điểm danh
 * @returns Kết quả cập nhật
 */
const updateAttendanceStudent = async (
  sessionId: string,
  records: AttendanceRecord[]
): Promise<any> => {
  try {
    const response = await apiClient.put(`/teacher/attendances/${sessionId}`, records)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Cập nhật điểm danh thất bại')
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server')
    } else {
      throw new Error(error.message || 'Đã có lỗi xảy ra')
    }
  }
}

/**
 * Gửi email thông báo vắng mặt cho phụ huynh
 * @param sessionId - ID của buổi học
 * @param studentIds - Danh sách ID học sinh vắng mặt
 * @returns Kết quả gửi email
 */
const sendEmailNotificationAbsence = async (
  sessionId: string,
  studentIds: string[]
): Promise<any> => {
  try {
    const response = await apiClient.post(
      `/teacher/attendances/${sessionId}/send-absent-notifications`,
      { studentIds }
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Gửi thông báo vắng mặt thất bại')
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server')
    } else {
      throw new Error(error.message || 'Đã có lỗi xảy ra')
    }
  }
}

export {
  getListStudentsByRecordId,
  updateAttendanceStudent,
  getListStudentBySessionId,
  getLeaveRequestsBySessionId,
  sendEmailNotificationAbsence,
  type AttendanceRecord,
  type LeaveRequest,
  type AttendanceResponse,
}

