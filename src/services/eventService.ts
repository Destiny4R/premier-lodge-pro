import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { 
  ApiResponse, 
  Event, 
  EventHall,
  PaginationParams, 
  PaginatedResponse,
  CreateEventRequest
} from '@/types/api';

// =====================================================
// Event Service - Handles event-related API calls
// =====================================================

// ==== ENDPOINTS ====
// Base URL: Replace with your API base URL (e.g., https://api.yourhotel.com)
// 
// GET    /api/events                    - List all events
// GET    /api/events/:id                - Get single event
// POST   /api/events                    - Create new event
// PUT    /api/events/:id                - Update event
// DELETE /api/events/:id                - Delete event
// GET    /api/event-halls               - List all event halls
// POST   /api/event-halls               - Create event hall
// PUT    /api/event-halls/:id           - Update event hall
// DELETE /api/event-halls/:id           - Delete event hall

/**
 * GET /api/events
 * Get all events with pagination
 * 
 * Response: { success: boolean, data: PaginatedResponse<Event>, message: string, status: number }
 */
export async function getEvents(params?: PaginationParams & { status?: string }): Promise<ApiResponse<PaginatedResponse<Event>>> {
  return await apiGet<PaginatedResponse<Event>>('/events', params);
}

/**
 * GET /api/events/:id
 * Get single event by ID
 */
export async function getEventById(id: string): Promise<ApiResponse<Event>> {
  return await apiGet<Event>(`/events/${id}`);
}

/**
 * POST /api/events
 * Create new event
 * 
 * Request payload:
 * {
 *   hallId: string,            // Event hall ID
 *   clientName: string,        // Client's name
 *   clientEmail: string,       // Client's email
 *   clientPhone: string,       // Client's phone
 *   eventType: string,         // Type of event (Wedding, Conference, etc.)
 *   startDate: string,         // ISO date string
 *   endDate: string,           // ISO date string
 *   chargeType: 'hourly' | 'daily'
 * }
 */
export async function createEvent(data: CreateEventRequest): Promise<ApiResponse<Event>> {
  return await apiPost<Event>('/events', data);
}

/**
 * PUT /api/events/:id
 * Update event
 */
export async function updateEvent(id: string, data: Partial<CreateEventRequest>): Promise<ApiResponse<Event>> {
  return await apiPut<Event>(`/events/${id}`, data);
}

/**
 * PUT /api/events/:id/status
 * Update event status
 */
export async function updateEventStatus(id: string, status: Event['status']): Promise<ApiResponse<Event>> {
  return await apiPut<Event>(`/events/${id}/status`, { status });
}

/**
 * DELETE /api/events/:id
 * Delete/cancel event
 */
export async function deleteEvent(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/events/${id}`);
}

// =====================================================
// Event Halls
// =====================================================

/**
 * GET /api/event-halls
 * Get all event halls
 * 
 * Response: { success: boolean, data: PaginatedResponse<EventHall>, message: string }
 */
export async function getEventHalls(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<EventHall>>> {
  return await apiGet<PaginatedResponse<EventHall>>('/event-halls', params);
}

/**
 * POST /api/event-halls
 * Create event hall
 * 
 * Request payload:
 * {
 *   name: string,          // Hall name
 *   capacity: number,      // Maximum capacity
 *   hourlyRate: number,    // Hourly rate
 *   dailyRate: number,     // Daily rate
 *   amenities: string[],   // List of amenities
 *   image?: string         // Image URL
 * }
 */
export async function createEventHall(data: Omit<EventHall, 'id' | 'hotelId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EventHall>> {
  return await apiPost<EventHall>('/event-halls', data);
}

/**
 * PUT /api/event-halls/:id
 * Update event hall
 */
export async function updateEventHall(id: string, data: Partial<EventHall>): Promise<ApiResponse<EventHall>> {
  return await apiPut<EventHall>(`/event-halls/${id}`, data);
}

/**
 * DELETE /api/event-halls/:id
 * Delete event hall
 */
export async function deleteEventHall(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`/event-halls/${id}`);
}

// Export as named object for cleaner imports
export const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getEventHalls,
  createEventHall,
  updateEventHall,
  deleteEventHall,
};
