import { apiClient, type ApiResponse } from '../../../utils/clientAxios';

class SettingsService {
  async getAll(params?: any) {
    const res = await apiClient.get('/admin-center/settings-management', {
      params,
    });
    return res.data;
  }

  async getByKey(key: string) {
    const res = await apiClient.get(`/admin-center/settings-management/${key}`);
    return res.data;
  }

  async upsert(payload: any) {
    const res = await apiClient.put(
      '/admin-center/settings-management',
      payload,
    );
    return res.data;
  }
}

export const settingsService = new SettingsService();
