import { apiClient } from '../../../utils/clientAxios';
import type {
  Material,
  TeacherClass,
  UploadMaterialParams,
  GetMaterialsParams,
  MaterialsResponse,
} from './file.types';

class TeacherFileManagementService {
  /**
   * Upload tài liệu
   */
  async uploadMaterial(params: UploadMaterialParams): Promise<Material> {
    const formData = new FormData();
    formData.append('classId', params.classId);
    formData.append('title', params.title);
    formData.append('category', params.category);
    if (params.description) {
      formData.append('description', params.description);
    }
    formData.append('file', params.file);

    const response = await apiClient.post<{ data: Material }>(
      '/teacher/file-management/upload',
      formData,
      {
        contentType: 'multipart/form-data',
      }
    );

    const payload: any = response as any;
    const serverData = payload?.data?.data ?? payload?.data;
    return serverData as Material;
  }

  /**
   * Lấy danh sách tài liệu
   */
  async getMaterials(params: GetMaterialsParams = {}): Promise<MaterialsResponse> {
    const response = await apiClient.get<{ data: MaterialsResponse }>(
      '/teacher/file-management/materials',
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
  }

  /**
   * Lấy danh sách lớp học của giáo viên
   */
  async getTeacherClasses(): Promise<TeacherClass[]> {
    const response = await apiClient.get<{ data: TeacherClass[] }>(
      '/teacher/file-management/classes'
    );

    const payload: any = response as any;
    const serverData = payload?.data?.data ?? payload?.data;
    return serverData as TeacherClass[];
  }

  /**
   * Xóa tài liệu
   */
  async deleteMaterial(materialId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ data: { message: string } }>(
      `/teacher/file-management/materials/${materialId}`
    );

    const payload: any = response as any;
    const serverData = payload?.data?.data ?? payload?.data;
    return serverData as { message: string };
  }

  /**
   * Tăng số lượt tải xuống
   */
  async incrementDownload(materialId: number): Promise<void> {
    await apiClient.post(
      `/teacher/file-management/materials/${materialId}/download`,
      {}
    );
  }
}

export const teacherFileManagementService = new TeacherFileManagementService();
