/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

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
    if (!token) return Cookies.remove(AUTH_TOKEN, { path: '/' });
    Cookies.set(AUTH_TOKEN, encrypt(token), {
      expires: 7,
      path: '/',
      sameSite: 'strict',
      secure: window.location.protocol === 'https:',
    });
  },
  get: (): string | undefined => {
    const cipher = Cookies.get(AUTH_TOKEN);
    return cipher ? decrypt(cipher) : undefined;
  },
  clear: () => Cookies.remove(AUTH_TOKEN, { path: '/' }),
};

/* =======================
  Interfaces
   ======================= */
export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponse<T = any> {
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
  baseURL: import.meta.env.VITE_SERVER_API_V1 || 'http://localhost:9999',
  timeout: 10000,
  withCredentials: true,
});

// Add token vào header
client.interceptors.request.use((config) => {
  const token = TokenStorage.get();
  if (token) {
    config.headers?.set?.('Authorization', `Bearer ${token}`);
  }
  return config;
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

    if (response?.status === 401 && !originalRequest._retry) {
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_SERVER_API_V1 || 'http://localhost:9999'}/auth/refresh`,
            {},
            {
              headers: {
                'refresh-token': refreshToken,
              },
            }
          );

          const { accessToken } = response.data.data;
          TokenStorage.set(accessToken);
          processQueue(null, accessToken);
          
          return client(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStorage.clear();
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject<ApiError>({
      status: response?.status || 0,
      message: response?.data?.message || 'Lỗi không xác định',
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

  delete: <T>(url: string, params?: any, options?: ApiRequestConfig) =>
    send<T>('delete', url, { params, ...options }),

  token: TokenStorage,
};
