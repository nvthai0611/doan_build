import { apiClient } from '../../../utils/clientAxios';

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

export interface CreateShowcaseRequest {
  title: string;
  description?: string;
  studentImage: File | string; // File when creating, string URL when updating
  achievement: string;
  featured?: boolean;
  order?: number;
  publishedAt?: string;
}

export interface UpdateShowcaseRequest {
  title?: string;
  description?: string;
  studentImage?: File | string; // File when updating, string URL when keeping old image
  achievement?: string;
  featured?: boolean;
  order?: number;
  publishedAt?: string;
}

export interface ShowcasesResponse {
  success: boolean;
  data: Showcase[];
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const BASE_URL = '/admin-center/showcase-management';

export const showcaseService = {
  /**
   * Lấy danh sách học sinh tiêu biểu
   */
  getShowcases: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
  }): Promise<ShowcasesResponse> => {
    const response = await apiClient.get(BASE_URL, params);
    return response as any;
  },

  /**
   * Lấy thông tin chi tiết học sinh tiêu biểu
   */
  getShowcaseById: async (id: string): Promise<Showcase> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data as any;
  },

  /**
   * Tạo học sinh tiêu biểu mới
   */
  createShowcase: async (data: CreateShowcaseRequest): Promise<Showcase> => {
    const formData = new FormData();
    
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    // Only append file, not URL string (backend expects file for upload)
    if (data.studentImage instanceof File) {
      formData.append('studentImage', data.studentImage);
    }
    formData.append('achievement', data.achievement);
    if (data.featured !== undefined) {
      formData.append('featured', data.featured.toString());
    }
    if (data.order !== undefined) {
      formData.append('order', data.order.toString());
    }
    if (data.publishedAt) {
      formData.append('publishedAt', data.publishedAt);
    }

    const response = await apiClient.post(BASE_URL, formData, {
      contentType: 'multipart/form-data',
    });
    return response.data as any;
  },

  /**
   * Cập nhật học sinh tiêu biểu
   */
  updateShowcase: async (
    id: string,
    data: UpdateShowcaseRequest,
  ): Promise<Showcase> => {
    const formData = new FormData();
    
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    // Only append if it's a File (new image) or if it's a string URL (keeping old image is handled by not sending it)
    if (data.studentImage instanceof File) {
      formData.append('studentImage', data.studentImage);
    }
    if (data.achievement) {
      formData.append('achievement', data.achievement);
    }
    if (data.featured !== undefined) {
      formData.append('featured', data.featured.toString());
    }
    if (data.order !== undefined) {
      formData.append('order', data.order.toString());
    }
    if (data.publishedAt) {
      formData.append('publishedAt', data.publishedAt);
    }

    const response = await apiClient.patch(`${BASE_URL}/${id}`, formData, {
      contentType: 'multipart/form-data',
    });
    return response.data as any;
  },

  /**
   * Xóa học sinh tiêu biểu
   */
  deleteShowcase: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};

