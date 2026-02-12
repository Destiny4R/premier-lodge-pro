import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiUpload } from '@/lib/api';
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
  return await apiGet<PaginatedResponse<StockItem>>(`/v3/restaurant/stock`, params);
}

/**
 * GET /api/restaurant/stock/:id
 * Get single stock item
 */
export async function getStockItemById(id: string): Promise<ApiResponse<StockItem>> {
  return await apiGet<StockItem>(`/v3/restaurant/stock/${id}`);
}

/**
 * POST /api/restaurant/stock
 * Create stock item (multipart/form-data for image upload)
 * 
 * Request payload (FormData):
 * - categoryId: string          // Food category ID
 * - name: string                // Item name
 * - image: File                 // Image file (JPEG, JPG, PNG)
 * - quantity: number            // Initial quantity
 * - price: number               // Price per unit
 * - description: string         // Item description
 * - minimumStockLevel: number   // Minimum stock alert threshold
 * 
 * Response: { success: boolean, data: StockItem, message: string }
 */
export async function createStockItem(data: CreateStockItemRequest, imageFile?: File): Promise<ApiResponse<StockItem>> {
  const formData = new FormData();
  formData.append('categoryId', data.categoryId);
  formData.append('name', data.name);
  formData.append('quantity', data.quantity.toString());
  formData.append('price', data.price.toString());
  formData.append('description', data.description);
  formData.append('minimumStockLevel', data.minimumStockLevel.toString());
  if (imageFile) {
    formData.append('images', imageFile);
  }
  return await apiUpload<StockItem>('/v3/restaurant/stock', formData);
}

/**
 * PUT /api/restaurant/stock/:id
 * Update stock item (multipart/form-data for image upload)
 * 
 * Request payload (FormData):
 * - categoryId?: string         // Food category ID
 * - name?: string               // Item name
 * - image?: File                // New image file (JPEG, JPG, PNG)
 * - quantity?: number           // Updated quantity
 * - price?: number              // Updated price
 * - description?: string        // Updated description
 * - minimumStockLevel?: number  // Updated minimum stock level
 * 
 * Response: { success: boolean, data: StockItem, message: string }
 */
export async function updateStockItem(id: string, data: Partial<CreateStockItemRequest>, imageFile?: File): Promise<ApiResponse<StockItem>> {
  const formData = new FormData();
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  if (data.name) formData.append('name', data.name);
  if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString());
  if (data.price !== undefined) formData.append('price', data.price.toString());
  if (data.description) formData.append('description', data.description);
  if (data.minimumStockLevel !== undefined) formData.append('minimumStockLevel', data.minimumStockLevel.toString());
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return await apiUpload<StockItem>(`/v3/restaurant/stock/${id}`, formData);
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
  return await apiPatch<StockItem>(`/v3/restaurant/stock/${id}/quantity`, data);
}

/**
 * DELETE /api/restaurant/stock/:id
 * Delete stock item
 * 
 * Response: { success: boolean, data: null, message: string }
 */
export async function deleteStockItem(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/v3/restaurant/stock/${id}`);
}

/**
 * GET /api/restaurant/stock/low
 * Get items below minimum stock level
 * 
 * Response: { success: boolean, data: StockItem[], message: string }
 */
export async function getLowStockItems(): Promise<ApiResponse<StockItem[]>> {
  return await apiGet<StockItem[]>('/v3/restaurant/stock/low');
}

/**
 * DELETE /api/restaurant/stock/:id/image
 * Delete stock item image only
 * 
 * Request: None (just the stock item ID in the URL)
 * 
 * Response: { success: boolean, data: StockItem, message: string }
 * 
 * Note: This endpoint removes only the image from the stock item,
 * leaving all other fields intact. The image field will be set to null/empty.
 */
export async function deleteStockItemImage(id: string): Promise<ApiResponse<StockItem>> {
  return await apiDelete<StockItem>(`/v3/restaurant/stock/${id}/image`);
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
  deleteStockItemImage,
};
