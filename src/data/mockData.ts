// Mock data for the Hotel Management System

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string;
}

export interface Room {
  id: string;
  hotelId: string;
  categoryId: string;
  doorNumber: string;
  floor: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  image: string;
  isPromoted: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  address: string;
  totalStays: number;
  totalSpent: number;
  avatar: string;
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
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'food' | 'drink';
  price: number;
  description: string;
  inStock: boolean;
  image: string;
}

export interface LaundryOrder {
  id: string;
  guestId: string | null;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  status: 'received' | 'processing' | 'ready' | 'delivered';
  paymentMethod: 'cash' | 'card' | 'room-charge';
  roomId?: string;
  totalAmount: number;
  createdAt: string;
}

export interface Event {
  id: string;
  hallId: string;
  clientName: string;
  eventType: string;
  startDate: string;
  endDate: string;
  chargeType: 'hourly' | 'daily';
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface GymMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  isGuest: boolean;
}

export interface PoolAccess {
  id: string;
  guestId: string | null;
  name: string;
  accessType: 'included' | 'paid';
  date: string;
  amount: number;
}

// Mock Hotels
export const hotels: Hotel[] = [
  {
    id: 'h1',
    name: 'LuxeStay Grand Palace',
    city: 'New York',
    address: '123 Fifth Avenue, Manhattan',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    rating: 4.9,
    status: 'active',
  },
  {
    id: 'h2',
    name: 'LuxeStay Marina Bay',
    city: 'Miami',
    address: '456 Ocean Drive, Miami Beach',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    rating: 4.8,
    status: 'active',
  },
  {
    id: 'h3',
    name: 'LuxeStay Mountain Retreat',
    city: 'Aspen',
    address: '789 Alpine Road, Aspen',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    rating: 4.7,
    status: 'active',
  },
];

// Mock Room Categories
export const roomCategories: RoomCategory[] = [
  {
    id: 'rc1',
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities',
    basePrice: 150,
    maxOccupancy: 2,
    amenities: 'WiFi, TV, Air Conditioning, Mini Bar',
  },
  {
    id: 'rc2',
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities and city view',
    basePrice: 280,
    maxOccupancy: 3,
    amenities: 'WiFi, Smart TV, Air Conditioning, Mini Bar, City View, Work Desk',
  },
  {
    id: 'rc3',
    name: 'Executive Suite',
    description: 'Luxury suite with separate living area',
    basePrice: 450,
    maxOccupancy: 4,
    amenities: 'WiFi, Smart TV, Air Conditioning, Full Bar, City View, Living Room, Jacuzzi',
  },
  {
    id: 'rc4',
    name: 'Presidential Suite',
    description: 'Ultimate luxury with panoramic views and butler service',
    basePrice: 850,
    maxOccupancy: 6,
    amenities: 'WiFi, Smart TV, Air Conditioning, Full Bar, Panoramic View, Living Room, Jacuzzi, Butler Service, Private Dining',
  },
];

// Mock Rooms
export const rooms: Room[] = [
  { id: 'r1', hotelId: 'h1', categoryId: 'rc1', doorNumber: '101', floor: 1, status: 'available', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false },
  { id: 'r2', hotelId: 'h1', categoryId: 'rc1', doorNumber: '102', floor: 1, status: 'occupied', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false },
  { id: 'r3', hotelId: 'h1', categoryId: 'rc2', doorNumber: '201', floor: 2, status: 'available', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true },
  { id: 'r4', hotelId: 'h1', categoryId: 'rc2', doorNumber: '202', floor: 2, status: 'reserved', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: false },
  { id: 'r5', hotelId: 'h1', categoryId: 'rc3', doorNumber: '301', floor: 3, status: 'available', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: true },
  { id: 'r6', hotelId: 'h1', categoryId: 'rc4', doorNumber: '401', floor: 4, status: 'available', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600', isPromoted: true },
  { id: 'r7', hotelId: 'h2', categoryId: 'rc1', doorNumber: '101', floor: 1, status: 'available', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false },
  { id: 'r8', hotelId: 'h2', categoryId: 'rc2', doorNumber: '201', floor: 2, status: 'available', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true },
  { id: 'r9', hotelId: 'h3', categoryId: 'rc3', doorNumber: '201', floor: 2, status: 'available', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: false },
];

// Mock Guests
export const guests: Guest[] = [
  { id: 'g1', name: 'James Wilson', email: 'james@email.com', phone: '+1 555-0101', idType: 'Passport', idNumber: 'AB123456', address: '123 Main St, NY', totalStays: 5, totalSpent: 4500, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
  { id: 'g2', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1 555-0102', idType: 'Driver License', idNumber: 'DL789012', address: '456 Oak Ave, LA', totalStays: 3, totalSpent: 2800, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { id: 'g3', name: 'Michael Chen', email: 'michael@email.com', phone: '+1 555-0103', idType: 'Passport', idNumber: 'CD345678', address: '789 Pine Rd, SF', totalStays: 8, totalSpent: 12500, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
];

// Mock Bookings
export const bookings: Booking[] = [
  { id: 'b1', guestId: 'g1', roomId: 'r2', hotelId: 'h1', checkIn: '2024-01-15', checkOut: '2024-01-18', status: 'checked-in', totalAmount: 450, paidAmount: 450, createdAt: '2024-01-10' },
  { id: 'b2', guestId: 'g2', roomId: 'r4', hotelId: 'h1', checkIn: '2024-01-20', checkOut: '2024-01-25', status: 'confirmed', totalAmount: 1400, paidAmount: 700, createdAt: '2024-01-12' },
  { id: 'b3', guestId: 'g3', roomId: 'r5', hotelId: 'h1', checkIn: '2024-01-22', checkOut: '2024-01-24', status: 'confirmed', totalAmount: 900, paidAmount: 900, createdAt: '2024-01-14' },
];

// Mock Menu Items
export const menuItems: MenuItem[] = [
  { id: 'm1', name: 'Grilled Salmon', category: 'food', price: 32, description: 'Atlantic salmon with herb butter', inStock: true, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300' },
  { id: 'm2', name: 'Wagyu Steak', category: 'food', price: 85, description: 'Premium A5 Wagyu with truffle', inStock: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300' },
  { id: 'm3', name: 'Caesar Salad', category: 'food', price: 18, description: 'Classic caesar with parmesan', inStock: true, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=300' },
  { id: 'm4', name: 'Signature Cocktail', category: 'drink', price: 16, description: 'House special blend', inStock: true, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300' },
  { id: 'm5', name: 'Aged Wine', category: 'drink', price: 45, description: '2018 Bordeaux Reserve', inStock: true, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300' },
];

// Mock Laundry Orders
export const laundryOrders: LaundryOrder[] = [
  { id: 'l1', guestId: 'g1', customerName: 'James Wilson', items: [{ name: 'Shirts', quantity: 3, price: 15 }, { name: 'Pants', quantity: 2, price: 20 }], status: 'processing', paymentMethod: 'room-charge', roomId: 'r2', totalAmount: 65, createdAt: '2024-01-16' },
  { id: 'l2', guestId: null, customerName: 'External Customer', items: [{ name: 'Suits', quantity: 2, price: 50 }], status: 'ready', paymentMethod: 'cash', totalAmount: 100, createdAt: '2024-01-15' },
];

// Mock Events
export const events: Event[] = [
  { id: 'e1', hallId: 'hall1', clientName: 'Tech Corp', eventType: 'Conference', startDate: '2024-01-25', endDate: '2024-01-26', chargeType: 'daily', totalAmount: 5000, status: 'upcoming' },
  { id: 'e2', hallId: 'hall2', clientName: 'Wedding Party', eventType: 'Wedding', startDate: '2024-02-14', endDate: '2024-02-14', chargeType: 'daily', totalAmount: 8000, status: 'upcoming' },
];

// Mock Gym Members
export const gymMembers: GymMember[] = [
  { id: 'gym1', name: 'Alex Thompson', email: 'alex@email.com', phone: '+1 555-0201', membershipType: 'premium', startDate: '2024-01-01', endDate: '2024-06-30', status: 'active', isGuest: false },
  { id: 'gym2', name: 'James Wilson', email: 'james@email.com', phone: '+1 555-0101', membershipType: 'basic', startDate: '2024-01-15', endDate: '2024-01-18', status: 'active', isGuest: true },
];

// Dashboard Stats
export const dashboardStats = {
  totalRooms: 156,
  occupiedRooms: 89,
  availableRooms: 52,
  maintenanceRooms: 15,
  todayCheckIns: 12,
  todayCheckOuts: 8,
  totalRevenue: 145680,
  pendingPayments: 23450,
  activeGuests: 89,
  upcomingReservations: 34,
};

// User Roles
export type UserRole = 
  |"super-admin"
  |"sub-admin"
  |"manager"
  |"receptionist"
  |"gym-head"
  |"laundry-staff"
  |"event-manager"
  |"restaurant-staff"
  |"store-keeper";

// export type UserRole = 
//   | 'Super Admin'
//   | 'Sub Admin'
//   | 'Manager'
//   | 'Receptionist'
//   | 'Gym Head'
//   | 'Dry Cleaner'
//   | 'Restaurant Bar';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hotelId?: string;
  avatar: string;
}

export const currentUser: User = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@luxestay.com',
  role: 'sub-admin',
  hotelId: 'h1',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
};

// Event Halls
export const eventHalls = [
  { id: 'hall1', name: 'Grand Ballroom', capacity: 500, hourlyRate: 500, dailyRate: 3500 },
  { id: 'hall2', name: 'Executive Conference Room', capacity: 50, hourlyRate: 150, dailyRate: 1000 },
  { id: 'hall3', name: 'Garden Terrace', capacity: 200, hourlyRate: 300, dailyRate: 2000 },
];
