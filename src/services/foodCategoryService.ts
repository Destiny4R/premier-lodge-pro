import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api';
import { FoodCategory, CreateFoodCategoryRequest } from '@/types/restaurant';

// =====================================================
// Food Category Service
// Handles food category API calls for restaurant module
// =====================================================

// ==== ENDPOINTS ====
// GET    /api/restaurant/food-categories           - List all food categories
// GET    /api/restaurant/food-categories/:id       - Get single category
// POST   /api/restaurant/food-categories           - Create category
// PUT    /api/restaurant/food-categories/:id       - Update category
// DELETE /api/restaurant/food-categories/:id       - Delete category

/**
 * GET /api/restaurant/food-categories
 * Get all food categories with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<FoodCategory>, message: string }
 */
export async function getFoodCategories(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<FoodCategory>>> {
  return await apiGet<PaginatedResponse<FoodCategory>>('/restaurant/food-categories', params);
}

/**
 * GET /api/restaurant/food-categories/:id
 * Get single food category
 */
export async function getFoodCategoryById(id: string): Promise<ApiResponse<FoodCategory>> {
  return await apiGet<FoodCategory>(`/restaurant/food-categories/${id}`);
}

/**
 * POST /api/restaurant/food-categories
 * Create food category
 * 
 * Request payload:
 * {
 *   name: string,           // Category name
 *   description: string     // Category description
 * }
 * 
 * Response: { success: boolean, data: FoodCategory, message: string }
 */
export async function createFoodCategory(data: CreateFoodCategoryRequest): Promise<ApiResponse<FoodCategory>> {
  return await apiPost<FoodCategory>('/restaurant/food-categories', data);
}

/**
 * PUT /api/restaurant/food-categories/:id
 * Update food category
 * 
 * Request payload: Partial<CreateFoodCategoryRequest>
 * Response: { success: boolean, data: FoodCategory, message: string }
 */
export async function updateFoodCategory(id: string, data: Partial<CreateFoodCategoryRequest>): Promise<ApiResponse<FoodCategory>> {
  return await apiPut<FoodCategory>(`/restaurant/food-categories/${id}`, data);
}

/**
 * DELETE /api/restaurant/food-categories/:id
 * Delete food category
 * 
 * Response: { success: boolean, data: null, message: string }
 */
export async function deleteFoodCategory(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/restaurant/food-categories/${id}`);
}

// Export as named object
export const foodCategoryService = {
  getFoodCategories,
  getFoodCategoryById,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
};
