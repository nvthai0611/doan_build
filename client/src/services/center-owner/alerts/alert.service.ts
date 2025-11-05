import { apiClient } from '../../common/api/api-client';

export interface Alert {
  id: string;
  alertType: string;
  title: string;
  message: string;
  severity: string;
  payload: any;
  isRead: boolean;
  processed: boolean;
  triggeredAt: string;
  processedAt?: string;
}

export interface AlertsResponse {
  data: Alert[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
  message: string;
}

export interface UnreadCountResponse {
  data: {
    count: number;
  };
  message: string;
}

export class AlertService {
  private static readonly BASE_URL = '/admin-center/alerts';

  static async getAlerts(params?: any): Promise<any> {
    try {
      const response = await apiClient.get<AlertsResponse>(
        this.BASE_URL,
        params
      );
      return response as any;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<any> {
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        `${this.BASE_URL}/unread-count`
      );
      return response;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  static async markAsRead(id: string): Promise<any> {
    try {
      const response = await apiClient.patch(`${this.BASE_URL}/${id}`, {
        isRead: true,
      });
      return response;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  static async markAsProcessed(id: string): Promise<any> {
    try {
      const response = await apiClient.patch(`${this.BASE_URL}/${id}`, {
        processed: true,
      });
      return response;
    } catch (error) {
      console.error('Error marking alert as processed:', error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<any> {
    try {
      const response = await apiClient.patch(
        `${this.BASE_URL}/mark-all-read`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  static async deleteAlert(id: string): Promise<any> {
    try {
      const response = await apiClient.delete(`${this.BASE_URL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
}

export const alertService = AlertService;

