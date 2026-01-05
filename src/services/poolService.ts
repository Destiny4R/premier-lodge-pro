import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  PoolAccess,
  PaginationParams, 
  PaginatedResponse
} from '@/types/api';

// =====================================================
// Pool Service - Handles pool-related API calls
// =====================================================

// ==== ENDPOINTS ====
// Base URL: Replace with your API base URL (e.g., https://api.yourhotel.com)
// 
// GET    /api/pool/access               - List all pool access records
// GET    /api/pool/access/:id           - Get single access record
// POST   /api/pool/access               - Grant pool access
// PUT    /api/pool/access/:id           - Update pool access
// DELETE /api/pool/access/:id           - Revoke pool access
// GET    /api/pool/plans                - List all pool access plans
// POST   /api/pool/plans                - Create pool plan
// PUT    /api/pool/plans/:id            - Update pool plan
// DELETE /api/pool/plans/:id            - Delete pool plan
// GET    /api/pool/stats                - Get pool statistics

export interface PoolPlan {
  id: string;
  hotelId: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PoolMember {
  id: string;
  hotelId: string;
  guestId?: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PoolStats {
  currentVisitors: number;
  guestAccess: number;
  todayRevenue: number;
  avgDuration: string;
}

export interface CreatePoolAccessRequest {
  guestId?: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  startDate: string;
  endDate: string;
  isGuest: boolean;
}

/**
 * GET /api/pool/access
 * Get all pool access records
 * 
 * Response: { success: boolean, data: PaginatedResponse<PoolMember>, message: string }
 */
export async function getPoolMembers(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<PoolMember>>> {
  return await apiGet<PaginatedResponse<PoolMember>>('/pool/access', params);
}

/**
 * GET /api/pool/access/:id
 * Get single pool access record
 */
export async function getPoolMemberById(id: string): Promise<ApiResponse<PoolMember>> {
  return await apiGet<PoolMember>(`/pool/access/${id}`);
}

/**
 * POST /api/pool/access
 * Grant pool access
 * 
 * Request payload:
 * {
 *   guestId?: string,       // Optional: Link to hotel guest
 *   name: string,           // Member name
 *   email: string,          // Member email
 *   phone: string,          // Member phone
 *   planId: string,         // Pool plan ID
 *   startDate: string,      // ISO date string
 *   endDate: string,        // ISO date string
 *   isGuest: boolean        // Is hotel guest
 * }
 */
export async function createPoolAccess(data: CreatePoolAccessRequest): Promise<ApiResponse<PoolMember>> {
  return await apiPost<PoolMember>('/pool/access', data);
}

/**
 * PUT /api/pool/access/:id
 * Update pool access
 */
export async function updatePoolAccess(id: string, data: Partial<CreatePoolAccessRequest>): Promise<ApiResponse<PoolMember>> {
  return await apiPut<PoolMember>(`/pool/access/${id}`, data);
}

/**
 * PUT /api/pool/access/:id/renew
 * Renew pool access
 */
export async function renewPoolAccess(id: string, endDate: string): Promise<ApiResponse<PoolMember>> {
  return await apiPut<PoolMember>(`/pool/access/${id}/renew`, { endDate });
}

/**
 * DELETE /api/pool/access/:id
 * Revoke pool access
 */
export async function deletePoolAccess(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/pool/access/${id}`);
}

// =====================================================
// Pool Plans
// =====================================================

/**
 * GET /api/pool/plans
 * Get all pool access plans
 */
export async function getPoolPlans(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<PoolPlan>>> {
  return await apiGet<PaginatedResponse<PoolPlan>>('/pool/plans', params);
}

/**
 * POST /api/pool/plans
 * Create pool plan
 * 
 * Request payload:
 * {
 *   name: string,           // Plan name
 *   duration: string,       // Duration (e.g., "1 day", "1 week")
 *   price: number,          // Plan price
 *   features: string[]      // List of features
 * }
 */
export async function createPoolPlan(data: Omit<PoolPlan, 'id' | 'hotelId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PoolPlan>> {
  return await apiPost<PoolPlan>('/pool/plans', data);
}

/**
 * PUT /api/pool/plans/:id
 * Update pool plan
 */
export async function updatePoolPlan(id: string, data: Partial<PoolPlan>): Promise<ApiResponse<PoolPlan>> {
  return await apiPut<PoolPlan>(`/pool/plans/${id}`, data);
}

/**
 * DELETE /api/pool/plans/:id
 * Delete pool plan
 */
export async function deletePoolPlan(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/pool/plans/${id}`);
}

// =====================================================
// Pool Statistics
// =====================================================

/**
 * GET /api/pool/stats
 * Get pool statistics
 */
export async function getPoolStats(): Promise<ApiResponse<PoolStats>> {
  return await apiGet<PoolStats>('/pool/stats');
}

// Export as named object
export const poolService = {
  getPoolMembers,
  getPoolMemberById,
  createPoolAccess,
  updatePoolAccess,
  renewPoolAccess,
  deletePoolAccess,
  getPoolPlans,
  createPoolPlan,
  updatePoolPlan,
  deletePoolPlan,
  getPoolStats,
};
