import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Booking, 
  PaginationParams, 
  PaginatedResponse,
  CreateBookingRequest,
  CheckoutReport
} from '@/types/api';

// =====================================================
// Booking Service - Handles booking-related API calls
// =====================================================

/**
 * GET /api/bookings
 * Get all bookings with pagination
 * 
 * Query params:
 * {
 *   page: number,
 *   pageSize: number,
 *   search?: string,
 *   sortBy?: string,
 *   sortOrder?: 'asc' | 'desc',
 *   status?: string,
 *   dateFrom?: string,
 *   dateTo?: string
 * }
 */
export async function getBookings(params?: PaginationParams & { status?: string; dateFrom?: string; dateTo?: string }): Promise<ApiResponse<PaginatedResponse<Booking>>> {
  try {
    return await apiGet<PaginatedResponse<Booking>>('/bookings', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockBookings: Booking[] = [
      { id: 'b1', guestId: 'g1', roomId: 'r2', hotelId: 'h1', checkIn: '2024-01-15', checkOut: '2024-01-18', status: 'checked-in', totalAmount: 450, paidAmount: 450, createdAt: '2024-01-10', updatedAt: '2024-01-10', guestName: 'James Wilson', guestEmail: 'james@email.com', guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', roomNumber: '102', hotelName: 'LuxeStay Grand Palace' },
      { id: 'b2', guestId: 'g2', roomId: 'r4', hotelId: 'h1', checkIn: '2024-01-20', checkOut: '2024-01-25', status: 'confirmed', totalAmount: 1400, paidAmount: 700, createdAt: '2024-01-12', updatedAt: '2024-01-12', guestName: 'Sarah Johnson', guestEmail: 'sarah@email.com', guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', roomNumber: '202', hotelName: 'LuxeStay Grand Palace' },
      { id: 'b3', guestId: 'g3', roomId: 'r5', hotelId: 'h1', checkIn: '2024-01-22', checkOut: '2024-01-24', status: 'confirmed', totalAmount: 900, paidAmount: 900, createdAt: '2024-01-14', updatedAt: '2024-01-14', guestName: 'Michael Chen', guestEmail: 'michael@email.com', guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', roomNumber: '301', hotelName: 'LuxeStay Grand Palace' },
    ];
    
    return {
      success: true,
      data: {
        items: mockBookings,
        totalItems: mockBookings.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Bookings retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/bookings/:id
 * Get single booking by ID
 */
export async function getBookingById(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiGet<Booking>(`/bookings/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/bookings
 * Create new booking
 * 
 * Request payload:
 * {
 *   guestId: string,
 *   roomId: string,
 *   checkIn: string (YYYY-MM-DD),
 *   checkOut: string (YYYY-MM-DD),
 *   paidAmount: number
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 */
export async function createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
  try {
    return await apiPost<Booking>('/bookings', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { ...data, id: `b${Date.now()}`, hotelId: 'h1', status: 'confirmed', totalAmount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Booking,
      message: 'Booking created successfully',
      status: 201,
    };
  }
}

/**
 * POST /api/bookings/reservation
 * Create new reservation (without immediate payment)
 */
export async function createReservation(data: Omit<CreateBookingRequest, 'paidAmount'>): Promise<ApiResponse<Booking>> {
  try {
    return await apiPost<Booking>('/bookings/reservation', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { ...data, id: `b${Date.now()}`, hotelId: 'h1', status: 'confirmed', paidAmount: 0, totalAmount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Booking,
      message: 'Reservation created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/bookings/:id/check-in
 * Check in guest
 */
export async function checkIn(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`/bookings/${id}/check-in`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, status: 'checked-in' } as Booking,
      message: 'Guest checked in successfully',
      status: 200,
    };
  }
}

/**
 * PUT /api/bookings/:id/check-out
 * Check out guest
 */
export async function checkOut(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`/bookings/${id}/check-out`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, status: 'checked-out' } as Booking,
      message: 'Guest checked out successfully',
      status: 200,
    };
  }
}

/**
 * PUT /api/bookings/:id/cancel
 * Cancel booking
 */
export async function cancelBooking(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`/bookings/${id}/cancel`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, status: 'cancelled' } as Booking,
      message: 'Booking cancelled successfully',
      status: 200,
    };
  }
}

/**
 * PUT /api/bookings/:id
 * Update booking
 */
export async function updateBooking(id: string, data: Partial<CreateBookingRequest>): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`/bookings/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, ...data } as Booking,
      message: 'Booking updated successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/bookings/:id
 * Delete booking
 */
export async function deleteBooking(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`/bookings/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Booking deleted successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/bookings/:id/checkout-report
 * Get checkout report for a booking
 */
export async function getCheckoutReport(id: string): Promise<ApiResponse<CheckoutReport>> {
  try {
    return await apiGet<CheckoutReport>(`/bookings/${id}/checkout-report`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        bookingId: id,
        guestName: 'James Wilson',
        roomNumber: '102',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        roomCharges: 450,
        restaurantCharges: 125,
        laundryCharges: 45,
        otherCharges: 30,
        totalAmount: 650,
        paidAmount: 450,
        balance: 200,
      },
      message: 'Checkout report retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/bookings/stats
 * Get booking statistics
 */
export async function getBookingStats(): Promise<ApiResponse<{ todayCheckIns: number; todayCheckOuts: number; pendingPayments: number; activeBookings: number }>> {
  try {
    return await apiGet('/bookings/stats');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        todayCheckIns: 12,
        todayCheckOuts: 8,
        pendingPayments: 23450,
        activeBookings: 89,
      },
      message: 'Booking stats retrieved successfully',
      status: 200,
    };
  }
}
