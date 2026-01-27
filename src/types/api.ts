// =====================================================
// API Response & Request Types
// =====================================================

// Standard API Response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  status: number;
}

// Login Response
export interface LoginResponse {
  userId: string;
  userName: string;
  email: string;
  token: string;
  roles: string[];
  permissions: string[];
  expiresIn: number;
  hotelId?: string;
  avatar?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// =====================================================
// Entity Types (matching database schema)
// =====================================================

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface RoomCategory {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  amenity: string | null;
}
export interface RoomImages{
  id: string;
  path: string;
}

export interface RoomCategoryUpdate {
  id: number;
  name: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  amenity: string;
  amenities: string;
  images: { id: number; path: string }[];
}

export interface Room {
  id?: string;
  hotelId?: string| null;
  categoryId: number| string;
  doorNumber: string;
  floor: number;
  price: string | number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'maintenance';
  image?: string | null;
  isPromoted: boolean | true;
  createdAt?: string| null;
  updatedAt?: string| null;
  // Joined fields for display
  categoryName?: string;
  hotelName?: string;
}

// In src/types/api.ts
export interface RoomInCategory {
  id: number;
  roomnumber: string; // matches your backend field name
  floor: number;
}

export interface RoomCategoryWithRooms {
  id: number;
  name: string;
  description: string;
  price: number;
  rooms: RoomInCategory[];
}

export interface Guest {
  id: string;
  hotelId?: string;

  // New guest fields (nullable/optional for backward compatibility)
  firstname?: string;
  lastname?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  countryLabel?: string;
  emailaddress?: string; // ← actual backend field
  phoneno?: string;  
  Email?: string;
  phone?: string;
  Phone?: string;
  identificationnumber?: string;
  identificationtype?: string;
  emergencycontactname?: string;
  emergencycontactphone?: string;
  accommodation?: string;
  checkindate?: string;
  checkoutdate?: string;
  roomids?: number[];

  // Legacy fields (kept for existing UI pieces)
  name?: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  totalStays?: number;
  totalSpent?: number;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Booking type values:
 * - 'check-in': Direct check-in booking
 * - 'reservation': Reserved booking pending check-in
 */
export type BookingType = 'check-in' | 'reservation';

/**
 * Booking status values:
 * - 'confirmed': Reservation confirmed, pending check-in
 * - 'checked-in': Guest has checked in
 * - 'checked-out': Guest has checked out
 * - 'cancelled': Booking was cancelled
 */
export type BookingStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Booking {
  id: string;
  bookingReference: string; // Unique reference number e.g., "BK-2024-001234"
  guestId: string;
  roomId: string;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  bookingtype: BookingType;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestAvatar?: string;
  roomNumber?: string;
  roomCategory?: string;
  hotelName?: string;
  paymentReference?: string;
  // Additional charges
  restaurantCharges?: number;
  laundryCharges?: number;
  otherCharges?: number;
}

export interface MenuItem {
  id: string;
  hotelId: string;
  name: string;
  category: 'food' | 'drink';
  price: number;
  description: string;
  inStock: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantOrder {
  id: string;
  hotelId: string;
  guestId?: string;
  customerName: string;
  roomId?: string;
  items: { menuItemId: string; name: string; quantity: number; price: number }[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'room-charge';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LaundryItem {
  id: string;
  hotelId: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface LaundryOrder {
  id: string;
  hotelId: string;
  guestId?: string;
  customerName: string;
  roomId?: string;
  items: { laundryItemId: string; name: string; quantity: number; price: number }[];
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentMethod: 'cash' | 'card' | 'room-charge';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventHall {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  hourlyRate: number;
  dailyRate: number;
  image: string;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  hotelId: string;
  hallId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  startDate: string;
  endDate: string;
  chargeType: 'hourly' | 'daily';
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Joined
  hallName?: string;
}

export interface GymMember {
  id: string;
  hotelId: string;
  guestId?: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PoolAccess {
  id: string;
  hotelId: string;
  guestId?: string;
  name: string;
  accessType: 'included' | 'paid';
  date: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  headId?: string;
  headName?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  hotelId: string;
  departmentId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  startDate: string;
  status: 'active' | 'on-leave' | 'terminated';
  avatar: string;
  createdAt: string;
  updatedAt: string;
  // Joined
  departmentName?: string;
}

export interface HotelAdmin {
  id: string;
  userId: string;
  hotelId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  // Joined
  hotelName?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  pendingPayments: number;
  activeGuests: number;
  upcomingReservations: number;
}

// Reports
export interface CheckoutReport {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber: string;
  roomCategory?: string;
  hotelName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCharges: number;
  restaurantCharges: number;
  laundryCharges: number;
  poolCharges?: number;
  gymCharges?: number;
  otherCharges: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
}

// =====================================================
// Request Payloads (for API calls)
// =====================================================

/**
 * POST /api/auth/login
 * Request payload for user login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/reset-password
 * Request payload for password reset
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * POST /api/auth/change-password
 * Request payload for changing password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /api/rooms
 * Request payload for creating a room
 * Note: hotelId is derived from authenticated user's hotel
 */
export interface CreateRoomRequest {
  doorNumber: string;
  floor: number;
  status: string;
  categoryId: number;
  isPromoted: boolean;
}

/**
 * PUT /api/rooms/:id
 * Request payload for updating a room
 */
export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  id: string;
}

/**
 * POST /api/room-categories
 * Request payload for creating room category
 */
export interface CreateRoomCategoryRequest {
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string;
  amenity?: string;
  files?: File[];
}

/**
 * POST /api/guests
 * Request payload for creating/updating guest (new schema)
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
 *   accommodation?: string,
 *   checkindate?: string,
 *   checkoutdate?: string,
 *   roomids?: number[]
 * }
 */
export interface CreateGuestRequest {
  firstname: string;
  lastname: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  Email: string;
  phone: string;
  identificationnumber: string;
  identificationtype: string;
  emergencycontactname: string;
  emergencycontactphone: string;
  accommodation?: string;
  checkindate?: string;
  checkoutdate?: string;
  roomids?: number[];
}

export interface UpdateGuestRequest extends Partial<CreateGuestRequest> {
  id: string;
}

/**
 * POST /api/v3/bookings/addbooking
 * Request payload for creating booking (check-in)
 * 
 * Request: {
 *   guestId: string,
 *   roomId: string,
 *   checkIn: string (YYYY-MM-DD),
 *   checkOut: string (YYYY-MM-DD),
 *   paidAmount: number,
 *   bookingType: 'check-in'
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: Booking,
 *   message: string,
 *   status: number
 * }
 */
export interface CreateBookingRequest {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  paidAmount: number;
  bookingType?: BookingType;
}

/**
 * POST /api/v3/bookings/addreservation
 * Request payload for creating reservation
 * 
 * Request: {
 *   guestId: string,
 *   roomId: string,
 *   checkIn: string (YYYY-MM-DD),
 *   checkOut: string (YYYY-MM-DD),
 *   bookingType: 'reservation'
 * }
 */
export interface CreateReservationRequest {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  bookingType?: BookingType;
}

/**
 * PUT /api/v3/bookings/extend/:id
 * Request payload for extending a booking stay
 * 
 * Request: {
 *   newCheckOut: string (YYYY-MM-DD),
 *   additionalPayment?: number
 * }
 */
export interface ExtendBookingRequest {
  newCheckOut: string;
  additionalPayment?: number;
}

/**
 * POST /api/restaurant/orders
 * Request payload for creating restaurant order
 */
export interface CreateRestaurantOrderRequest {
  guestId?: string;
  customerName: string;
  roomId?: string;
  items: { menuItemId: string; quantity: number }[];
  paymentMethod: 'cash' | 'card' | 'room-charge';
}

/**
 * POST /api/laundry/orders
 * Request payload for creating laundry order
 */
export interface CreateLaundryOrderRequest {
  guestId?: string;
  customerName: string;
  roomId?: string;
  items: { laundryItemId: string; quantity: number }[];
  paymentMethod: 'cash' | 'card' | 'room-charge';
}

/**
 * POST /api/events
 * Request payload for creating event
 */
export interface CreateEventRequest {
  hallId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  startDate: string;
  endDate: string;
  chargeType: 'hourly' | 'daily';
}

/**
 * POST /api/gym/members
 * Request payload for creating gym member
 */
export interface CreateGymMemberRequest {
  guestId?: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  isGuest: boolean;
}

/**
 * POST /api/pool/access
 * Request payload for recording pool access
 */
export interface CreatePoolAccessRequest {
  guestId?: string;
  name: string;
  accessType: 'included' | 'paid';
  amount?: number;
}

/**
 * POST /api/departments
 * Request payload for creating department
 */
export interface CreateDepartmentRequest {
  name: string;
  description: string;
  headId?: string;
}

/**
 * POST /api/employees
 * Request payload for creating employee
 */
export interface CreateEmployeeRequest {
  departmentId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  startDate: string;
}

/**
 * POST /api/hotel-admins
 * Request payload for creating hotel admin
 */
export interface CreateHotelAdminRequest {
  hotelId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Guest Services - for Guest Details Page
export interface GuestBooking extends Booking {
  // Additional booking details for guest view
}

export interface GuestRestaurantOrder extends RestaurantOrder {
  // Restaurant orders for this guest
}

export interface GuestLaundryOrder extends LaundryOrder {
  // Laundry orders for this guest
}

/**
 * GET /api/v3/guests/:id/services
 * Response for guest services (bookings, restaurant, laundry)
 */
export interface GuestServicesResponse {
  bookings: GuestBooking[];
  restaurantOrders: GuestRestaurantOrder[];
  laundryOrders: GuestLaundryOrder[];
}
