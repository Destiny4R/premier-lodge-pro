import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Room, 
  RoomCategory, 
  PaginationParams, 
  PaginatedResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateRoomCategoryRequest
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
    return await apiGet<PaginatedResponse<Room>>('/rooms', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockRooms: Room[] = [
      { id: 'r1', hotelId: 'h1', categoryId: 'rc1', roomNumber: '101', floor: 1, status: 'available', price: 150, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r2', hotelId: 'h1', categoryId: 'rc1', roomNumber: '102', floor: 1, status: 'occupied', price: 150, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r3', hotelId: 'h1', categoryId: 'rc2', roomNumber: '201', floor: 2, status: 'available', price: 280, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r4', hotelId: 'h1', categoryId: 'rc2', roomNumber: '202', floor: 2, status: 'reserved', price: 280, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r5', hotelId: 'h1', categoryId: 'rc3', roomNumber: '301', floor: 3, status: 'available', price: 450, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Executive Suite', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r6', hotelId: 'h1', categoryId: 'rc4', roomNumber: '401', floor: 4, status: 'available', price: 850, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Presidential Suite', hotelName: 'LuxeStay Grand Palace' },
    ];
    
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
    return await apiGet<Room>(`/rooms/${id}`);
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
 *   categoryId: string,
 *   roomNumber: string,
 *   floor: number,
 *   price: number,
 *   status: 'available' | 'maintenance',
 *   isPromoted: boolean,
 *   image?: string
 * }
 * 
 * Note: hotelId is derived from authenticated user's hotel context
 */
export async function createRoom(data: CreateRoomRequest): Promise<ApiResponse<Room>> {
  try {
    return await apiPost<Room>('/rooms', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { ...data, id: `r${Date.now()}`, hotelId: 'h1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Room,
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
    return await apiPut<Room>(`/rooms/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, ...data } as Room,
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
    return await apiDelete<null>(`/rooms/${id}`);
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
    return await apiGet<PaginatedResponse<RoomCategory>>('/room-categories', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockCategories: RoomCategory[] = [
      { id: 'rc1', hotelId: 'h1', name: 'Standard Room', description: 'Comfortable room with essential amenities', basePrice: 150, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'rc2', hotelId: 'h1', name: 'Deluxe Room', description: 'Spacious room with premium amenities and city view', basePrice: 280, maxOccupancy: 3, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'City View', 'Work Desk'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'rc3', hotelId: 'h1', name: 'Executive Suite', description: 'Luxury suite with separate living area', basePrice: 450, maxOccupancy: 4, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'City View', 'Living Room', 'Jacuzzi'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'rc4', hotelId: 'h1', name: 'Presidential Suite', description: 'Ultimate luxury with panoramic views and butler service', basePrice: 850, maxOccupancy: 6, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Panoramic View', 'Living Room', 'Jacuzzi', 'Butler Service', 'Private Dining'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
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
 *   amenities: string[],
 *   images?: File[]
 * }
 */
export async function createRoomCategory(data: CreateRoomCategoryRequest): Promise<ApiResponse<RoomCategory>> {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('basePrice', data.basePrice.toString());
    formData.append('maxOccupancy', data.maxOccupancy.toString());
    formData.append('amenities', JSON.stringify(data.amenities));
    
    if (data.images) {
      data.images.forEach(file => formData.append('images', file));
    }
    
    return await apiPost<RoomCategory>('/room-categories', formData);
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
export async function updateRoomCategory(id: string, data: Partial<CreateRoomCategoryRequest>): Promise<ApiResponse<RoomCategory>> {
  try {
    return await apiPut<RoomCategory>(`/room-categories/${id}`, data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: { id, hotelId: 'h1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as RoomCategory,
      message: 'Room category updated successfully',
      status: 200,
    };
  }
}

/**
 * DELETE /api/room-categories/:id
 * Delete room category
 */
export async function deleteRoomCategory(id: string): Promise<ApiResponse<null>> {
  try {
    return await apiDelete<null>(`/room-categories/${id}`);
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

// =====================================================
// Public Rooms (for landing page)
// =====================================================

/**
 * GET /api/public/rooms
 * Get all available rooms across all hotels (public endpoint)
 */
export async function getPublicRooms(params?: PaginationParams & { city?: string; minPrice?: number; maxPrice?: number }): Promise<ApiResponse<PaginatedResponse<Room>>> {
  try {
    return await apiGet<PaginatedResponse<Room>>('/public/rooms', params);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    const mockRooms: Room[] = [
      { id: 'r1', hotelId: 'h1', categoryId: 'rc1', roomNumber: '101', floor: 1, status: 'available', price: 150, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r3', hotelId: 'h1', categoryId: 'rc2', roomNumber: '201', floor: 2, status: 'available', price: 280, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r5', hotelId: 'h1', categoryId: 'rc3', roomNumber: '301', floor: 3, status: 'available', price: 450, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Executive Suite', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r6', hotelId: 'h1', categoryId: 'rc4', roomNumber: '401', floor: 4, status: 'available', price: 850, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Presidential Suite', hotelName: 'LuxeStay Grand Palace' },
      { id: 'r7', hotelId: 'h2', categoryId: 'rc1', roomNumber: '101', floor: 1, status: 'available', price: 180, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Marina Bay' },
      { id: 'r8', hotelId: 'h2', categoryId: 'rc2', roomNumber: '201', floor: 2, status: 'available', price: 320, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Marina Bay' },
      { id: 'r9', hotelId: 'h3', categoryId: 'rc3', roomNumber: '201', floor: 2, status: 'available', price: 520, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Executive Suite', hotelName: 'LuxeStay Mountain Retreat' },
    ];
    
    // Sort by isPromoted
    mockRooms.sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));
    
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedRooms = mockRooms.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      data: {
        items: paginatedRooms,
        totalItems: mockRooms.length,
        totalPages: Math.ceil(mockRooms.length / pageSize),
        currentPage: page,
        pageSize: pageSize,
      },
      message: 'Rooms retrieved successfully',
      status: 200,
    };
  }
}
