import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/api';

// =====================================================
// API Configuration
// =====================================================
// IMPORTANT: Replace this URL with your actual API base URL
// Example: 'https://api.yourhotel.com/api' or 'http://localhost:3000/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Session storage keys
const TOKEN_KEY = 'luxestay_token';
const USER_KEY = 'luxestay_user';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// =====================================================
// Request Interceptor - Add Auth Token
// =====================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Skip auth for public endpoints
    const publicEndpoints = ['v2/auths/login', '/auth/reset-password', '/auth/forgot-password'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type for non-FormData requests
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// Response Interceptor - Handle Errors
// =====================================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login';
      }
      
      // Return standardized error response (not throwing, returning for handling)
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: data?.message || getErrorMessage(status),
        status: status,
        data: null,
      };
      
      return Promise.reject(errorResponse);
    }
    
    // Network error or timeout
    const networkError: ApiResponse<null> = {
      success: false,
      message: error.code === 'ECONNABORTED' 
        ? 'Request timed out. Please try again.' 
        : 'Network error. Please check your connection.',
      status: 0,
      data: null,
    };
    
    return Promise.reject(networkError);
  }
);

// =====================================================
// Error Message Helper
// =====================================================
function getErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request. Please check your input.';
    case 401: return 'Unauthorized. Please login again.';
    case 403: return 'Access denied. You do not have permission.';
    case 404: return 'Resource not found.';
    case 500: return 'Server error. Please try again later.';
    default: return 'An unexpected error occurred.';
  }
}

// =====================================================
// Token Management
// =====================================================
export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUserData = (user: unknown) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUserData = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

// =====================================================
// Auth Data Management (for AuthContext)
// =====================================================
export const setAuthData = (token: string, user: unknown) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

// =====================================================
// API Helper Functions with Graceful Error Handling
// =====================================================

/**
 * Creates a failed API response object
 */
function createErrorResponse<T>(error: unknown): ApiResponse<T> {
  if (error && typeof error === 'object' && 'success' in error) {
    return error as ApiResponse<T>;
  }
  return {
    success: false,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500,
    data: null as unknown as T,
  };
}

/**
 * Generic GET request
 * 
 * @param endpoint - API endpoint (e.g., '/rooms', '/bookings/123')
 * @param params - Optional query parameters
 * @returns ApiResponse<T> - Always returns a response object, never throws
 * 
 * Usage:
 * const response = await apiGet<Room[]>('/rooms');
 * if (response.success) {
 *   // Use response.data
 * } else {
 *   // Handle error with response.message
 * }
 */
export async function apiGet<T>(endpoint: string, params?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.get<ApiResponse<T>>(endpoint, { params });
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

/**
 * Generic POST request
 * 
 * @param endpoint - API endpoint
 * @param data - Request body
 * @returns ApiResponse<T>
 * 
 * Usage:
 * const response = await apiPost<Room>('/rooms', { roomNumber: '101', floor: 1 });
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

/**
 * Generic PUT request
 * 
 * @param endpoint - API endpoint
 * @param data - Request body
 * @returns ApiResponse<T>
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.put<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

/**
 * Generic PATCH request
 * 
 * @param endpoint - API endpoint
 * @param data - Request body
 * @returns ApiResponse<T>
 */
export async function apiPatch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.patch<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

/**
 * Generic DELETE request
 * 
 * @param endpoint - API endpoint
 * @returns ApiResponse<T>
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await api.delete<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

/**
 * Upload file with FormData
 * 
 * @param endpoint - API endpoint
 * @param formData - FormData object containing files
 * @returns ApiResponse<T>
 */
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    const response = await api.post<ApiResponse<T>>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    return createErrorResponse<T>(error);
  }
}

export default api;
