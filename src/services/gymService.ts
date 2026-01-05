import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  GymMember,
  PaginationParams, 
  PaginatedResponse,
  CreateGymMemberRequest
} from '@/types/api';

// =====================================================
// Gym Service - Handles gym-related API calls
// =====================================================

// ==== ENDPOINTS ====
// Base URL: Replace with your API base URL (e.g., https://api.yourhotel.com)
// 
// GET    /api/gym/members               - List all gym members
// GET    /api/gym/members/:id           - Get single member
// POST   /api/gym/members               - Create new member
// PUT    /api/gym/members/:id           - Update member
// DELETE /api/gym/members/:id           - Delete member
// PUT    /api/gym/members/:id/renew     - Renew membership
// GET    /api/gym/plans                 - List all gym plans
// POST   /api/gym/plans                 - Create gym plan
// PUT    /api/gym/plans/:id             - Update gym plan
// DELETE /api/gym/plans/:id             - Delete gym plan
// GET    /api/gym/stats                 - Get gym statistics

export interface GymPlan {
  id: string;
  hotelId: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GymStats {
  activeMembers: number;
  guestAccess: number;
  monthlyRevenue: number;
  vipMembers: number;
}

/**
 * GET /api/gym/members
 * Get all gym members with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<GymMember>, message: string }
 */
export async function getGymMembers(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<GymMember>>> {
  return await apiGet<PaginatedResponse<GymMember>>('/gym/members', params);
}

/**
 * GET /api/gym/members/:id
 * Get single gym member
 */
export async function getGymMemberById(id: string): Promise<ApiResponse<GymMember>> {
  return await apiGet<GymMember>(`/gym/members/${id}`);
}

/**
 * POST /api/gym/members
 * Create new gym member
 * 
 * Request payload:
 * {
 *   guestId?: string,       // Optional: Link to hotel guest
 *   name: string,           // Member name
 *   email: string,          // Member email
 *   phone: string,          // Member phone
 *   membershipType: 'basic' | 'premium' | 'vip',
 *   startDate: string,      // ISO date string
 *   endDate: string         // ISO date string
 * }
 */
export async function createGymMember(data: CreateGymMemberRequest): Promise<ApiResponse<GymMember>> {
  return await apiPost<GymMember>('/gym/members', data);
}

/**
 * PUT /api/gym/members/:id
 * Update gym member
 */
export async function updateGymMember(id: string, data: Partial<CreateGymMemberRequest>): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/gym/members/${id}`, data);
}

/**
 * PUT /api/gym/members/:id/renew
 * Renew gym membership
 * 
 * Request: { endDate: string }
 */
export async function renewGymMembership(id: string, endDate: string): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/gym/members/${id}/renew`, { endDate });
}

/**
 * PUT /api/gym/members/:id/upgrade
 * Upgrade gym membership
 */
export async function upgradeGymMembership(id: string, membershipType: GymMember['membershipType']): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/gym/members/${id}/upgrade`, { membershipType });
}

/**
 * DELETE /api/gym/members/:id
 * Cancel/delete gym membership
 */
export async function deleteGymMember(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/gym/members/${id}`);
}

// =====================================================
// Gym Plans
// =====================================================

/**
 * GET /api/gym/plans
 * Get all gym plans
 */
export async function getGymPlans(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<GymPlan>>> {
  return await apiGet<PaginatedResponse<GymPlan>>('/gym/plans', params);
}

/**
 * POST /api/gym/plans
 * Create gym plan
 * 
 * Request payload:
 * {
 *   name: string,           // Plan name
 *   duration: string,       // Duration (e.g., "1 month", "3 months")
 *   price: number,          // Plan price
 *   features: string[]      // List of features
 * }
 */
export async function createGymPlan(data: Omit<GymPlan, 'id' | 'hotelId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<GymPlan>> {
  return await apiPost<GymPlan>('/gym/plans', data);
}

/**
 * PUT /api/gym/plans/:id
 * Update gym plan
 */
export async function updateGymPlan(id: string, data: Partial<GymPlan>): Promise<ApiResponse<GymPlan>> {
  return await apiPut<GymPlan>(`/gym/plans/${id}`, data);
}

/**
 * DELETE /api/gym/plans/:id
 * Delete gym plan
 */
export async function deleteGymPlan(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/gym/plans/${id}`);
}

// =====================================================
// Gym Statistics
// =====================================================

/**
 * GET /api/gym/stats
 * Get gym statistics
 */
export async function getGymStats(): Promise<ApiResponse<GymStats>> {
  return await apiGet<GymStats>('/gym/stats');
}

// Export as named object
export const gymService = {
  getGymMembers,
  getGymMemberById,
  createGymMember,
  updateGymMember,
  renewGymMembership,
  upgradeGymMembership,
  deleteGymMember,
  getGymPlans,
  createGymPlan,
  updateGymPlan,
  deleteGymPlan,
  getGymStats,
};
