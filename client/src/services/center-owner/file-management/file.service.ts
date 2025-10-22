import { apiClient } from '../../../utils/clientAxios';
import type {
  Material,
  CenterClass,
  UploadMaterialParams,
  GetMaterialsParams,
  MaterialsResponse,
} from './file.types';

class CenterOwnerFileManagementService {

  /**
   * Lấy danh sách tài liệu
   */
  async getMaterials(params: GetMaterialsParams = {}): Promise<MaterialsResponse> {
    try {
      const response = await apiClient.get<{ data: MaterialsResponse }>(
        '/admin-center/file-management/materials',
        params
      );

      const payload: any = response as any;
      
      // Backend returns: { success: true, data: { data: [...], meta: {...} } }
      // After interceptor: { data: [...], meta: {...} }
      const serverData = payload?.data ?? payload;
      
      // If serverData is already MaterialsResponse format, return it
      if (serverData && 'data' in serverData && 'meta' in serverData) {
        return serverData as MaterialsResponse;
      }
      
      // If serverData is just an array, wrap it
      if (Array.isArray(serverData)) {
        return {
          data: serverData,
          meta: {
            total: serverData.length,
            page: 1,
            limit: serverData.length,
            totalPages: 1
          }
        };
      }
      
      return serverData as MaterialsResponse;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp học của trung tâm
   */
  async getCenterClasses(): Promise<CenterClass[]> {
    try {
      const response = await apiClient.get<{ data: CenterClass[] }>(
        '/admin-center/file-management/classes'
      );

      const payload: any = response as any;
      const serverData = payload?.data?.data ?? payload?.data;
      return serverData as CenterClass[];
    } catch (error) {
      console.error('Error fetching center classes:', error);
      throw error;
    }
  }

  /**
   * Xóa tài liệu
   */
  async deleteMaterial(materialId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ data: { message: string } }>(
        `/admin-center/file-management/materials/${materialId}`
      );

      const payload: any = response as any;
      const serverData = payload?.data?.data ?? payload?.data;
      return serverData as { message: string };
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  /**
   * Tăng số lượt tải xuống
   */
  async incrementDownload(materialId: number): Promise<void> {
    try {
      await apiClient.post(
        `/admin-center/file-management/materials/${materialId}/download`,
        {}
      );
    } catch (error) {
      console.error('Error incrementing download count:', error);
      throw error;
    }
  }
}

export const centerOwnerFileManagementService = new CenterOwnerFileManagementService();

