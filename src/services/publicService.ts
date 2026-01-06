import { apiGet, apiPost } from '@/lib/api';
import { ApiResponse, Room, RoomCategory, PaginatedResponse, PaginationParams } from '@/types/api';

// =====================================================
// Public Service - Handles public-facing API calls (no auth required)
// =====================================================

export interface PublicRoom extends Room {
  categoryName: string;
  hotelName: string;
  hotelCity: string;
  amenities: string[];
}

export interface PublicBookingRequest {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface PublicBookingResponse {
  id: string;
  bookingReference: string;
  roomId: string;
  roomNumber: string;
  categoryName: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

/**
 * GET /api/public/rooms
 * Get all available rooms for public viewing (no authentication required)
 * 
 * Query params:
 * {
 *   page?: number,
 *   pageSize?: number,
 *   city?: string,           // Filter by city
 *   minPrice?: number,       // Minimum price filter
 *   maxPrice?: number,       // Maximum price filter
 *   categoryId?: string,     // Filter by room category
 *   checkIn?: string,        // Check availability from date (YYYY-MM-DD)
 *   checkOut?: string,       // Check availability to date (YYYY-MM-DD)
 *   guests?: number          // Number of guests (filters by maxOccupancy)
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     items: [
 *       {
 *         id: string,
 *         roomNumber: string,
 *         floor: number,
 *         price: number,
 *         status: 'available',
 *         image: string,
 *         isPromoted: boolean,
 *         categoryId: string,
 *         categoryName: string,
 *         hotelId: string,
 *         hotelName: string,
 *         hotelCity: string,
 *         amenities: string[]
 *       }
 *     ],
 *     totalItems: number,
 *     totalPages: number,
 *     currentPage: number,
 *     pageSize: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getPublicRooms(params?: PaginationParams & {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}): Promise<ApiResponse<PaginatedResponse<PublicRoom>>> {
  return await apiGet<PaginatedResponse<PublicRoom>>('/public/rooms', params);
}

/**
 * GET /api/public/rooms/:id
 * Get single room details for public viewing
 * 
 * Response: {
 *   success: boolean,
 *   data: PublicRoom,
 *   message: string,
 *   status: number
 * }
 */
export async function getPublicRoomById(id: string): Promise<ApiResponse<PublicRoom>> {
  return await apiGet<PublicRoom>(`/public/rooms/${id}`);
}

/**
 * GET /api/public/room-categories
 * Get all room categories for public display
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     items: RoomCategory[],
 *     totalItems: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getPublicRoomCategories(): Promise<ApiResponse<PaginatedResponse<RoomCategory>>> {
  return await apiGet<PaginatedResponse<RoomCategory>>('/public/room-categories');
}

/**
 * POST /api/public/bookings
 * Create a new booking (public - for guest self-booking)
 * 
 * Request payload:
 * {
 *   roomId: string,
 *   guestName: string,
 *   guestEmail: string,
 *   guestPhone: string,
 *   checkInDate: string,      // Format: YYYY-MM-DD
 *   checkOutDate: string,     // Format: YYYY-MM-DD
 *   numberOfGuests: number,
 *   specialRequests?: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     id: string,
 *     bookingReference: string,  // e.g., "BK-2024-001234"
 *     roomId: string,
 *     roomNumber: string,
 *     categoryName: string,
 *     hotelName: string,
 *     guestName: string,
 *     guestEmail: string,
 *     checkInDate: string,
 *     checkOutDate: string,
 *     totalAmount: number,
 *     status: 'pending',
 *     createdAt: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function createPublicBooking(data: PublicBookingRequest): Promise<ApiResponse<PublicBookingResponse>> {
  return await apiPost<PublicBookingResponse>('/public/bookings', data);
}

/**
 * GET /api/public/bookings/:reference
 * Get booking by reference number (for guest to check their booking)
 * 
 * Response: {
 *   success: boolean,
 *   data: PublicBookingResponse,
 *   message: string,
 *   status: number
 * }
 */
export async function getPublicBookingByReference(reference: string): Promise<ApiResponse<PublicBookingResponse>> {
  return await apiGet<PublicBookingResponse>(`/public/bookings/${reference}`);
}

export const publicService = {
  getPublicRooms,
  getPublicRoomById,
  getPublicRoomCategories,
  createPublicBooking,
  getPublicBookingByReference,
};
