import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/api';

// =====================================================
// API Configuration
// =====================================================

// Base URL - replace with actual API URL
const API_BASE_URL = '/api';

// Session storage keys
const TOKEN_KEY = 'luxestay_token';
const USER_KEY = 'luxestay_user';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// Request Interceptor - Add Auth Token
// =====================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Skip auth for public endpoints
    const publicEndpoints = ['/auth/login', '/auth/reset-password', '/auth/forgot-password'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login';
      }
      
      // Return the API error response
      return Promise.reject({
        success: false,
        message: data?.message || 'An error occurred',
        status: status,
        data: null,
      });
    }
    
    // Network error
    return Promise.reject({
      success: false,
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    });
  }
);

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
// API Helper Functions
// =====================================================

/**
 * Generic GET request
 */
export async function apiGet<T>(endpoint: string, params?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.get<ApiResponse<T>>(endpoint, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic POST request
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic PUT request
 */
export async function apiPut<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await api.put<ApiResponse<T>>(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await api.delete<ApiResponse<T>>(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload file with FormData
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
    throw error;
  }
}

export default api;
