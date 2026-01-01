import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Hotel, 
  HotelAdmin,
  PaginationParams, 
  PaginatedResponse,
  CreateHotelAdminRequest
} from '@/types/api';

// =====================================================
// Hotel Service - Handles hotel-related API calls
// =====================================================

/**
 * GET /api/hotels
 * Get all hotels with pagination
 */
export async function getHotels(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Hotel>>> {
  try {
    return await apiGet<PaginatedResponse<Hotel>>('/hotels', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockHotels: Hotel[] = [
      { id: 'h1', name: 'LuxeStay Grand Palace', city: 'New York', address: '123 Fifth Avenue, Manhattan', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', rating: 4.9, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'h2', name: 'LuxeStay Marina Bay', city: 'Miami', address: '456 Ocean Drive, Miami Beach', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', rating: 4.8, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'h3', name: 'LuxeStay Mountain Retreat', city: 'Aspen', address: '789 Alpine Road, Aspen', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', rating: 4.7, status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];
    
    return {
      success: true,
      data: {
        items: mockHotels,
        totalItems: mockHotels.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Hotels retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/hotels/:id
 * Get single hotel by ID
 */
export async function getHotelById(id: string): Promise<ApiResponse<Hotel>> {
  try {
    return await apiGet<Hotel>(`/hotels/${id}`);
  } catch (error) {
    throw error;
  }
}

// =====================================================
// Hotel Admins (Sub-Admins)
// =====================================================

/**
 * GET /api/hotel-admins
 * Get all hotel admins with pagination
 */
export async function getHotelAdmins(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<HotelAdmin>>> {
  try {
    return await apiGet<PaginatedResponse<HotelAdmin>>('/hotel-admins', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockAdmins: HotelAdmin[] = [
      { id: 'ha1', userId: 'u2', hotelId: 'h1', name: 'Hotel Admin', email: 'admin@luxestay.com', phone: '+1 555-0001', status: 'active', createdAt: '2024-01-01', updatedAt: '2024-01-01', hotelName: 'LuxeStay Grand Palace' },
      { id: 'ha2', userId: 'u5', hotelId: 'h2', name: 'Miami Admin', email: 'miami@luxestay.com', phone: '+1 555-0002', status: 'active', createdAt: '2024-01-02', updatedAt: '2024-01-02', hotelName: 'LuxeStay Marina Bay' },
      { id: 'ha3', userId: 'u6', hotelId: 'h3', name: 'Aspen Admin', email: 'aspen@luxestay.com', phone: '+1 555-0003', status: 'inactive', createdAt: '2024-01-03', updatedAt: '2024-01-03', hotelName: 'LuxeStay Mountain Retreat' },
    ];
    
    return {
      success: true,
      data: {
        items: mockAdmins,
        totalItems: mockAdmins.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Hotel admins retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/hotel-admins/:id
 * Get single hotel admin by ID
 */
export async function getHotelAdminById(id: string): Promise<ApiResponse<HotelAdmin>> {
  try {
    return await apiGet<HotelAdmin>(`/hotel-admins/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/hotel-admins
 * Create new hotel admin (sub-admin)
 * 
 * Request payload:
 * {
 *   hotelId: string,
 *   name: string,
 *   email: string,
 *   phone: string,
 *   password: string
 * }
 */
export async function createHotelAdmin(data: CreateHotelAdminRequest): Promise<ApiResponse<HotelAdmin>> {
  try {
    return await apiPost<HotelAdmin>('/hotel-admins', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { 
        ...data, 
        id: `ha${Date.now()}`, 
        userId: `u${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as HotelAdmin,
      message: 'Hotel admin created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/hotel-admins/:id
 * Update hotel admin
 */
export async function updateHotelAdmin(id: string, data: Partial<CreateHotelAdminRequest>): Promise<ApiResponse<HotelAdmin>> {
  try {
    return await apiPut<HotelAdmin>(`/hotel-admins/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, ...data } as HotelAdmin,
      message: 'Hotel admin updated successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/hotel-admins/:id
 * Delete hotel admin
 */
export async function deleteHotelAdmin(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`/hotel-admins/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Hotel admin deleted successfully',
      status: 200,
    };
  }
}

/**
 * PUT /api/hotel-admins/:id/status
 * Update hotel admin status
 */
export async function updateHotelAdminStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<HotelAdmin>> {
  try {
    return await apiPut<HotelAdmin>(`/hotel-admins/${id}/status`, { status });
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, status } as HotelAdmin,
      message: 'Hotel admin status updated successfully',
      status: 200,
    };
  }
}
