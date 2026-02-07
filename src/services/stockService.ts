import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/lib/api';
import { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api';
import { StockItem, CreateStockItemRequest, UpdateStockQuantityRequest } from '@/types/restaurant';

// =====================================================
// Stock Service
// Handles stock item API calls for restaurant module
// =====================================================

// ==== ENDPOINTS ====
// GET    /api/restaurant/stock                  - List all stock items
// GET    /api/restaurant/stock/:id              - Get single stock item
// POST   /api/restaurant/stock                  - Create stock item
// PUT    /api/restaurant/stock/:id              - Update stock item
// PATCH  /api/restaurant/stock/:id/quantity     - Update stock quantity only
// DELETE /api/restaurant/stock/:id              - Delete stock item
// GET    /api/restaurant/stock/low              - Get low stock items

export interface StockParams extends PaginationParams {
  categoryId?: string;
  lowStock?: boolean;
}

/**
 * GET /api/restaurant/stock
 * Get all stock items with pagination
 * 
 * Query params:
 * - page: number
 * - pageSize: number
 * - search: string
 * - categoryId: string (optional)
 * - lowStock: boolean (optional) - filter for items below minimum stock
 * 
 * Response: { success: boolean, data: PaginatedResponse<StockItem>, message: string }
 */
export async function getStockItems(params?: StockParams): Promise<ApiResponse<PaginatedResponse<StockItem>>> {
  return await apiGet<PaginatedResponse<StockItem>>('/restaurant/stock', params);
}

/**
 * GET /api/restaurant/stock/:id
 * Get single stock item
 */
export async function getStockItemById(id: string): Promise<ApiResponse<StockItem>> {
  return await apiGet<StockItem>(`/restaurant/stock/${id}`);
}

/**
 * POST /api/restaurant/stock
 * Create stock item
 * 
 * Request payload:
 * {
 *   categoryId: string,          // Food category ID
 *   name: string,                // Item name
 *   image?: string,              // Image URL
 *   quantity: number,            // Initial quantity
 *   price: number,               // Price per unit
 *   description: string,         // Item description
 *   minimumStockLevel: number    // Minimum stock alert threshold
 * }
 * 
 * Response: { success: boolean, data: StockItem, message: string }
 */
export async function createStockItem(data: CreateStockItemRequest): Promise<ApiResponse<StockItem>> {
  return await apiPost<StockItem>('/restaurant/stock', data);
}

/**
 * PUT /api/restaurant/stock/:id
 * Update stock item
 * 
 * Request payload: Partial<CreateStockItemRequest>
 * Response: { success: boolean, data: StockItem, message: string }
 */
export async function updateStockItem(id: string, data: Partial<CreateStockItemRequest>): Promise<ApiResponse<StockItem>> {
  return await apiPut<StockItem>(`/restaurant/stock/${id}`, data);
}

/**
 * PATCH /api/restaurant/stock/:id/quantity
 * Update stock quantity only (for restocking)
 * 
 * Request payload:
 * {
 *   quantity: number   // New quantity value
 * }
 * 
 * Response: { success: boolean, data: StockItem, message: string }
 */
export async function updateStockQuantity(id: string, data: UpdateStockQuantityRequest): Promise<ApiResponse<StockItem>> {
  return await apiPatch<StockItem>(`/restaurant/stock/${id}/quantity`, data);
}

/**
 * DELETE /api/restaurant/stock/:id
 * Delete stock item
 * 
 * Response: { success: boolean, data: null, message: string }
 */
export async function deleteStockItem(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/restaurant/stock/${id}`);
}

/**
 * GET /api/restaurant/stock/low
 * Get items below minimum stock level
 * 
 * Response: { success: boolean, data: StockItem[], message: string }
 */
export async function getLowStockItems(): Promise<ApiResponse<StockItem[]>> {
  return await apiGet<StockItem[]>('/restaurant/stock/low');
}

// Export as named object
export const stockService = {
  getStockItems,
  getStockItemById,
  createStockItem,
  updateStockItem,
  updateStockQuantity,
  deleteStockItem,
  getLowStockItems,
};
