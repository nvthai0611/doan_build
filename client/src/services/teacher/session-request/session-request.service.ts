import { apiClient } from '../../../utils/clientAxios';
import { 
  CreateSessionRequestDto, 
  SessionRequestResponse, 
  SessionRequestFilters, 
  SessionRequestListResponse 
} from './session-request.types';

export class SessionRequestService {
  async createSessionRequest(data: CreateSessionRequestDto): Promise<SessionRequestResponse> {
    try {
      const response = await apiClient.post('/teacher/session-request/create', data);
      return response.data as any;
    } catch (error) {
      console.error('Error creating session request:', error);
      throw error;
    }
  }

  async getMySessionRequests(filters?: SessionRequestFilters): Promise<SessionRequestListResponse> {
    try {
      const response = await apiClient.get('/teacher/session-request/my-requests', filters || {});
      return response.data as any;
    } catch (error) {
      console.error('Error fetching session requests:', error);
      throw error;
    }
  }

  async getSessionRequestDetail(id: string): Promise<SessionRequestResponse> {
    try {
      const response = await apiClient.get(`/teacher/session-request/${id}`);
      return response.data as any;
    } catch (error) {
      console.error('Error fetching session request detail:', error);
      throw error;
    }
  }

  async cancelSessionRequest(id: string): Promise<SessionRequestResponse> {
    try {
      const response = await apiClient.patch(`/teacher/session-request/${id}/cancel`);
      return response.data as any;
    } catch (error) {
      console.error('Error cancelling session request:', error);
      throw error;
    }
  }
}

export const sessionRequestService = new SessionRequestService();
