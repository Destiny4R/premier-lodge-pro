// =====================================================
// Restaurant Module Types
// =====================================================

import { ApiResponse, PaginationParams, PaginatedResponse } from './api';

// =====================================================
// Food Category Types
// =====================================================

/**
 * Food Category entity
 */
export interface FoodCategory {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/restaurant/food-categories
 * Request payload for creating food category
 */
export interface CreateFoodCategoryRequest {
  name: string;
  description: string;
}

/**
 * PUT /api/restaurant/food-categories/:id
 * Request payload for updating food category
 */
export interface UpdateFoodCategoryRequest extends Partial<CreateFoodCategoryRequest> {
  id: string;
}

// =====================================================
// Stock Item Types
// =====================================================

/**
 * Stock Item entity
 */
export interface StockItem {
  id: string;
  hotelId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  description: string;
  minimumStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/restaurant/stock
 * Request payload for creating stock item
 */
export interface CreateStockItemRequest {
  categoryId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  description: string;
  minimumStockLevel: number;
}

/**
 * PUT /api/restaurant/stock/:id
 * Request payload for updating stock item
 */
export interface UpdateStockItemRequest extends Partial<CreateStockItemRequest> {
  id: string;
}

/**
 * PATCH /api/restaurant/stock/:id/quantity
 * Request payload for updating stock quantity only
 */
export interface UpdateStockQuantityRequest {
  quantity: number;
}

// =====================================================
// Restaurant Order Types (Updated)
// =====================================================

/**
 * Order item in cart
 */
export interface OrderCartItem {
  stockItemId: string;
  stockItem: StockItem;
  quantity: number;
}

/**
 * Restaurant Order entity
 */
export interface RestaurantOrder {
  id: string;
  hotelId: string;
  orderNumber: string;
  guestId?: string;
  bookingReference?: string;
  customerName: string;
  roomId?: string;
  items: {
    stockItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'room-charge';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /api/restaurant/orders
 * Request payload for creating restaurant order
 */
export interface CreateRestaurantOrderRequest {
  bookingReference?: string;
  customerName?: string;
  items: { stockItemId: string; quantity: number }[];
  paymentMethod: 'cash' | 'room-charge';
}

// =====================================================
// Restaurant Stats
// =====================================================

export interface RestaurantStats {
  todaySales: number;
  activeOrders: number;
  totalStockItems: number;
  lowStockItems: number;
  totalCategories: number;
}

// =====================================================
// Service Response Types
// =====================================================

export type FoodCategoryListResponse = ApiResponse<PaginatedResponse<FoodCategory>>;
export type FoodCategoryResponse = ApiResponse<FoodCategory>;
export type StockItemListResponse = ApiResponse<PaginatedResponse<StockItem>>;
export type StockItemResponse = ApiResponse<StockItem>;
export type RestaurantOrderListResponse = ApiResponse<PaginatedResponse<RestaurantOrder>>;
export type RestaurantOrderResponse = ApiResponse<RestaurantOrder>;
export type RestaurantStatsResponse = ApiResponse<RestaurantStats>;
