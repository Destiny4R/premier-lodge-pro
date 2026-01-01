import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Guest, 
  PaginationParams, 
  PaginatedResponse,
  CreateGuestRequest
} from '@/types/api';

// =====================================================
// Guest Service - Handles guest-related API calls
// =====================================================

/**
 * GET /api/guests
 * Get all guests with pagination
 * 
 * Query params:
 * {
 *   page: number,
 *   pageSize: number,
 *   search?: string,
 *   sortBy?: string,
 *   sortOrder?: 'asc' | 'desc'
 * }
 */
export async function getGuests(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Guest>>> {
  try {
    return await apiGet<PaginatedResponse<Guest>>('/guests', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockGuests: Guest[] = [
      { id: 'g1', hotelId: 'h1', name: 'James Wilson', email: 'james@email.com', phone: '+1 555-0101', idType: 'Passport', idNumber: 'AB123456', address: '123 Main St, NY', totalStays: 5, totalSpent: 4500, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'g2', hotelId: 'h1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1 555-0102', idType: 'Driver License', idNumber: 'DL789012', address: '456 Oak Ave, LA', totalStays: 3, totalSpent: 2800, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
      { id: 'g3', hotelId: 'h1', name: 'Michael Chen', email: 'michael@email.com', phone: '+1 555-0103', idType: 'Passport', idNumber: 'CD345678', address: '789 Pine Rd, SF', totalStays: 8, totalSpent: 12500, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', createdAt: '2024-01-03', updatedAt: '2024-01-03' },
    ];
    
    return {
      success: true,
      data: {
        items: mockGuests,
        totalItems: mockGuests.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Guests retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/guests/:id
 * Get single guest by ID
 */
export async function getGuestById(id: string): Promise<ApiResponse<Guest>> {
  try {
    return await apiGet<Guest>(`/guests/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/guests
 * Create new guest
 * 
 * Request payload:
 * {
 *   name: string,
 *   email: string,
 *   phone: string,
 *   idType: string,
 *   idNumber: string,
 *   address: string,
 *   avatar?: string
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 */
export async function createGuest(data: CreateGuestRequest): Promise<ApiResponse<Guest>> {
  try {
    return await apiPost<Guest>('/guests', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { 
        ...data, 
        id: `g${Date.now()}`, 
        hotelId: 'h1', 
        totalStays: 0, 
        totalSpent: 0, 
        avatar: data.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as Guest,
      message: 'Guest created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/guests/:id
 * Update guest
 */
export async function updateGuest(id: string, data: Partial<CreateGuestRequest>): Promise<ApiResponse<Guest>> {
  try {
    return await apiPut<Guest>(`/guests/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, ...data } as Guest,
      message: 'Guest updated successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/guests/:id
 * Delete guest
 */
export async function deleteGuest(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`/guests/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Guest deleted successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/guests/:id/history
 * Get guest stay history
 */
export async function getGuestHistory(id: string): Promise<ApiResponse<unknown[]>> {
  try {
    return await apiGet(`/guests/${id}/history`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: [],
      message: 'Guest history retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/guests/stats
 * Get guest statistics
 */
export async function getGuestStats(): Promise<ApiResponse<{ totalGuests: number; checkedIn: number; vipGuests: number; returningRate: string }>> {
  try {
    return await apiGet('/guests/stats');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        totalGuests: 156,
        checkedIn: 89,
        vipGuests: 12,
        returningRate: '68%',
      },
      message: 'Guest stats retrieved successfully',
      status: 200,
    };
  }
}
