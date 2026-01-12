import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Room, 
  RoomCategory, 
  RoomCategoryUpdate,
  PaginationParams, 
  PaginatedResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateRoomCategoryRequest,
} from '@/types/api';

// =====================================================
// Room Service - Handles room-related API calls
// =====================================================

/**
 * GET /api/rooms
 * Get all rooms with pagination
 * 
 * Query params:
 * {
 *   page: number,
 *   pageSize: number,
 *   search?: string,
 *   sortBy?: string,
 *   sortOrder?: 'asc' | 'desc',
 *   status?: string,
 *   categoryId?: string
 * }
 */
export async function getRooms(params?: PaginationParams & { status?: string; categoryId?: string }): Promise<ApiResponse<PaginatedResponse<Room>>> {
  try {
    return await apiGet<PaginatedResponse<Room>>('v3/rooms/getrooms', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockRooms: Room[] = [];
    
    return {
      success: true,
      data: {
        items: mockRooms,
        totalItems: mockRooms.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Rooms retrieved successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/rooms/:id
 * Get single room by ID
 */
export async function getRoomById(id: string): Promise<ApiResponse<Room>> {
  try {
    return await apiGet<Room>(`v3/rooms/getroombyid/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * POST /api/rooms
 * Create new room
 * 
 * Request payload:
 * {
 *   doorNumber: string,
 *   floor: number,
 *   status: string,
 *   categoryId: number,
 *   isPromoted: boolean
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 */
export async function createRoom(data: CreateRoomRequest): Promise<ApiResponse<Room>> {
  try {
    return await apiPost<Room>('v3/rooms/createRoom/', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { ...data, id: `r${Date.now()}`, hotelId: 'h1', categoryId: data.categoryId.toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Room,
      message: 'Room created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/rooms/:id
 * Update room
 */
export async function updateRoom(id: string, data: Partial<UpdateRoomRequest>): Promise<ApiResponse<Room>> {
  try {
    return await apiPut<Room>(`v3/rooms/updateRoom/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const updatedData = { ...data };
    if (updatedData.categoryId !== undefined) {
      updatedData.categoryId = updatedData.categoryId.toString() as any;
    }
    return {
      success: true,
      data: { id, ...updatedData } as Room,
      message: 'Room updated successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/rooms/:id
 * Delete room
 */
export async function deleteRoom(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`v3/rooms/deleteroom/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Room deleted successfully',
      status: 200,
    };
  }
}

// =====================================================
// Room Categories
// =====================================================

/**
 * GET /api/room-categories
 * Get all room categories
 */
export async function getRoomCategories(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<RoomCategory>>> {
  try {
    return await apiGet<PaginatedResponse<RoomCategory>>('v3/rooms/getroomscategories', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockCategories: RoomCategory[] = [
      { id: 'rc1', hotelId: 'h1', name: 'Standard Room', description: 'Comfortable room with essential amenities', basePrice: 150, maxOccupancy: 2, amenities: 'WiFi, TV, Air Conditioning, Mini Bar', images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01', amenity: '' },
      { id: 'rc2', hotelId: 'h1', name: 'Deluxe Room', description: 'Spacious room with premium amenities and city view', basePrice: 280, maxOccupancy: 3, amenities: 'WiFi, Smart TV, Air Conditioning, Mini Bar, City View, Work Desk', images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01', amenity: '' },
      { id: 'rc3', hotelId: 'h1', name: 'Executive Suite', description: 'Luxury suite with separate living area', basePrice: 450, maxOccupancy: 4, amenities: 'WiFi, Smart TV, Air Conditioning, Full Bar, City View, Living Room, Jacuzzi', images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01', amenity: '' },
      { id: 'rc4', hotelId: 'h1', name: 'Presidential Suite', description: 'Ultimate luxury with panoramic views and butler service', basePrice: 850, maxOccupancy: 6, amenities: 'WiFi, Smart TV, Air Conditioning, Full Bar, Panoramic View, Living Room, Jacuzzi, Butler Service, Private Dining', images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01', amenity: '' },
    ];
    
    return {
      success: true,
      data: {
        items: mockCategories,
        totalItems: mockCategories.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      message: 'Room categories retrieved successfully',
      status: 200,
    };
  }
}

/**
 * POST /api/room-categories
 * Create room category
 * 
 * Request payload (FormData):
 * {
 *   name: string,
 *   description: string,
 *   basePrice: number,
 *   maxOccupancy: number,
 *   amenities: string,
 *   amenity?: string,
 *   files?: File[]
 * }
 */
export async function createRoomCategory(data: CreateRoomCategoryRequest): Promise<ApiResponse<RoomCategory>> {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('basePrice', data.basePrice.toString());
    formData.append('maxOccupancy', data.maxOccupancy.toString());
    formData.append('amenities', data.amenities);
    if (data.amenity) formData.append('amenity', data.amenity);
    
    if (data.files) {
      data.files.forEach(file => formData.append('files', file));
    }
    
    return await apiPost<RoomCategory>('v3/rooms/createCategory', formData);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { ...data, id: `rc${Date.now()}`, hotelId: 'h1', images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as RoomCategory,
      message: 'Room category created successfully',
      status: 201,
    };
  }
}

/**
 * PUT /api/room-categories/:id
 * Update room category
 */
export async function updateRoomCategory(id: string, data: Partial<CreateRoomCategoryRequest & { removedImageIds?: string[] }>): Promise<ApiResponse<RoomCategory>> {
  try {
    if (data.files || data.removedImageIds) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.basePrice !== undefined) formData.append('basePrice', data.basePrice.toString());
      if (data.maxOccupancy !== undefined) formData.append('maxOccupancy', data.maxOccupancy.toString());
      if (data.amenities) formData.append('amenities', data.amenities);
      if (data.amenity) formData.append('amenity', data.amenity);
      if (data.files) {
        data.files.forEach(file => formData.append('files', file));
      }
      if (data.removedImageIds) formData.append('removedImageIds', JSON.stringify(data.removedImageIds));
      return await apiPut<RoomCategory>(`v3/rooms/updateCategory/${id}`, formData);
    } else {
      return await apiPut<RoomCategory>(`v3/rooms/updateCategory/${id}`, data);
    }
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const { files, ...rest } = data;
    return {
      success: true,
      data: { 
        id, 
        hotelId: 'h1', 
        name: '',
        description: '',
        basePrice: 0,
        maxOccupancy: 2,
        amenities: '',
        images: [],
        amenity: '',
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(), 
        ...rest 
      },
      message: 'Room category updated successfully',
      status: 200,
    };
  }
}

/**
 * GET /api/rooms/:id
 * Get single room category by ID
 */
export async function getCategoryById(id: string): Promise<ApiResponse<RoomCategoryUpdate>> {
  try {
    return await apiGet<RoomCategoryUpdate>(`v3/rooms/getcategory/${id}`);
  } catch (error) {
    throw error;
  }
}

/**
 * DELETE /api/room-categories/:id
 * Delete room category
 */
export async function deleteRoomCategory(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`v3/rooms/deletecategory/${id}`);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Room category deleted successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/v3/rooms/deletecategoryimage/:id
 * Delete category image
 */
export async function deleteCategoryImage(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`v3/rooms/deletecategoryimage/${id}`);
  } catch (error) {
    throw error;
  }
}

// =====================================================
// Room Items (Categories Dropdown)
// =====================================================

export interface RoomCategorySelectItem {
  disabled: boolean;
  group: string | null;
  selected: boolean;
  text: string;
  value: string;
}

/**
 * GET /api/v3/rooms/getroomsitems
 * Get room categories for dropdown selection
 * 
 * Response: {
 *   success: boolean,
 *   data: [
 *     { disabled: false, group: null, selected: false, text: "VIP", value: "1" },
 *     { disabled: false, group: null, selected: false, text: "VVIP", value: "2" }
 *   ],
 *   message: string,
 *   status: number
 * }
 */
export async function getRoomItems(): Promise<ApiResponse<RoomCategorySelectItem[]>> {
  return await apiGet<RoomCategorySelectItem[]>('v3/rooms/getroomsitems');
}

// Note: Public room endpoints moved to publicService.ts
