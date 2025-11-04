import { apiClient, ApiResponse } from '../utils/clientAxios';
import { ClassSessions } from '../pages/manager/Teacher-management/types/session';

export interface ClassSessionResponse {
  data: ClassSessions[];
  message: string;
  status: number;
  success: boolean;
}

export const scheduleService = {
  // Lấy theo NGÀY: truyền date ISO (YYYY-MM-DD)
  getClassSessionsByDay: async (
    date: Date,
  ): Promise<ApiResponse<ClassSessionResponse>> => {
    const isoDate = date.toISOString().slice(0, 10);
    const response = await apiClient.get<ClassSessionResponse>(
      `/admin-center/schedule-management/sessions/day`,
      { date: isoDate },
    );
    return response;
  },

  // Lấy theo TUẦN: truyền start và end (YYYY-MM-DD)
  getClassSessionsByWeek: async (
    start: Date,
    end: Date,
  ): Promise<ApiResponse<ClassSessionResponse>> => {
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const response = await apiClient.get<ClassSessionResponse>(
      `/admin-center/schedule-management/sessions/week`,
      { startDate: startStr, endDate: endStr },
    );
    return response;
  },

  // Lấy theo THÁNG: truyền month và year
  getClassSessionsByMonth: async (
    month: number, // 1-12
    year: number,
  ): Promise<ApiResponse<ClassSessionResponse>> => {
    const response = await apiClient.get<ClassSessionResponse>(
      `/admin-center/schedule-management/sessions/month`,
      { month, year },
    );
    return response;
  },
};
