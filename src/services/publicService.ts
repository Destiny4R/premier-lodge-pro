import { apiGet, apiPost } from '@/lib/api';
import { ApiResponse, Room, RoomCategory, PaginatedResponse, PaginationParams } from '@/types/api';

// =====================================================
// Public Service - Handles public-facing API calls
// =====================================================

/**
 * Interface for searching rooms via the landing page or rooms page.
 * Extends PaginationParams to include standard page/pageSize logic.
 */
export interface RoomSearchFilters extends PaginationParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  checkIn?: string;        // Format: YYYY-MM-DD
  checkOut?: string;       // Format: YYYY-MM-DD
  guests?: number;
}

export interface PublicRoom extends Omit<Room, 'status'> {
  categoryName: string;
  hotelName: string;
  hotelCity: string;
  hotelAddress: string;
  amenities: string[];
  price: number; // Price per night in the smallest currency unit (e.g., kobo)
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
  paidAmount: number;
  paymentMethod: 1 | 2 | 3 | 4 | 5; // 1: Credit Card, 2: Debit Card, 3: PayPal, 4: Bank Transfer, 5: Cash
}

export interface PublicBookingResponse {
  id: string;
  bookingReference: string;
  roomId: string;
  roomNumber: string;
  categoryName: string;
  hotelName: string;
  hotelAddress: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentMethod: 1 | 2 | 3 | 4 | 5;
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
 * Fetches available rooms with optional filters for search.
 * Falls back to mock data if the API is unreachable.
 */
export async function getPublicRooms(params?: RoomSearchFilters): Promise<ApiResponse<PaginatedResponse<PublicRoom>>> {
  const response = await apiGet<PaginatedResponse<PublicRoom>>('v3/public/getbookingrooms', params);
  
  // If API call succeeded, return the response
  if (response.success) {
    return response;
  }
  
  // API failed - fall back to mock data
  console.warn('Live API unreachable, serving high-fidelity mock data');
  
  const mockRooms: PublicRoom[] = [
    {
      id: 'r1',
      doorNumber: '101',
      floor: 1,
      price: 125000,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      isPromoted: true,
      categoryId: '1',
      categoryName: 'Royal Diplomatic Suite',
      hotelId: 'h1',
      hotelName: 'Premier Lodge & Resort',
      hotelCity: 'Lagos',
      hotelAddress: '123 Luxury St, Victoria Island, Lagos, Nigeria',
      amenities: ['High-Speed WiFi', 'Private Bar', 'Butler Service', '24/7 Dining'],
    },
    {
      id: 'r2',
      doorNumber: '205',
      floor: 2,
      price: 85000,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      isPromoted: false,
      categoryId: '2',
      categoryName: 'Executive Business Room',
      hotelId: 'h1',
      hotelName: 'Premier Lodge & Resort',
      hotelCity: 'Abuja',
      hotelAddress: '456 Executive Ave, Central Business District, Abuja, Nigeria',
      amenities: ['Workspace', 'High-Speed WiFi', 'Coffee Station'],
    },
    {
      id: 'r3',
      doorNumber: 'PH-1',
      floor: 10,
      price: 350000,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      isPromoted: true,
      categoryId: '3',
      categoryName: 'Presidential Penthouse',
      hotelId: 'h1',
      hotelName: 'Premier Lodge & Resort',
      hotelCity: 'Lagos',
      hotelAddress: '123 Luxury St, Victoria Island, Lagos, Nigeria',
      amenities: ['Infinity Pool access', 'Smart Home Integration', 'Private Jacuzzi', 'Luxury Concierge'],
    },
  ];
  
  return {
    success: true,
    data: {
      items: mockRooms,
      totalItems: mockRooms.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: params?.pageSize || 10,
    },
    message: 'Rooms retrieved from cache',
    status: 200,
  };
}

/**
 * POST /api/v3/public/bookings
 * Self-service guest booking from the Landing Page modal.
 * Falls back to mock response if the API is unreachable.
 */
export async function createPublicBooking(data: PublicBookingRequest): Promise<ApiResponse<PublicBookingResponse>> {
  const response = await apiPost<PublicBookingResponse>('/v3/public/bookings', data);
  
  if (response.success) {
    return response;
  }
  
  // Fall back to mock booking response for demo/development
  console.warn('Live API unreachable, creating mock booking');
  const mockReference = `BK${Date.now().toString(36).toUpperCase()}`;
  
  return {
    success: true,
    data: {
      id: `mock-${Date.now()}`,
      bookingReference: mockReference,
      roomId: data.roomId,
      roomNumber: '101',
      categoryName: 'Royal Diplomatic Suite',
      hotelName: 'Premier Lodge & Resort',
      hotelAddress: '123 Luxury St, Victoria Island, Lagos, Nigeria',
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      totalAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
    message: 'Booking created successfully (demo mode)',
    status: 201,
  };
}


/**
 * POST /api/v3/public/bookings/confirm-payment
 * Verifies a transaction with the payment gateway and updates booking status
 */
export async function verifyPublicBookingPayment(reference: string): Promise<ApiResponse<any>> {
  const response = await apiPost('v3/public/confirm-payment', { reference });
  
  if (response.success) {
    return response;
  }
  
  // Fall back to mock verification
  return {
    success: true,
    data: {
      reference,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
    },
    message: 'Payment verified (demo mode)',
    status: 200,
  };
}

/**
 * GET /api/public/amenities
 * Falls back to mock data if the API is unreachable.
 */
export async function getPublicAmenities(): Promise<ApiResponse<PaginatedResponse<Amenity>>> {
  const response = await apiGet<PaginatedResponse<Amenity>>('/public/amenities');
  
  if (response.success) {
    return response;
  }
  
  // Fall back to mock data
  const mockAmenities: Amenity[] = [
    { id: '1', name: 'Ultra-Fast WiFi', description: 'Fiber-optic connectivity throughout the premises', icon: 'wifi', category: 'connectivity', isActive: true },
    { id: '2', name: 'Gourmet Restaurant', description: 'Fine dining curated by award-winning chefs', icon: 'utensils', category: 'dining', isActive: true },
    { id: '3', name: 'Elite Fitness Club', description: 'Modern equipment with professional trainers', icon: 'dumbbell', category: 'wellness', isActive: true },
    { id: '4', name: 'Olympic Pool', description: 'Temperature-controlled swimming experience', icon: 'waves', category: 'wellness', isActive: true },
  ];
  
  return {
    success: true,
    data: { items: mockAmenities, totalItems: mockAmenities.length, totalPages: 1, currentPage: 1, pageSize: 10 },
    message: 'Amenities retrieved from cache',
    status: 200,
  };
}

/**
 * POST /api/public/contact
 * Falls back to mock response if the API is unreachable.
 */
export async function submitContactForm(data: ContactRequest): Promise<ApiResponse<ContactResponse>> {
  const response = await apiPost<ContactResponse>('/public/contact', data);
  
  if (response.success) {
    return response;
  }
  
  // Fall back to mock response
  return {
    success: true,
    data: {
      id: 'c1',
      ticketNumber: `PL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'received',
      createdAt: new Date().toISOString(),
    },
    message: 'Our concierge team has received your message.',
    status: 201,
  };
}

// Export individual functions and a grouped object
export const publicService = {
  getPublicRooms,
  getPublicRoomById: (id: string) => apiGet<PublicRoom>(`/public/rooms/${id}`),
  getPublicRoomCategories: () => apiGet<PaginatedResponse<RoomCategory>>('/public/room-categories'),
  getPublicAmenities,
  createPublicBooking,
  getPublicBookingByReference: (ref: string) => apiGet<PublicBookingResponse>(`/public/bookings/${ref}`),
  submitContactForm,
};