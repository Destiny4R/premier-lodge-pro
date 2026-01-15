import { apiGet, apiPost } from '@/lib/api';
import { ApiResponse, Room, RoomCategory, PaginatedResponse, PaginationParams } from '@/types/api';

// =====================================================
// Public Service - Handles public-facing API calls (no auth required)
// =====================================================

export interface PublicRoom extends Omit<Room, 'status'> {
  categoryName: string;
  hotelName: string;
  hotelCity: string;
  amenities: string[];
  status: 'Available' | 'Occupied' | 'Reserved' | 'maintenance';
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

export interface Amenity {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'connectivity' | 'dining' | 'wellness' | 'services';
  isActive: boolean;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  ticketNumber: string;
  status: 'received' | 'in_progress' | 'resolved';
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
 *         doorNumber: string,
 *         floor: number,
 *         price: number,            // Price in Nigerian Naira (₦)
 *         status: 'Available',
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
  try {
    return await apiGet<PaginatedResponse<PublicRoom>>('/public/rooms', params);
  } catch (error) {
    // Mock response for demo - prices in Nigerian Naira
    console.warn('API not available, using mock response');
    const mockRooms: PublicRoom[] = [
      {
        id: 'r1',
        doorNumber: '101',
        floor: 1,
        price: 75000,
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
        isPromoted: true,
        categoryId: '1',
        categoryName: 'Deluxe Suite',
        hotelId: 'h1',
        hotelName: 'Premier Lodge',
        hotelCity: 'Lagos',
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Room Service'],
      },
      {
        id: 'r2',
        doorNumber: '202',
        floor: 2,
        price: 95000,
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
        isPromoted: false,
        categoryId: '2',
        categoryName: 'Premium Room',
        hotelId: 'h1',
        hotelName: 'Premier Lodge',
        hotelCity: 'Lagos',
        amenities: ['WiFi', 'TV', 'Balcony'],
      },
      {
        id: 'r3',
        doorNumber: '301',
        floor: 3,
        price: 150000,
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
        isPromoted: true,
        categoryId: '3',
        categoryName: 'Executive Suite',
        hotelId: 'h1',
        hotelName: 'Premier Lodge',
        hotelCity: 'Lagos',
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Room Service', 'Jacuzzi'],
      },
    ];
    
    return {
      success: true,
      data: {
        items: mockRooms,
        totalItems: mockRooms.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Rooms retrieved successfully',
      status: 200,
    };
  }
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
 * GET /api/public/amenities
 * Get all hotel amenities for public display
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     items: [
 *       {
 *         id: string,
 *         name: string,
 *         description: string,
 *         icon: string,              // Icon name (e.g., "wifi", "utensils", "dumbbell")
 *         category: 'connectivity' | 'dining' | 'wellness' | 'services',
 *         isActive: boolean
 *       }
 *     ],
 *     totalItems: number
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getPublicAmenities(): Promise<ApiResponse<PaginatedResponse<Amenity>>> {
  try {
    return await apiGet<PaginatedResponse<Amenity>>('/public/amenities');
  } catch (error) {
    // Mock response
    const mockAmenities: Amenity[] = [
      { id: '1', name: 'High-Speed WiFi', description: 'Complimentary high-speed internet', icon: 'wifi', category: 'connectivity', isActive: true },
      { id: '2', name: 'Fine Dining', description: 'Award-winning restaurant', icon: 'utensils', category: 'dining', isActive: true },
      { id: '3', name: 'Fitness Center', description: '24/7 gym access', icon: 'dumbbell', category: 'wellness', isActive: true },
      { id: '4', name: 'Swimming Pool', description: 'Olympic-sized pool', icon: 'waves', category: 'wellness', isActive: true },
    ];
    
    return {
      success: true,
      data: { items: mockAmenities, totalItems: mockAmenities.length, totalPages: 1, currentPage: 1, pageSize: 10 },
      message: 'Amenities retrieved successfully',
      status: 200,
    };
  }
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
 *     totalAmount: number,       // Amount in Nigerian Naira (₦)
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

/**
 * POST /api/public/contact
 * Submit a contact form message
 * 
 * Request payload:
 * {
 *   name: string,
 *   email: string,
 *   phone?: string,
 *   subject: string,
 *   message: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     id: string,
 *     ticketNumber: string,      // e.g., "TKT-2024-001234"
 *     status: 'received',
 *     createdAt: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function submitContactForm(data: ContactRequest): Promise<ApiResponse<ContactResponse>> {
  try {
    return await apiPost<ContactResponse>('/public/contact', data);
  } catch (error) {
    // Mock response
    return {
      success: true,
      data: {
        id: 'c1',
        ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
        status: 'received',
        createdAt: new Date().toISOString(),
      },
      message: 'Message sent successfully',
      status: 201,
    };
  }
}

export const publicService = {
  getPublicRooms,
  getPublicRoomById,
  getPublicRoomCategories,
  getPublicAmenities,
  createPublicBooking,
  getPublicBookingByReference,
  submitContactForm,
};
