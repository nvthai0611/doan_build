type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type SendResult<T = unknown> = {
  response: Response;
  data: T;
};

export const client = {
  serverApi: import.meta.env.VITE_SERVER_API as string | undefined,
  token: null as string | null,
  setUrl: function (url: string) {
    this.serverApi = url;
  },
  setToken: function (token: string | null) {
    this.token = token;
  },
  send: async function <T = unknown>(url: string, method: HttpMethod = "GET", body: unknown = null): Promise<SendResult<T>> {
    const baseUrl = this.serverApi ?? "";
    const requestUrl = `${baseUrl}${url}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const options: RequestInit = {
      method,
      headers,
    };

    if (body != null) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(requestUrl, options);
    const data = (await response.json()) as T;
    return { response, data };
  },

  get: function <T = unknown>(url: string) {
    return this.send<T>(url);
  },

  post: function <T = unknown>(url: string, body: unknown) {
    return this.send<T>(url, "POST", body);
  },

  put: function <T = unknown>(url: string, body: unknown) {
    return this.send<T>(url, "PUT", body);
  },

  patch: function <T = unknown>(url: string, body: unknown) {
    return this.send<T>(url, "PATCH", body);
  },

  delete: function <T = unknown>(url: string) {
    return this.send<T>(url, "DELETE");
  },
};


