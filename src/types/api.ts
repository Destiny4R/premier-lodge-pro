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
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  categoryId: string;
  roomNumber: string;
  floor: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  price: number;
  image: string;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  categoryName?: string;
  hotelName?: string;
}

export interface Guest {
  id: string;
  hotelId: string;
  name: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  address: string;
  totalStays: number;
  totalSpent: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  // Joined fields for display
  guestName?: string;
  guestEmail?: string;
  guestAvatar?: string;
  roomNumber?: string;
  hotelName?: string;
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
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  roomCharges: number;
  restaurantCharges: number;
  laundryCharges: number;
  otherCharges: number;
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
  categoryId: string;
  roomNumber: string;
  floor: number;
  price: number;
  status: 'available' | 'maintenance';
  isPromoted: boolean;
  image?: string;
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
  amenities: string[];
  images?: File[];
}

/**
 * POST /api/guests
 * Request payload for creating guest
 */
export interface CreateGuestRequest {
  name: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  address: string;
  avatar?: string;
}

/**
 * POST /api/bookings
 * Request payload for creating booking
 */
export interface CreateBookingRequest {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  paidAmount: number;
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
}

/**
 * POST /api/hotel-admins
 * Request payload for creating hotel admin (sub-admin)
 */
export interface CreateHotelAdminRequest {
  hotelId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * PUT /api/profile
 * Request payload for updating user profile
 */
export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

/**
 * POST /api/departments
 * Request payload for creating department
 */
export interface CreateDepartmentRequest {
  name: string;
  description: string;
  headId?: string;
  status: 'active' | 'inactive';
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
  avatar?: string;
}
