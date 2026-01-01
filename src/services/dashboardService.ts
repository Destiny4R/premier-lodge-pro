import { apiGet } from '@/lib/api';
import { ApiResponse, DashboardStats } from '@/types/api';

// =====================================================
// Dashboard Service - Handles dashboard-related API calls
// =====================================================

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    return await apiGet<DashboardStats>('/dashboard/stats');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
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
      },
      message: 'Dashboard stats retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/dashboard/weekly-revenue
 * Get weekly revenue data for charts
 */
export async function getWeeklyRevenue(): Promise<ApiResponse<{ day: string; revenue: number; bookings: number }[]>> {
  try {
    return await apiGet('/dashboard/weekly-revenue');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: [
        { day: 'Mon', revenue: 12500, bookings: 24 },
        { day: 'Tue', revenue: 15800, bookings: 32 },
        { day: 'Wed', revenue: 14200, bookings: 28 },
        { day: 'Thu', revenue: 18500, bookings: 36 },
        { day: 'Fri', revenue: 22000, bookings: 45 },
        { day: 'Sat', revenue: 28500, bookings: 58 },
        { day: 'Sun', revenue: 24000, bookings: 48 },
      ],
      message: 'Weekly revenue retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/dashboard/service-revenue
 * Get revenue by service for pie chart
 */
export async function getServiceRevenue(): Promise<ApiResponse<{ name: string; value: number }[]>> {
  try {
    return await apiGet('/dashboard/service-revenue');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: [
        { name: 'Rooms', value: 45 },
        { name: 'Restaurant', value: 28 },
        { name: 'Events', value: 15 },
        { name: 'Other', value: 12 },
      ],
      message: 'Service revenue retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/dashboard/recent-bookings
 * Get recent bookings for dashboard
 */
export async function getRecentBookings(): Promise<ApiResponse<{
  id: string;
  guestName: string;
  guestAvatar: string;
  roomNumber: string;
  status: string;
  checkIn: string;
  checkOut: string;
}[]>> {
  try {
    return await apiGet('/dashboard/recent-bookings');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: [
        { id: 'b1', guestName: 'James Wilson', guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', roomNumber: '102', status: 'checked-in', checkIn: '2024-01-15', checkOut: '2024-01-18' },
        { id: 'b2', guestName: 'Sarah Johnson', guestAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', roomNumber: '202', status: 'confirmed', checkIn: '2024-01-20', checkOut: '2024-01-25' },
        { id: 'b3', guestName: 'Michael Chen', guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', roomNumber: '301', status: 'confirmed', checkIn: '2024-01-22', checkOut: '2024-01-24' },
      ],
      message: 'Recent bookings retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/dashboard/room-status
 * Get room status summary
 */
export async function getRoomStatus(): Promise<ApiResponse<{
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}>> {
  try {
    return await apiGet('/dashboard/room-status');
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: {
        available: 52,
        occupied: 89,
        reserved: 34,
        maintenance: 15,
      },
      message: 'Room status retrieved successfully',
      status: 200,
    };
  }
}
