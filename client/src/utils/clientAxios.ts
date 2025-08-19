import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import CryptoJS from "crypto-js";

const AUTH_TOKEN: any = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "user_data",
};
// Khởi tạo axios instance
const client = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_V1 || "",
  timeout: 10000,
  withCredentials: true, //quan trọng để gửi cookie cross-origin
});

const ENCRYPTION_KEY: string =
  import.meta.env.VITE_ENCRYPTION_KEY || "your-secret-key-32-bytes-long!!!";
const TOKEN_KEY: string = AUTH_TOKEN.ACCESS_TOKEN;

// --- COOKIE UTILITIES ---
type CookieOptions = {
  expires?: string;
  path?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none" | string;
  domain?: string;
};

const setCookie = (
  name: string,
  value: string,
  days: number = 7,
  options: CookieOptions = {}
) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const defaultOptions: CookieOptions = {
    expires: expires.toUTCString(),
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  };

  const cookieOptions = { ...defaultOptions, ...options };
  let cookieString = `${name}=${value}`;
  Object.entries(cookieOptions).forEach(([key, val]) => {
    if (val === true) {
      cookieString += `; ${key}`;
    } else if (val !== false && val !== null && val !== undefined) {
      cookieString += `; ${key}=${val}`;
    }
  });
  document.cookie = cookieString;
};

const getCookie = (name: string): string | null => {
  const cookies = document.cookie
    .split("; ")
    .reduce<Record<string, string>>((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});
  return cookies[name] || null;
};

const removeCookie = (name: string, path: string = "/") => {
  const isLocalhost = window.location.hostname === "localhost";

  // Xóa cookie không có domain
  document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=None; Secure;`;

  // Nếu không phải localhost thì xóa thêm với 2 domain
  if (!isLocalhost) {
    const baseDomain = window.location.hostname.replace(/^www\./, "");

    // Xóa cookie với domain không có dấu chấm (haeispa.online)
    document.cookie = `${name}=; Path=${path}; Domain=${baseDomain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=None; Secure;`;

    // Xóa cookie với domain có dấu chấm (.haeispa.online)
    document.cookie = `${name}=; Path=${path}; Domain=.${baseDomain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=None; Secure;`;
  }
};

// --- TOKEN HANDLING ---
export const setToken = (token: string | null) => {
  if (token) {
    // Lưu vào cookie (primary)
    setCookie(TOKEN_KEY, token, 7); // 7 ngày
  } else {
    // Xóa khỏi cả localStorage và cookie
    removeCookie(TOKEN_KEY);
  }
};

// Cập nhật function để lấy token từ cookie trước
const getToken = (): string | null => {
  // Ưu tiên cookie trước
  const cookieToken = getCookie(TOKEN_KEY);
  if (cookieToken) {
    return cookieToken;
  }
  // Fallback to localStorage
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) {
    // Sync cookie với localStorage
    setCookie(TOKEN_KEY, localToken, 7);
    return localToken;
  }

  return null;
};

export const getTokenFromCookie = (): string | null => {
  return getCookie(TOKEN_KEY);
};

export const initSession = (): void => {
  const token = getToken();
  if (token) {
    console.log("🔄 Session initialized with token");
  } else {
    console.log("❌ No token found for session");
  }
};

// --- BASE URL HANDLING ---
export const setBaseUrl = (url: string) => {
  if (typeof url === "string" && url.trim()) {
    client.defaults.baseURL = url;
  }
};

// --- ENCRYPTION & DECRYPTION ---
const encryptData = (data: any): { encryptedData: string } => {
  try {
    if (!data) return data;
    const dataString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      dataString,
      ENCRYPTION_KEY
    ).toString();
    return { encryptedData: encrypted };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Không thể mã hóa dữ liệu");
  }
};

const decryptData = (encryptedData: string): any => {
  try {
    if (!encryptedData) return encryptedData;
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) throw new Error("Decryption failed");
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Không thể giải mã dữ liệu");
  }
};

// --- INTERCEPTORS ---
client.interceptors.request.use((config: any) => {
  // Lấy token từ cookie hoặc localStorage
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Mã hóa dữ liệu nếu cần
  if (
    config.encrypt &&
    config.data &&
    ["post", "put", "patch"].includes(config.method)
  ) {
    config.data = encryptData(config.data);
    config.headers["X-Encrypted"] = "true";
  }
  return config;
});

client.interceptors.response.use(
  (res: AxiosResponse) => {
    // Giải mã dữ liệu nếu server trả về dữ liệu mã hóa
    if (res.headers["x-encrypted"] === "true" && res.data.encryptedData) {
      res.data = decryptData(res.data.encryptedData);
    }
    return res;
  },
  (err: any) => {
    const { response } = err;
    if (response?.status === 401) {
      console.warn("🚨 Unauthorized - Token expired or invalid");
      // Xóa token khỏi cả localStorage và cookie
      setToken(null);
      removeCookie(TOKEN_KEY);
      removeCookie("user_data");
      //reload lại trang
      window.location.reload();
      return Promise.reject({
        status: 401,
        message: "Token hết hạn hoặc không hợp lệ",
        error: err,
      });
    }
    if (response?.status === 400) {
      return Promise.reject({
        status: 400,
        message: response.data?.message || "Dữ liệu không hợp lệ",
        error: err,
      });
    }
    if (response?.status >= 500) {
      return Promise.reject({
        status: response.status,
        message: response.data?.message || "Lỗi máy chủ, vui lòng thử lại",
        error: err,
      });
    }
    return Promise.reject({
      status: response?.status || 0,
      message: response?.data?.message || "Lỗi không xác định",
      error: err,
    });
  }
);

// --- API REQUEST WRAPPER ---
type SendOptions = {
  data?: any;
  params?: any;
  timeout?: number | null;
  contentType?: string;
  encrypt?: boolean;
};

const send = async (
  method: Method,
  url: string,
  {
    data = null,
    params = null,
    timeout = null,
    contentType = "application/json",
    encrypt = false,
  }: SendOptions = {}
): Promise<any> => {
  const config: AxiosRequestConfig & { encrypt?: boolean } = {
    method,
    url,
    encrypt,
  };

  if (data && ["post", "put", "patch"].includes(method.toLowerCase())) {
    if (contentType === "application/json") {
      config.data = encrypt ? data : data;
      config.headers = { "Content-Type": "application/json" };
    } else if (contentType === "multipart/form-data") {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          data[key].forEach((item: any) => formData.append(key, item));
        } else {
          formData.append(key, data[key]);
        }
      });
      config.data = formData;
      config.headers = { "Content-Type": "multipart/form-data" };
    } else if (contentType === "application/x-www-form-urlencoded") {
      const urlEncodedData = new URLSearchParams();
      Object.keys(data).forEach((key) => {
        urlEncodedData.append(key, data[key]);
      });
      config.data = urlEncodedData;
      config.headers = { "Content-Type": "application/x-www-form-urlencoded" };
    } else {
      config.data = data;
      config.headers = { "Content-Type": contentType };
    }
  }

  if (params && ["get", "delete"].includes(method.toLowerCase())) {
    config.params = params;
  }

  if (timeout) {
    config.timeout = timeout;
  }

  const response = await client(config);
  return response.data;
};

// --- API CLIENT PUBLIC INTERFACE ---
export const apiClient = {
  get: (
    url: string,
    params?: any,
    timeout?: number,
    contentType: string = "application/json",
    encrypt: boolean = false
  ) => send("get", url, { params, timeout, contentType, encrypt }),
  post: (
    url: string,
    data?: any,
    timeout?: number,
    contentType: string = "application/json",
    encrypt: boolean = false
  ) => send("post", url, { data, timeout, contentType, encrypt }),
  put: (
    url: string,
    data?: any,
    timeout?: number,
    contentType: string = "application/json",
    encrypt: boolean = false
  ) => send("put", url, { data, timeout, contentType, encrypt }),
  patch: (
    url: string,
    data?: any,
    timeout?: number,
    contentType: string = "application/json",
    encrypt: boolean = false
  ) => send("patch", url, { data, timeout, contentType, encrypt }),
  delete: (
    url: string,
    params?: any,
    timeout?: number,
    contentType: string = "application/json",
    encrypt: boolean = false
  ) => send("delete", url, { params, timeout, contentType, encrypt }),

  // Expose utilities
  setToken,
  setBaseUrl,
  initSession,
  getTokenFromCookie,
  setCookie,
  getCookie,
  removeCookie,
};
