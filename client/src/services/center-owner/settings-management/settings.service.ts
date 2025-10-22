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

  // Holidays
  async getHolidays(year?: string) {
    const res = await apiClient.get('/admin-center/holidays-setting', { year });
    return res.data;
  }

  async createHoliday(payload: { startDate: string; endDate: string; note?: string; isActive?: boolean; }) {
    const res = await apiClient.post('/admin-center/holidays-setting', payload);
    return res.data;
  }

  async updateHoliday(id: string, payload: { startDate?: string; endDate?: string; note?: string; isActive?: boolean; }) {
    const res = await apiClient.put(`/admin-center/holidays-setting/${id}`, payload);
    return res.data;
  }

  async deleteHoliday(id: string) {
    const res = await apiClient.delete(`/admin-center/holidays-setting/${id}`);
    return res.data;
  }

  async applyHoliday(id: string) {
    const res = await apiClient.post(`/admin-center/holidays-setting/${id}/apply`, {});
    return res.data;
  }
}

export const settingsService = new SettingsService();
