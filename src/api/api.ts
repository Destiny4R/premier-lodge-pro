const TOKEN_KEY = "access_token";
const BASE_URL = "https://localhost:44353/";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("API Request - Token from localStorage:", token ? "Present" : "Not found");

    const headers: Record<string, string> = {
      ...options?.headers as Record<string, string>,
    };

    // Set Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("API Request - Authorization header set");
    } else {
      console.log("API Request - No token found, proceeding without Authorization header");
    }

    // Handle Content-Type for different data types
    let body: string | FormData | undefined;

    if (data instanceof FormData) {
      // For FormData, let the browser set Content-Type automatically
      console.log("API Request - FormData detected, letting browser set Content-Type");
      body = data;
      // Remove any manually set Content-Type for FormData
      delete headers["Content-Type"];
    } else if (data) {
      // For JSON data, set Content-Type if not already set
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      body = JSON.stringify(data);
    }

    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    console.log("API Request - URL:", fullURL);
    console.log("API Request - Method:", method);
    console.log("API Request - Headers:", headers);
    console.log("API Request - Data type:", data instanceof FormData ? "FormData" : typeof data);

    try {
      console.log("About to make fetch request to:", fullURL);
      console.log("Request details:", { method, headers, hasBody: !!body });
      const response = await fetch(fullURL, {
        method,
        headers,
        body,
        ...options,
      });
      console.log("Fetch request completed, response status:", response.status, "statusText:", response.statusText);

      console.log("API Response - Status:", response.status);
      console.log("API Response - Status Text:", response.statusText);

      let responseData: any;

      // Handle different response types
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log("API Response - Data:", responseData);

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        console.log("API Response - 401 error, token removed");
      }

      if (!response.ok) {
        throw {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
        };
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error: any) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async get<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T = any>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, data, options);
  }

  async put<T = any>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", url, data, options);
  }

  async delete<T = any>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", url, undefined, options);
  }

  async patch<T = any>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", url, data, options);
  }
}

const apiClient = new ApiClient(BASE_URL);

export default apiClient;
