import { apiClient } from '../../utils/clientAxios';

export const scheduleConflictService = {
  /**
   * Lấy danh sách các buổi học bị trùng phòng
   */
  getRoomConflicts: async (params?: {
    startDate?: string;
    endDate?: string;
    roomId?: string;
  }) => {
    const response = await apiClient.get(
      '/admin-center/schedule/room-conflicts',
      params,
    );
    return response;
  },

  /**
   * Lấy lịch rảnh của giáo viên
   */
  getTeacherAvailableSlots: async (
    teacherId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const response = await apiClient.get(
      `/admin-center/schedule/teacher-available-slots/${teacherId}`,
      params,
    );
    return response;
  },

  /**
   * Thêm buổi học mới
   */
  addSession: async (data: {
    classId: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    teacherId?: string;
    roomId?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post(
      '/admin-center/schedule/add-session',
      data,
    );
    return response;
  },
};
