import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  ApiResponse,
  LaundryOrder,
  LaundryItem,
  PaginationParams,
  PaginatedResponse,
  CreateLaundryOrderRequest,
  CreateLaundryGuestOrderRequest,
  CreateLaundryVisitorOrderRequest
} from '@/types/api';

// =====================================================
// Laundry Service - Handles laundry-related API calls
// =====================================================

// ==== ENDPOINTS ====
// Base URL: Replace with your API base URL (e.g., https://api.yourhotel.com)
// 
// GET    /api/laundry/orders                - List all laundry orders
// GET    /api/laundry/orders/:id            - Get single order
// POST   /api/laundry/orders                - Create new order (legacy)
// POST   /api/laundry/orders/guest          - Create order for hotel guest (room charge)
// POST   /api/laundry/orders/visitor        - Create order for walk-in visitor
// PUT    /api/laundry/orders/:id            - Update order
// PUT    /api/laundry/orders/:id/status     - Update order status
// DELETE /api/laundry/orders/:id            - Delete order
// GET    /api/laundry/items                 - List all clothing categories
// POST   /api/laundry/items                 - Create clothing category
// PUT    /api/laundry/items/:id             - Update clothing category
// DELETE /api/laundry/items/:id             - Delete clothing category
// GET    /api/laundry/stats                 - Get laundry statistics

export interface LaundryStats {
  pendingOrders: number;
  processingOrders: number;
  readyOrders: number;
  todayRevenue: number;
}

/**
 * GET /api/laundry/orders
 * Get all laundry orders with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<LaundryOrder>, message: string }
 */
export async function getLaundryOrders(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<LaundryOrder>>> {
  return await apiGet<PaginatedResponse<LaundryOrder>>('/laundry/orders', params);
}

/**
 * GET /api/laundry/orders/:id
 * Get single laundry order
 */
export async function getLaundryOrderById(id: string): Promise<ApiResponse<LaundryOrder>> {
  return await apiGet<LaundryOrder>(`/laundry/orders/${id}`);
}

/**
 * POST /api/laundry/orders
 * Create new laundry order
 * 
 * Request payload:
 * {
 *   guestId?: string,       // Optional: Link to hotel guest
 *   customerName: string,   // Customer name
 *   roomId?: string,        // Optional: Room ID for room charge
 *   items: [                // List of items
 *     { laundryItemId: string, quantity: number }
 *   ],
 *   paymentMethod: 'cash' | 'card' | 'room-charge'
 * }
 */
export async function createLaundryOrder(data: CreateLaundryOrderRequest): Promise<ApiResponse<LaundryOrder>> {
  return await apiPost<LaundryOrder>('/v3/laundry/orders', data);
}

/**
 * POST /api/laundry/orders/guest
 * Create laundry order for hotel guest (charge to room)
 * 
 * Request payload:
 * {
 *   bookingReference: string,       // Room booking reference number
 *   estimatedAmount: number,        // Estimated total amount
 *   items: [
 *     { laundryItemId: string, quantity: number }
 *   ]
 * }
 * 
 * Response: { success: boolean, data: LaundryOrder, message: string }
 */
export async function createLaundryGuestOrder(data: CreateLaundryGuestOrderRequest): Promise<ApiResponse<LaundryOrder>> {
  return await apiPost<LaundryOrder>('/v3/laundry/orders/guest', data);
}

/**
 * POST /api/laundry/orders/visitor
 * Create laundry order for walk-in visitor
 * 
 * Request payload:
 * {
 *   fullName: string,
 *   phone: string,
 *   email: string,
 *   address: string,
 *   items: [
 *     { laundryItemId: string, quantity: number }
 *   ]
 * }
 * 
 * Response: { success: boolean, data: LaundryOrder, message: string }
 */
export async function createLaundryVisitorOrder(data: CreateLaundryVisitorOrderRequest): Promise<ApiResponse<LaundryOrder>> {
  return await apiPost<LaundryOrder>('/v3/laundry/orders/visitor', data);
}

/**
 * PUT /api/laundry/orders/:id
 * Update laundry order
 */
export async function updateLaundryOrder(id: string, data: Partial<CreateLaundryOrderRequest>): Promise<ApiResponse<LaundryOrder>> {
  return await apiPut<LaundryOrder>(`/v3/laundry/orders/${id}`, data);
}

/**
 * PUT /api/laundry/orders/:id/status
 * Update laundry order status
 * 
 * Request: { status: 'received' | 'processing' | 'ready' | 'delivered' }
 */
export async function updateLaundryOrderStatus(id: string, status: LaundryOrder['status']): Promise<ApiResponse<LaundryOrder>> {
  return await apiPut<LaundryOrder>(`/v3/laundry/orders/${id}/status`, { status });
}

/**
 * DELETE /api/laundry/orders/:id
 * Delete laundry order
 */
export async function deleteLaundryOrder(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/orders/${id}`);
}

// =====================================================
// Laundry Items (Clothing Categories)
// =====================================================

/**
 * GET /api/laundry/items
 * Get all clothing categories/items
 */
export async function getLaundryItems(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<LaundryItem>>> {
  return await apiGet<PaginatedResponse<LaundryItem>>('/v3/laundry/items', params);
}

/**
 * POST /api/laundry/items
 * Create clothing category
 * 
 * Request payload:
 * {
 *   name: string,           // Category name (e.g., "Shirts", "Pants")
 *   price: number           // Price per item
 *   description: string     // Description of the category
 * }
 */
export async function createLaundryItem(data: Omit<LaundryItem, 'id' | 'hotelId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LaundryItem>> {
  //console.log(data);
  return await apiPost<LaundryItem>('/v3/laundry/items', data);
}

/**
 * PUT /api/laundry/items/:id
 * Update clothing category
 */
export async function updateLaundryItem(id: string, data: Partial<LaundryItem>): Promise<ApiResponse<LaundryItem>> {
  return await apiPut<LaundryItem>(`/v3/laundry/items/${id}`, data);
}

/**
 * DELETE /api/laundry/items/:id
 * Delete clothing category
 */
export async function deleteLaundryItem(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/laundry/items/${id}`);
}

// =====================================================
// Laundry Statistics
// =====================================================

/**
 * GET /api/laundry/stats
 * Get laundry statistics
 */
export async function getLaundryStats(): Promise<ApiResponse<LaundryStats>> {
  return await apiGet<LaundryStats>('/laundry/stats');
}

// Export as named object
export const laundryService = {
  getLaundryOrders,
  getLaundryOrderById,
  createLaundryOrder,
  createLaundryGuestOrder,
  createLaundryVisitorOrder,
  updateLaundryOrder,
  updateLaundryOrderStatus,
  deleteLaundryOrder,
  getLaundryItems,
  createLaundryItem,
  updateLaundryItem,
  deleteLaundryItem,
  getLaundryStats,
};
