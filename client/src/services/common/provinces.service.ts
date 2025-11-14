/**
 * Service để fetch danh sách tỉnh thành, quận huyện, phường xã từ API
 * https://provinces.open-api.vn/
 */

export interface Province {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  phone_code: number;
  districts?: District[];
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards?: Ward[];
}

export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

const API_BASE_URL = 'https://provinces.open-api.vn/api/v1';

class ProvincesService {
  /**
   * Lấy danh sách tỉnh thành và quận huyện (depth=2)
   */
  async getProvincesWithDistricts(): Promise<Province[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      return data as Province[];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách quận huyện theo mã tỉnh thành
   */
  async getDistrictsByProvince(provinceCode: number): Promise<District[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách phường xã theo mã quận huyện
   */
  async getWardsByDistrict(districtCode: number): Promise<Ward[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }
}

export const provincesService = new ProvincesService();

