import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';

// =====================================================
// Department Types
// =====================================================
export interface Department {
  id: string;
  name: string;
  description: string;
  hotelId: string;
  headOfDepartment?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
  hotelId: string;
  headOfDepartment?: string;
  status?: 'active' | 'inactive';
}

// =====================================================
// API Endpoints Configuration
// Replace these with your actual API endpoints
// =====================================================
const ENDPOINTS = {
  LIST: '/departments',              // GET - List all departments
  GET_BY_ID: '/departments',         // GET - Get department by ID: /departments/:id
  CREATE: '/departments',            // POST - Create new department
  UPDATE: '/departments',            // PUT - Update department: /departments/:id
  DELETE: '/departments',            // DELETE - Delete department: /departments/:id
};

// =====================================================
// Department Service Functions
// =====================================================

/**
 * GET /api/departments
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (optional)
 * - hotelId: string (optional) - Filter by hotel
 * - status: string (optional) - Filter by status
 * 
 * Response: { success: true, data: { items: Department[], total, page, limit, totalPages }, message, status }
 */
export async function getDepartments(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Department>>> {
  return await apiGet<PaginatedResponse<Department>>(ENDPOINTS.LIST, params);
}

/**
 * GET /api/departments/:id
 * 
 * Response: { success: true, data: Department, message, status }
 */
export async function getDepartmentById(id: string): Promise<ApiResponse<Department>> {
  return await apiGet<Department>(`${ENDPOINTS.GET_BY_ID}/${id}`);
}

/**
 * POST /api/departments
 * 
 * Request body:
 * {
 *   name: string,          // Required - Department name
 *   description: string,   // Optional - Department description
 *   hotelId: string,       // Required - Associated hotel ID
 *   headOfDepartment: string, // Optional - Head of department name
 *   status: 'active' | 'inactive' // Optional - defaults to 'active'
 * }
 * 
 * Response: { success: true, data: Department, message: "Department created", status: 201 }
 */
export async function createDepartment(data: CreateDepartmentRequest): Promise<ApiResponse<Department>> {
  return await apiPost<Department>(ENDPOINTS.CREATE, data);
}

/**
 * PUT /api/departments/:id
 * 
 * Request body: Partial<CreateDepartmentRequest>
 * 
 * Response: { success: true, data: Department, message: "Department updated", status: 200 }
 */
export async function updateDepartment(id: string, data: Partial<CreateDepartmentRequest>): Promise<ApiResponse<Department>> {
  return await apiPut<Department>(`${ENDPOINTS.UPDATE}/${id}`, data);
}

/**
 * DELETE /api/departments/:id
 * 
 * Response: { success: true, data: null, message: "Department deleted", status: 200 }
 */
export async function deleteDepartment(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`${ENDPOINTS.DELETE}/${id}`);
}

/**
 * Get department statistics
 * GET /api/departments/stats
 */
export async function getDepartmentStats(): Promise<ApiResponse<{
  total: number;
  active: number;
  inactive: number;
  totalEmployees: number;
}>> {
  return await apiGet(`${ENDPOINTS.LIST}/stats`);
}
