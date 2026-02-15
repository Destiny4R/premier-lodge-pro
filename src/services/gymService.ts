import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  ApiResponse,
  GymMember,
  PaginationParams,
  PaginatedResponse,
  CreateGymMemberRequest,
  CreateGymGuestMemberRequest
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
  duration: number; // Duration in days
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

export interface GymPayment {
  id: string;
  gymMemberId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

/**
 * GET /api/gym/members/:id/payments
 * Get payment history for a gym member
 */
export async function getGymMemberPayments(id: string): Promise<ApiResponse<GymPayment[]>> {
  return await apiGet<GymPayment[]>(`/v3/gym/members/${id}/payments`);
}

/**
 * GET /api/gym/members
 * Get all gym members with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<GymMember>, message: string }
 */
export async function getGymMembers(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<GymMember>>> {
  return await apiGet<PaginatedResponse<GymMember>>('/v3/gym/members', params);
}

/**
 * GET /api/gym/members/:id
 * Get single gym member
 */
export async function getGymMemberById(id: string): Promise<ApiResponse<GymMember>> {
  return await apiGet<GymMember>(`/v3/gym/members/${id}`);
}

/**
 * POST /api/gym/members
 * Create new external gym member
 * 
 * Request payload:
 * {
 *   name: string,
 *   email: string,
 *   phone: string,
 *   address: string,
 *   emergencyContactName: string,
 *   emergencyPhone: string,
 *   emergencyAddress: string,
 *   membershipType: 'basic' | 'premium' | 'vip',
 *   startDate: string
 * }
 */
export async function createGymMember(data: CreateGymMemberRequest): Promise<ApiResponse<GymMember>> {
  const gymMember: CreateGymMemberRequest = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    emergencyContactName: data.emergencyContactName,
    emergencyPhone: data.emergencyPhone,
    emergencyAddress: data.emergencyAddress,
    gymPlanId: data.gymPlanId,
    startDate: data.startDate,
  };
  const gymMemberJson = JSON.stringify(gymMember);
  return await apiPost<GymMember>('/v3/gym/members', gymMemberJson);
}

/**
 * POST /api/gym/members/guest
 * Register a hotel guest as gym member
 * 
 * Request payload:
 * {
 *   bookingReference: string,
 *   membershipType: 'basic' | 'premium' | 'vip',
 *   startDate: string
 * }
 */
export async function createGymGuestMember(data: CreateGymGuestMemberRequest): Promise<ApiResponse<GymMember>> {
  return await apiPost<GymMember>('/v3/gym/members/guest', data);
}

/**
 * PUT /api/gym/members/:id
 * Update gym member
 */
export async function updateGymMember(id: string, data: Partial<CreateGymMemberRequest>): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/v3/gym/members/${id}`, data);
}

/**
 * PUT /api/gym/members/:id/renew
 * Renew gym membership
 * 
 * Request: { endDate: string }
 */
export async function renewGymMembership(id: string, endDate: string): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/v3/gym/members/${id}/renew`, { endDate });
}

/**
 * PUT /api/gym/members/:id/upgrade
 * Upgrade gym membership
 */
export async function upgradeGymMembership(id: string, gymPlanId: string): Promise<ApiResponse<GymMember>> {
  return await apiPut<GymMember>(`/v3/gym/members/${id}/upgrade`, { gymPlanId });
}

/**
 * DELETE /api/gym/members/:id
 * Cancel/delete gym membership
 */
export async function deleteGymMember(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/gym/members/${id}`);
}

// =====================================================
// Gym Plans
// =====================================================

/**
 * GET /api/gym/plans
 * Get all gym plans
 */
export async function getGymPlans(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<GymPlan>>> {
  return await apiGet<PaginatedResponse<GymPlan>>('/v3/gym/plans', params);
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
  const gymPlan: GymPlan = {
    id: '',
    hotelId: '',
    name: data.name,
    duration: data.duration,
    price: data.price,
    features: data.features,
    createdAt: null,
    updatedAt: null
  };
  //console.log();
  return await apiPost<GymPlan>('/v3/gym/plans', JSON.stringify(gymPlan));
}

/**
 * PUT /api/gym/plans/:id
 * Update gym plan
 */
export async function updateGymPlan(id: string, data: Partial<GymPlan>): Promise<ApiResponse<GymPlan>> {
  return await apiPut<GymPlan>(`/v3/gym/plans/${id}`, data);
}

/**
 * DELETE /api/gym/plans/:id
 * Delete gym plan
 */
export async function deleteGymPlan(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/gym/plans/${id}`);
}

// =====================================================
// Gym Statistics
// =====================================================

/**
 * GET /api/gym/stats
 * Get gym statistics
 */
export async function getGymStats(): Promise<ApiResponse<GymStats>> {
  return await apiGet<GymStats>('/v3/gym/stats');
}

// Export as named object
export const gymService = {
  getGymMembers,
  getGymMemberById,
  createGymMember,
  createGymGuestMember,
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
