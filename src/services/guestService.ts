import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Guest, 
  PaginationParams, 
  PaginatedResponse,
  CreateGuestRequest,
  GuestServicesResponse,
  Booking,
  RestaurantOrder,
  LaundryOrder
} from '@/types/api';

// =====================================================
// Guest Service - Handles guest-related API calls
// =====================================================

/**
 * GET /api/v3/guests/guestlist
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
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     items: Guest[],
 *     totalItems: number,
 *     totalPages: number,
 *     currentPage: number,
 *     pageSize: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuests(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Guest>>> {
  try {
    // Normalize pagination parameter names: callers may pass `limit`, but the API expects `pageSize`
    const queryParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.limit !== undefined && params?.pageSize === undefined) {
      queryParams.pageSize = params.limit;
      // remove legacy `limit` to avoid ambiguity
      delete (queryParams as any).limit;
    }

    return await apiGet<PaginatedResponse<Guest>>('v3/guests/guestlist', queryParams);
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
 * GET /api/v3/guests/getGuestinfo/:id
 * Get single guest by ID
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Guest,
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestById(id: string): Promise<ApiResponse<Guest>> {
  try {
    return await apiGet<Guest>(`v3/guests/getGuestinfo/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/v3/guests/addGuest
 * Create new guest
 * 
 * Request payload:
 * {
 *   firstname: string,
 *   lastname: string,
 *   gender: string,
 *   address: string,
 *   city: string,
 *   country: string,
 *   Email: string,
 *   phone: string,
 *   identificationnumber: string,
 *   identificationtype: string,
 *   emergencycontactname: string,
 *   emergencycontactphone: string,
 *   accommodation?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Guest,
 *   message: string,
 *   status: number
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 * Note: Room selection is handled separately via booking
 */
export async function createGuest(data: CreateGuestRequest): Promise<ApiResponse<Guest>> {
  try {
    // Remove roomids from the request - room assignment is done via booking
    const { roomids, checkindate, checkoutdate, ...guestData } = data;
    return await apiPost<Guest>('v3/guests/addGuest', guestData);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        ...data,
        id: `g${Date.now()}`,
        hotelId: 'h1',
        name: `${data.firstname} ${data.lastname}`,
        email: data.Email,
        totalStays: 0,
        totalSpent: 0,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Guest,
      message: 'Guest created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/v3/guests/updateGuest/:id
 * Update guest
 * 
 * Request payload: Partial<CreateGuestRequest>
 * Note: Room selection is NOT part of guest update - use booking instead
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Guest,
 *   message: string,
 *   status: number
 * }
 */
export async function updateGuest(id: string, data: Partial<CreateGuestRequest>): Promise<ApiResponse<Guest>> {
  try {
    // Remove roomids from the request - room assignment is done via booking
    const { roomids, checkindate, checkoutdate, ...guestData } = data;
    return await apiPut<Guest>(`v3/guests/updateGuest/${id}`, guestData);
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
 * DELETE /api/v3/guests/deleteGuest/:id
 * Delete guest
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: null,
 *   message: string,
 *   status: number
 * }
 */
export async function deleteGuest(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`v3/guests/deleteGuest/${id}`);
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
 * GET /api/v3/guests/:id/services
 * Get guest services (bookings, restaurant orders, laundry orders)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     bookings: Booking[],
 *     restaurantOrders: RestaurantOrder[],
 *     laundryOrders: LaundryOrder[]
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestServices(id: string): Promise<ApiResponse<GuestServicesResponse>> {
  try {
    return await apiGet<GuestServicesResponse>(`v3/guests/${id}/services`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        bookings: [],
        restaurantOrders: [],
        laundryOrders: [],
      },
      message: 'Guest services retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/guests/:id/bookings
 * Get guest booking history
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     items: Booking[],
 *     totalItems: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestBookings(id: string): Promise<ApiResponse<PaginatedResponse<Booking>>> {
  try {
    return await apiGet<PaginatedResponse<Booking>>(`v3/guests/${id}/bookings`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Guest bookings retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/guests/:id/restaurant-orders
 * Get guest restaurant orders
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     items: RestaurantOrder[],
 *     totalItems: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestRestaurantOrders(id: string): Promise<ApiResponse<PaginatedResponse<RestaurantOrder>>> {
  try {
    return await apiGet<PaginatedResponse<RestaurantOrder>>(`v3/guests/${id}/restaurant-orders`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Guest restaurant orders retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/guests/:id/laundry-orders
 * Get guest laundry orders
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     items: LaundryOrder[],
 *     totalItems: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestLaundryOrders(id: string): Promise<ApiResponse<PaginatedResponse<LaundryOrder>>> {
  try {
    return await apiGet<PaginatedResponse<LaundryOrder>>(`v3/guests/${id}/laundry-orders`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Guest laundry orders retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/guests/stats
 * Get guest statistics
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     totalGuests: number,
 *     checkedIn: number,
 *     vipGuests: number,
 *     returningRate: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getGuestStats(): Promise<ApiResponse<{ totalGuests: number; checkedIn: number; vipGuests: number; returningRate: string }>> {
  try {
    return await apiGet('v3/guests/stats');
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
