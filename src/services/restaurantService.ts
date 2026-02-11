import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  ApiResponse,
  MenuItem,
  RestaurantOrder,
  PaginationParams,
  PaginatedResponse,
  CreateRestaurantOrderRequest,
  CheckoutResponse,
} from '@/types/api';

// =====================================================
// Restaurant Service - Handles restaurant-related API calls
// =====================================================

// ==== ENDPOINTS ====
// Base URL: Replace with your API base URL (e.g., https://api.yourhotel.com)
// 
// GET    /api/restaurant/menu           - List all menu items
// GET    /api/restaurant/menu/:id       - Get single menu item
// POST   /api/restaurant/menu           - Create menu item
// PUT    /api/restaurant/menu/:id       - Update menu item
// DELETE /api/restaurant/menu/:id       - Delete menu item
// GET    /api/restaurant/orders         - List all orders
// GET    /api/restaurant/orders/:id     - Get single order
// POST   /api/restaurant/orders         - Create new order
// PUT    /api/restaurant/orders/:id     - Update order
// PUT    /api/restaurant/orders/:id/status - Update order status
// DELETE /api/restaurant/orders/:id     - Delete order
// GET    /api/restaurant/stats          - Get restaurant statistics

export interface RestaurantStats {
  todaySales: number;
  activeOrders: number;
  foodItems: number;
  drinkItems: number;
}

export interface CreateMenuItemRequest {
  name: string;
  category: 'food' | 'drink';
  price: number;
  description: string;
  inStock: boolean;
  image?: string;
}

// =====================================================
// Menu Items
// =====================================================

/**
 * GET /api/restaurant/menu
 * Get all menu items with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<MenuItem>, message: string }
 */
export async function getMenuItems(params?: PaginationParams & { category?: 'food' | 'drink' }): Promise<ApiResponse<PaginatedResponse<MenuItem>>> {
  return await apiGet<PaginatedResponse<MenuItem>>('/restaurant/menu', params);
}

/**
 * GET /api/restaurant/menu/:id
 * Get single menu item
 */
export async function getMenuItemById(id: string): Promise<ApiResponse<MenuItem>> {
  return await apiGet<MenuItem>(`/restaurant/menu/${id}`);
}

/**
 * POST /api/restaurant/menu
 * Create menu item
 * 
 * Request payload:
 * {
 *   name: string,           // Item name
 *   category: 'food' | 'drink',
 *   price: number,          // Price
 *   description: string,    // Item description
 *   inStock: boolean,       // Availability
 *   image?: string          // Image URL
 * }
 */
export async function createMenuItem(data: CreateMenuItemRequest): Promise<ApiResponse<MenuItem>> {
  return await apiPost<MenuItem>('/restaurant/menu', data);
}

/**
 * PUT /api/restaurant/menu/:id
 * Update menu item
 */
export async function updateMenuItem(id: string, data: Partial<CreateMenuItemRequest>): Promise<ApiResponse<MenuItem>> {
  return await apiPut<MenuItem>(`/restaurant/menu/${id}`, data);
}

/**
 * PUT /api/restaurant/menu/:id/stock
 * Update menu item stock status
 */
export async function updateMenuItemStock(id: string, inStock: boolean): Promise<ApiResponse<MenuItem>> {
  return await apiPut<MenuItem>(`/restaurant/menu/${id}/stock`, { inStock });
}

/**
 * DELETE /api/restaurant/menu/:id
 * Delete menu item
 */
export async function deleteMenuItem(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/restaurant/menu/${id}`);
}

// =====================================================
// Restaurant Orders
// =====================================================

/**
 * GET /api/restaurant/orders
 * Get all orders with pagination
 * 
 * Query params:
 * - page: number
 * - pageSize: number
 * - search: string
 * - status: string (optional)
 * - dateFilter: string (optional) - e.g. 'today' to filter today's orders
 *
 * Response: { success: boolean, data: PaginatedResponse<RestaurantOrder>, message: string }
 */
export async function getRestaurantOrders(params?: PaginationParams & { status?: string; paymentMethod?: string; dateFilter?: string }): Promise<ApiResponse<PaginatedResponse<RestaurantOrder>>> {
  return await apiGet<PaginatedResponse<RestaurantOrder>>('/v3/restaurant/orders', params);
}

/**
 * GET /api/restaurant/orders/:id
 * Get single order
 */
export async function getRestaurantOrderById(id: string): Promise<ApiResponse<RestaurantOrder>> {
  return await apiGet<RestaurantOrder>(`/v3/restaurant/orders/${id}`);
}

/**
 * POST /api/restaurant/orders
 * Create new order
 * 
 * Request payload:
 * {
 *   guestId?: string,       // Optional: Link to hotel guest
 *   customerName: string,   // Customer name
 *   roomId?: string,        // Optional: Room ID for room charge
 *   items: [                // List of items
 *     { menuItemId: string, quantity: number }
 *   ],
 *   paymentMethod: 'cash' | 'card' | 'room-charge'
 * }
 */
export async function createRestaurantOrder(data: CreateRestaurantOrderRequest): Promise<ApiResponse<RestaurantOrder>> {
  return await apiPost<RestaurantOrder>('/v3/restaurant/orders', data);
}

/**
 * PUT /api/restaurant/orders/:id
 * Update order
 */
export async function updateRestaurantOrder(id: string, data: Partial<CreateRestaurantOrderRequest>): Promise<ApiResponse<RestaurantOrder>> {
  return await apiPut<RestaurantOrder>(`/v3/restaurant/orders/${id}`, data);
}

/**
 * PUT /api/restaurant/orders/:id/status
 * Update order status
 * 
 * Request: { status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' }
 */
export async function updateRestaurantOrderStatus(id: string, status: RestaurantOrder['status']): Promise<ApiResponse<RestaurantOrder>> {
  return await apiPut<RestaurantOrder>(`/v3/restaurant/orders/${id}/status`, { status });
}

/**
 * DELETE /api/restaurant/orders/:id
 * Delete/cancel order
 */
export async function deleteRestaurantOrder(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/restaurant/orders/${id}`);
}

// =====================================================
// Restaurant Statistics
// =====================================================

/**
 * GET /api/restaurant/stats
 * Get restaurant statistics
 */
export async function getRestaurantStats(): Promise<ApiResponse<RestaurantStats>> {
  return await apiGet<RestaurantStats>('/v3/restaurant/stats');
}

// =====================================================
// Restaurant Checkout
// =====================================================

export interface CashCheckoutRequest {
  items: { stockId: string; quantity: number }[];
}

export interface RoomChargeCheckoutRequest {
  items: { stockId: string; quantity: number }[];
  bookingReference?: string | null;
}


/**
 * POST /api/restaurant/orders/checkout/cash
 * Checkout with cash payment
 * 
 * Request payload:
 * {
 *   items: [
 *     { stockId: string, quantity: number }
 *   ]
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     orderId: string,
 *     orderNumber: string,
 *     totalAmount: number,
 *     tax: number,
 *     subtotal: number,
 *     paymentMethod: "cash",
 *     items: [{ name: string, quantity: number, price: number, subtotal: number }],
 *     date: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function checkoutCash(data: CashCheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
  return await apiPost<CheckoutResponse>('/v3/restaurant/orders/checkout/cash', data);
}

/**
 * POST /api/restaurant/orders/checkout/room-charge
 * Checkout with room charge payment
 * 
 * Request payload:
 * {
 *   items: [
 *     { stockId: string, quantity: number }
 *   ],
 *   bookingReference: string   // Valid room booking reference number
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     orderId: string,
 *     orderNumber: string,
 *     totalAmount: number,
 *     tax: number,
 *     subtotal: number,
 *     paymentMethod: "room-charge",
 *     bookingReference: string,
 *     items: [{ name: string, quantity: number, price: number, subtotal: number }],
 *     date: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function checkoutRoomCharge(data: RoomChargeCheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
  return await apiPost<CheckoutResponse>('/v3/restaurant/orders/checkout/room-charge', data);
}

// Export as named object
export const restaurantService = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  updateMenuItemStock,
  deleteMenuItem,
  getRestaurantOrders,
  getRestaurantOrderById,
  createRestaurantOrder,
  updateRestaurantOrder,
  updateRestaurantOrderStatus,
  deleteRestaurantOrder,
  getRestaurantStats,
  checkoutCash,
  checkoutRoomCharge,
};
