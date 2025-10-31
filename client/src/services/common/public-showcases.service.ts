import { apiClient } from '../../utils/clientAxios';

export interface Showcase {
  id: string;
  title: string;
  description: string | null;
  studentImage: string;
  achievement: string;
  featured: boolean;
  order: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcasesResponse {
  success: boolean;
  data: Showcase[];
  message: string;
}

class PublicShowcasesService {
  /**
   * Lấy danh sách học sinh tiêu biểu (public API)
   */
  async getShowcases(params?: { featured?: boolean }): Promise<ShowcasesResponse> {
    try {
      const queryParams: any = {};
      if (params?.featured !== undefined) {
        queryParams.featured = params.featured.toString();
      }

      const response = await apiClient.get('/shared/public/showcases', queryParams);

      return response as any;
    } catch (error: any) {
      console.error('Error fetching showcases:', error);
      throw error;
    }
  }
}

export const publicShowcasesService = new PublicShowcasesService();