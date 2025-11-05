/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

/* =======================
   Token Helper
   ======================= */
const AUTH_TOKEN = 'accessToken';

const encrypt = (data: string): string =>
  CryptoJS.AES.encrypt(data, import.meta.env.VITE_SECRET_KEY_RES).toString();
const decrypt = (cipher: string): string | undefined => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      cipher,
      import.meta.env.VITE_SECRET_KEY_RES,
    );
    return bytes.toString(CryptoJS.enc.Utf8) || undefined;
  } catch {
    return undefined;
  }
};

export const TokenStorage = {
  set: (token: string | null) => {
    if (!token) {
      Cookies.remove(AUTH_TOKEN);
      return;
    }
    // Lưu plain token để gửi trong Authorization header
    Cookies.set(AUTH_TOKEN, token);
  },
  get: (): string | undefined => {
    // Trả về plain token (không decrypt)
    const token = Cookies.get(AUTH_TOKEN);
    return token === null || token === undefined || token === 'undefined' ? undefined : token;
  },
  clear: () => Cookies.remove(AUTH_TOKEN),
};

/* =======================
  Interfaces
   ======================= */
export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponse<T = any> {
  message: string;
  success: any;
  data: T;
  status: number;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  contentType?: string;
  encryptData?: boolean;
}

/* =======================
   Axios Client
   ======================= */
const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_V1 || 'http://localhost:9999/api/v1',
  timeout: 30000,
  withCredentials: true,
});

// Add token và API key vào header
client.interceptors.request.use((config) => {
  const token = TokenStorage.get();
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // API Key cho production
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Xử lý lỗi trả về và auto-refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (err: any) => {
    const originalRequest = err.config;
    const { response } = err;

    const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint));
    
    if (response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return client(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken || refreshToken === 'undefined') {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Attempting to refresh token...');

        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_API_V1 || 'http://localhost:9999/api/v1'}/auth/refresh`,
          {},
          {
            headers: {
              'refresh-token': refreshToken,
            },
          }
        );

        console.log('✅ Refresh token response:', response.data);

        const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
        
        // Lưu access token mới
        TokenStorage.set(accessToken);
        Cookies.set('accessToken', accessToken);
        
        // Lưu refresh token mới (ROTATION)
        if (newRefreshToken) {
          console.log('✅ Updating refresh token (rotation)');
          Cookies.set('refreshToken', newRefreshToken);
        }

        // Cập nhật user data
        if (user) {
          Cookies.set('user', JSON.stringify(user));
        }
        
        processQueue(null, accessToken);
        
        console.log('✅ Token refreshed successfully, retrying original request');
        
        return client(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Refresh token failed:', refreshError);
        
        processQueue(refreshError, null);
        Cookies.remove('user');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        TokenStorage.clear();
        
        // Lưu current URL để redirect về sau
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        }
        
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Trả về đầy đủ thông tin từ response.data để có suggestedName, hint, etc.
    return Promise.reject({
      status: response?.status || 0,
      message: response?.data?.message || 'Lỗi không xác định',
      ...(response?.data || {}), // Merge tất cả fields từ response.data
    });
  },
);

/* =======================
   API Wrapper (có encrypt/decrypt data)
   ======================= */
const send = async <T>(
  method: Method,
  url: string,
  {
    data,
    params,
    timeout,
    contentType = 'application/json',
    headers,
    encryptData = false, // thêm flag encrypt
    ...rest
  }: ApiRequestConfig & { encryptData?: boolean } = {},
): Promise<ApiResponse<T>> => {
  const finalHeaders: Record<string, string> = {};
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        finalHeaders[key] = value;
      }
    });
  }

  // Nếu là FormData thì để axios tự set boundary
  if (!(data instanceof FormData) && contentType) {
    finalHeaders['Content-Type'] = contentType;
  }

  // nếu cần encrypt thì mã hóa data thành string
  let payload = data;
  if (encryptData && data && !(data instanceof FormData)) {
    payload = { payload: encrypt(JSON.stringify(data)) };
  }

  const res = await client({
    method,
    url,
    data: payload,
    params,
    timeout,
    headers: finalHeaders,
    ...rest,
  });

  // nếu server trả về data mã hóa thì tự động giải mã
  let responseData = res.data;
  if (typeof responseData.data === 'string') {
    try {
      const encrypt = JSON.parse(
        decrypt(responseData.data) || responseData.data,
      );
      responseData = {
        ...responseData,
        data: encrypt,
      };
    } catch {
      responseData = res.data;
    }
  }
  return responseData;
};

export const apiClient = {
  get: <T>(url: string, params?: any, options?: ApiRequestConfig) =>
    send<T>('get', url, { params, ...options }),

  post: <T>(url: string, data?: any, options?: ApiRequestConfig) =>
    send<T>('post', url, { data, ...options }),

  put: <T>(url: string, data?: any, options?: ApiRequestConfig) =>
    send<T>('put', url, { data, ...options }),

  patch: <T>(url: string, data?: any, options?: ApiRequestConfig) =>
    send<T>('patch', url, { data, ...options }),

  delete: <T>(url: string, data?: any, options?: ApiRequestConfig) =>
    send<T>('delete', url, { data, ...options }),

  token: TokenStorage,
};
