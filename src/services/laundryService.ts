import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  ApiResponse,
  LaundryOrder,
  LaundryCategory,
  LaundryServiceType,
  LaundryServicePrice,
  LaundryPayment,
  PaginationParams,
  PaginatedResponse,
  CreateLaundryGuestOrderRequest,
  CreateLaundryVisitorOrderRequest,
  CreateLaundryPaymentRequest,
} from '@/types/api';

// =====================================================
// Laundry Service - Handles laundry-related API calls
// =====================================================

export interface LaundryStats {
  pendingOrders: number;
  processingOrders: number;
  readyOrders: number;
  todayRevenue: number;
}

// =====================================================
// Laundry Orders
// =====================================================

export async function getLaundryOrders(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<LaundryOrder>>> {
  return await apiGet<PaginatedResponse<LaundryOrder>>('/v3/laundry/orders', params);
}

export async function getLaundryOrderById(id: string): Promise<ApiResponse<LaundryOrder>> {
  return await apiGet<LaundryOrder>(`/v3/laundry/orders/${id}`);
}

/**
 * POST /api/v3/laundry/orders/guest
 * Create laundry order for hotel guest (charge to room)
 */
export async function createLaundryGuestOrder(data: CreateLaundryGuestOrderRequest): Promise<ApiResponse<LaundryOrder>> {
  return await apiPost<LaundryOrder>('/v3/laundry/orders/guest', data);
}

/**
 * POST /api/v3/laundry/orders/visitor
 * Create laundry order for walk-in visitor
 */
export async function createLaundryVisitorOrder(data: CreateLaundryVisitorOrderRequest): Promise<ApiResponse<LaundryOrder>> {
  return await apiPost<LaundryOrder>('/v3/laundry/orders/visitor', data);
}

export async function updateLaundryOrderStatus(id: string, status: LaundryOrder['status']): Promise<ApiResponse<LaundryOrder>> {
  return await apiPut<LaundryOrder>(`/v3/laundry/orders/${id}/status`, { status });
}

export async function deleteLaundryOrder(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/orders/${id}`);
}

// =====================================================
// Laundry Payments
// =====================================================

export async function addPaymentToOrder(orderId: string, data: CreateLaundryPaymentRequest): Promise<ApiResponse<LaundryPayment>> {
  return await apiPost<LaundryPayment>(`/v3/laundry/orders/${orderId}/payments`, data);
}

export async function getOrderPayments(orderId: string): Promise<ApiResponse<LaundryPayment[]>> {
  return await apiGet<LaundryPayment[]>(`/v3/laundry/orders/${orderId}/payments`);
}

// =====================================================
// Clothing Types (Categories)
// =====================================================

export async function getLaundryCategories(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<LaundryCategory>>> {
  return await apiGet<PaginatedResponse<LaundryCategory>>('/v3/laundry/categories', params);
}

export async function createLaundryCategory(data: Partial<LaundryCategory>): Promise<ApiResponse<LaundryCategory>> {
  return await apiPost<LaundryCategory>('/v3/laundry/categories', data);
}

export async function updateLaundryCategory(id: string, data: Partial<LaundryCategory>): Promise<ApiResponse<LaundryCategory>> {
  return await apiPut<LaundryCategory>(`/v3/laundry/categories/${id}`, data);
}

export async function deleteLaundryCategory(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/categories/${id}`);
}

// =====================================================
// Service Types (e.g., Wash, Dry Clean)
// =====================================================

export async function getLaundryServiceTypes(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<LaundryServiceType>>> {
  return await apiGet<PaginatedResponse<LaundryServiceType>>('/v3/laundry/services', params);
}

export async function createLaundryServiceType(data: Partial<LaundryServiceType>): Promise<ApiResponse<LaundryServiceType>> {
  return await apiPost<LaundryServiceType>('/v3/laundry/services', data);
}

export async function updateLaundryServiceType(id: string, data: Partial<LaundryServiceType>): Promise<ApiResponse<LaundryServiceType>> {
  return await apiPut<LaundryServiceType>(`/v3/laundry/services/${id}`, data);
}

export async function deleteLaundryServiceType(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/services/${id}`);
}

// =====================================================
// Pricing Matrix (ClothingType + ServiceType → Price)
// =====================================================

export async function getLaundryPrices(params?: PaginationParams & { categoryId?: string; serviceId?: string }): Promise<ApiResponse<PaginatedResponse<LaundryServicePrice>>> {
  return await apiGet<PaginatedResponse<LaundryServicePrice>>('/v3/laundry/prices', params);
}

export async function createLaundryPrice(data: Partial<LaundryServicePrice>): Promise<ApiResponse<LaundryServicePrice>> {
  return await apiPost<LaundryServicePrice>('/v3/laundry/prices', data);
}

export async function updateLaundryPrice(id: string, data: Partial<LaundryServicePrice>): Promise<ApiResponse<LaundryServicePrice>> {
  return await apiPut<LaundryServicePrice>(`/v3/laundry/prices/${id}`, data);
}

export async function deleteLaundryPrice(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/prices/${id}`);
}

// =====================================================
// Laundry Statistics
// =====================================================

export async function getLaundryStats(): Promise<ApiResponse<LaundryStats>> {
  return await apiGet<LaundryStats>('/v3/laundry/stats');
}

// Export as named object
export const laundryService = {
  getLaundryOrders,
  getLaundryOrderById,
  createLaundryGuestOrder,
  createLaundryVisitorOrder,
  updateLaundryOrderStatus,
  deleteLaundryOrder,

  addPaymentToOrder,
  getOrderPayments,

  getLaundryCategories,
  createLaundryCategory,
  updateLaundryCategory,
  deleteLaundryCategory,

  getLaundryServiceTypes,
  createLaundryServiceType,
  updateLaundryServiceType,
  deleteLaundryServiceType,

  getLaundryPrices,
  createLaundryPrice,
  updateLaundryPrice,
  deleteLaundryPrice,

  getLaundryStats,
};
