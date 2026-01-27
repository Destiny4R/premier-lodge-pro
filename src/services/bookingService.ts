import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Booking, 
  PaginationParams, 
  PaginatedResponse,
  CreateBookingRequest,
  CreateReservationRequest,
  ExtendBookingRequest,
  CheckoutReport,
  BookingType
} from '@/types/api';

// =====================================================
// Booking Service - Handles booking-related API calls
// =====================================================

/**
 * Booking filter period options
 */
export type BookingFilterPeriod = 'today' | 'this_week' | 'this_month' | 'all';

/**
 * GET /api/v3/bookings/getbookings
 * Get all bookings with pagination and filtering
 * 
 * Query params:
 * {
 *   page: number,
 *   pageSize: number,
 *   search?: string,
 *   sortBy?: string,
 *   sortOrder?: 'asc' | 'desc',
 *   status?: string,               // Filter by status: 'confirmed', 'checked-in', 'checked-out', 'cancelled'
 *   bookingType?: string,          // Filter by type: 'check-in', 'reservation'
 *   period?: 'today' | 'this_week' | 'this_month',  // Period filter
 *   dateFrom?: string,             // Custom date range start (YYYY-MM-DD)
 *   dateTo?: string                // Custom date range end (YYYY-MM-DD)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     items: Booking[],
 *     totalItems: number,
 *     totalPages: number,
 *     currentPage: number,
 *     pageSize: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getBookings(params?: PaginationParams & { 
  status?: string; 
  bookingtype?: BookingType;
  period?: BookingFilterPeriod;
  dateFrom?: string; 
  dateTo?: string;
}): Promise<ApiResponse<PaginatedResponse<Booking>>> {
  try {
    return await apiGet<PaginatedResponse<Booking>>('v3/bookings/getbookings', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockBookings: Booking[] = [
      { 
        id: 'b1', 
        bookingReference: 'BK-2024-001234',
        guestId: 'g1', 
        roomId: 'r2', 
        hotelId: 'h1', 
        checkIn: '2024-01-15', 
        checkOut: '2024-01-18', 
        bookingtype: 'check-in',
        status: 'checked-in', 
        totalAmount: 450, 
        paidAmount: 450, 
        createdAt: '2024-01-10', 
        updatedAt: '2024-01-10', 
        guestName: 'James Wilson', 
        guestEmail: 'james@email.com', 
        guestPhone: '+1 555-0101',
        guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', 
        roomNumber: '102', 
        roomCategory: 'Deluxe Suite',
        hotelName: 'LuxeStay Grand Palace' 
      },
      { 
        id: 'b2', 
        bookingReference: 'BK-2024-001235',
        guestId: 'g2', 
        roomId: 'r4', 
        hotelId: 'h1', 
        checkIn: '2024-01-20', 
        checkOut: '2024-01-25', 
        bookingtype: 'reservation',
        status: 'confirmed', 
        totalAmount: 1400, 
        paidAmount: 700, 
        createdAt: '2024-01-12', 
        updatedAt: '2024-01-12', 
        guestName: 'Sarah Johnson', 
        guestEmail: 'sarah@email.com', 
        guestPhone: '+1 555-0102',
        guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', 
        roomNumber: '202', 
        roomCategory: 'Premium Room',
        hotelName: 'LuxeStay Grand Palace' 
      },
      { 
        id: 'b3', 
        bookingReference: 'BK-2024-001236',
        guestId: 'g3', 
        roomId: 'r5', 
        hotelId: 'h1', 
        checkIn: '2024-01-22', 
        checkOut: '2024-01-24', 
        bookingtype: 'reservation',
        status: 'confirmed', 
        totalAmount: 900, 
        paidAmount: 900, 
        createdAt: '2024-01-14', 
        updatedAt: '2024-01-14', 
        guestName: 'Michael Chen', 
        guestEmail: 'michael@email.com', 
        guestPhone: '+1 555-0103',
        guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 
        roomNumber: '301', 
        roomCategory: 'Executive Suite',
        hotelName: 'LuxeStay Grand Palace' 
      },
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
 * GET /api/v3/bookings/getbooking/:id
 * Get single booking by ID
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Booking,
 *   message: string,
 *   status: number
 * }
 */
export async function getBookingById(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiGet<Booking>(`v3/bookings/getbooking/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * GET /api/v3/bookings/getbooking/reference/:reference
 * Get booking by reference number
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Booking,
 *   message: string,
 *   status: number
 * }
 */
export async function getBookingByReference(reference: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiGet<Booking>(`v3/bookings/getbooking/reference/${reference}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/v3/bookings/placebooking
 * Create new booking (direct check-in)
 * 
 * Request payload:
 * {
    "guestId": "17", integer
    "roomId": "4", integer
    "checkIn": "2026-01-20", date
    "checkOut": "2026-01-23", date
    "paidAmount": 100000, currency
    "paymentMethod": 2, integer
    "paymentStatus": 1, integer
    "totalAmount": 135000, currency
    "bookingtype": "Checked In" string
}
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     id: string,
 *     bookingReference: string,  // e.g., "BK-2024-001234"
 *     guestId: string,
 *     roomId: string,
 *     hotelId: string,
 *     checkIn: string,
 *     checkOut: string,
 *     bookingtype: 'check-in',
 *     status: 'checked-in',
 *     totalAmount: number,
 *     paidAmount: number,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: string,
 *   status: number
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 */
export async function createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
  try {
    return await apiPost<Booking>('v3/bookings/placebooking', { ...data, bookingtype: 'check-in' });
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { 
        ...data, 
        id: `b${Date.now()}`, 
        bookingReference: `BK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        hotelId: 'h1', 
        bookingtype: 'check-in',
        status: 'checked-in', 
        totalAmount: 0, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as Booking,
      message: 'Booking created successfully',
      status: 201,
    };
  }
}

/**
 * POST /api/v3/bookings/addreservation
 * Create new reservation (without immediate check-in)
 * 
 * Request payload:
 * {
 *   guestId: string,
 *   roomId: string,
 *   checkIn: string (YYYY-MM-DD),
 *   checkOut: string (YYYY-MM-DD),
 *   bookingtype: 'reservation'
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     id: string,
 *     bookingReference: string,
 *     guestId: string,
 *     roomId: string,
 *     hotelId: string,
 *     checkIn: string,
 *     checkOut: string,
 *     bookingtype: 'reservation',
 *     status: 'confirmed',
 *     totalAmount: number,
 *     paidAmount: 0,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function createReservation(data: CreateReservationRequest): Promise<ApiResponse<Booking>> {
  try {
    return await apiPost<Booking>('v3/bookings/addreservation', { ...data, bookingtype: 'reservation' });
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { 
        ...data, 
        id: `b${Date.now()}`, 
        bookingReference: `BK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        hotelId: 'h1', 
        bookingtype: 'reservation',
        status: 'confirmed', 
        paidAmount: 0, 
        totalAmount: 0, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      } as Booking,
      message: 'Reservation created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/v3/bookings/checkin/:id
 * Check in guest (for reservations)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     ...booking,
 *     status: 'checked-in'
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function checkIn(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`v3/bookings/checkin/${id}`);
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
 * PUT /api/v3/bookings/checkout/:id
 * Check out guest
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     ...booking,
 *     status: 'checked-out'
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function checkOut(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`v3/bookings/checkout/${id}`);
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
 * PUT /api/v3/bookings/cancel/:id
 * Cancel booking
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     ...booking,
 *     status: 'cancelled'
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function cancelBooking(id: string): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`v3/bookings/cancel/${id}`);
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
 * PUT /api/v3/bookings/extend/:id
 * Extend booking stay
 * 
 * Request payload:
 * {
 *   newCheckOut: string (YYYY-MM-DD),
 *   additionalPayment?: number
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     ...booking,
 *     checkOut: newCheckOut,
 *     totalAmount: updatedAmount,
 *     paidAmount: updatedPaidAmount
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function extendBooking(id: string, data: ExtendBookingRequest): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`v3/bookings/extend/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, checkOut: data.newCheckOut } as Booking,
      message: 'Booking extended successfully',
      status: 200,
    };
  }
}

/**
 * PUT /api/v3/bookings/update/:id
 * Update booking
 * 
 * Request payload: Partial<CreateBookingRequest>
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: Booking,
 *   message: string,
 *   status: number
 * }
 */
export async function updateBooking(id: string, data: Partial<CreateBookingRequest>): Promise<ApiResponse<Booking>> {
  try {
    return await apiPut<Booking>(`v3/bookings/update/${id}`, data);
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
 * DELETE /api/v3/bookings/delete/:id
 * Delete booking
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: null,
 *   message: string,
 *   status: number
 * }
 */
export async function deleteBooking(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`v3/bookings/delete/${id}`);
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
 * GET /api/v3/bookings/checkout-report/:id
 * Get checkout report for a booking
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     bookingId: string,
 *     bookingReference: string,
 *     guestName: string,
 *     guestEmail: string,
 *     guestPhone: string,
 *     roomNumber: string,
 *     roomCategory: string,
 *     hotelName: string,
 *     checkIn: string,
 *     checkOut: string,
 *     nights: number,
 *     roomCharges: number,
 *     restaurantCharges: number,
 *     laundryCharges: number,
 *     poolCharges: number,
 *     gymCharges: number,
 *     otherCharges: number,
 *     subtotal: number,
 *     tax: number,
 *     totalAmount: number,
 *     paidAmount: number,
 *     balance: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getCheckoutReport(id: string): Promise<ApiResponse<CheckoutReport>> {
  try {
    return await apiGet<CheckoutReport>(`v3/bookings/checkout-report/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        bookingId: id,
        bookingReference: 'BK-2024-001234',
        guestName: 'James Wilson',
        guestEmail: 'james@email.com',
        guestPhone: '+1 555-0101',
        roomNumber: '102',
        roomCategory: 'Deluxe Suite',
        hotelName: 'LuxeStay Grand Palace',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        nights: 3,
        roomCharges: 450,
        restaurantCharges: 125,
        laundryCharges: 45,
        poolCharges: 0,
        gymCharges: 0,
        otherCharges: 30,
        subtotal: 650,
        tax: 65,
        totalAmount: 715,
        paidAmount: 450,
        balance: 265,
      },
      message: 'Checkout report retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/bookings/stats
 * Get booking statistics
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     todayCheckIns: number,
 *     todayCheckOuts: number,
 *     pendingPayments: number,
 *     activeBookings: number,
 *     totalReservations: number,
 *     cancelledToday: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getBookingStats(): Promise<ApiResponse<{ 
  todayCheckIns: number; 
  todayCheckOuts: number; 
  pendingPayments: number; 
  activeBookings: number;
  totalReservations?: number;
  cancelledToday?: number;
}>> {
  try {
    return await apiGet('v3/bookings/stats');
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
        totalReservations: 15,
        cancelledToday: 2,
      },
      message: 'Booking stats retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/v3/bookings/guest/:guestId
 * Get all bookings for a specific guest
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
export async function getGuestBookings(guestId: string): Promise<ApiResponse<PaginatedResponse<Booking>>> {
  try {
    return await apiGet<PaginatedResponse<Booking>>(`v3/bookings/guest/${guestId}`);
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

export interface PaymentOption {
  id: number;
  name: string;
}

/**
 * Updated to return PaymentOption[] instead of string[]
 * This matches the actual JSON structure: [{ "id": 1, "name": "..." }]
 */
export async function getPaymentMethods(): Promise<ApiResponse<PaymentOption[]>> {
  // Pass the interface to the generic apiGet call
  return await apiGet<PaymentOption[]>('v3/bookings/paymentmethods');
}

export async function getPaymentStatuses(): Promise<ApiResponse<PaymentOption[]>> {
  // Pass the interface to the generic apiGet call
  return await apiGet<PaymentOption[]>('v3/bookings/paymentstatus');
}

/**
 * POST /api/v3/bookings/verify-payment
 * Verifies a transaction with the payment gateway and updates booking status
 */
export async function verifyBookingPayment(reference: string): Promise<ApiResponse<any>> {
  return await apiPost('v3/bookings/confirm-payment', { reference });
}

/**
 * POST /api/v3/bookings/generate-retry-reference
 * Takes an existing reference and returns a NEW one for a fresh Credo attempt
 */
export async function getRetryPaymentReference(bookingReference: string): Promise<ApiResponse<{ bookingReference: string }>> {
  return await apiPost('v3/bookings/generate-retry-reference', { bookingReference });
}