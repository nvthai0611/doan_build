import { apiClient } from '../../../utils/clientAxios';
import { 
  ScheduleChangeResponse, 
  ScheduleChangeFilters, 
  ScheduleChangeListResponse 
} from './schedule-change.types';

export class ScheduleChangeService {
  async getMyScheduleChanges(filters?: ScheduleChangeFilters): Promise<ScheduleChangeListResponse> {
    try {
      const response = await apiClient.get('/teacher/schedule-changes/my-requests', filters || {});
      return response.data as any;
    } catch (error) {
      console.error('Error fetching schedule changes:', error);
      throw error;
    }
  }

  async getScheduleChangeDetail(id: string): Promise<ScheduleChangeResponse> {
    try {
      const response = await apiClient.get(`/teacher/schedule-changes/${id}`);
      return response.data as any;
    } catch (error) {
      console.error('Error fetching schedule change detail:', error);
      throw error;
    }
  }

  async cancelScheduleChange(id: string): Promise<ScheduleChangeResponse> {
    try {
      const response = await apiClient.patch(`/teacher/schedule-changes/${id}/cancel`);
      return response.data as any;
    } catch (error) {
      console.error('Error cancelling schedule change:', error);
      throw error;
    }
  }
}

export const scheduleChangeService = new ScheduleChangeService();
