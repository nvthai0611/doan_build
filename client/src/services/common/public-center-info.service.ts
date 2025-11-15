import { apiClient } from '../../utils/clientAxios';

export interface CenterInfo {
  id: string;
  key: string;
  group: string;
  value?: {
    centerInfo?: {
      name?: string;
      logo?: string;
      banner?: string;
      description?: string;
      slogan?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
      website?: string;
      facebook?: string;
      youtube?: string;
      tiktok?: string;
      workingHours?: Array<{
        fromDay: string;
        toDay: string;
        open: string;
        close: string;
      }>;
    };
    address?: {
      street?: string;
      province?: string;
      district?: string;
      detail?: string;
    };
  };
  description?: string;
  updatedAt?: string;
}

export interface CenterInfoResponse {
  success: boolean;
  data: CenterInfo | null;
  message: string;
}

class PublicCenterInfoService {
  /**
   * Lấy thông tin trung tâm (public API)
   */
  async getCenterInfo(): Promise<CenterInfoResponse> {
    try {
      const response = await apiClient.get('/shared/public/center-info', {});
      return response as any;
    } catch (error: any) {
      console.error('Error fetching center info:', error);
      throw error;
    }
  }
}

export const publicCenterInfoService = new PublicCenterInfoService();

