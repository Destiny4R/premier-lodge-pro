import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/lib/api';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';

// =====================================================
// Employee Types
// =====================================================
export interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'receptionist' | 'housekeeper' | 'maintenance' | 'chef' | 'waiter' | 'security';
  hotelId: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: Permission[];
  joinDate: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
  hotelId: string;
  department: string;
  password?: string;
}

// =====================================================
// API Endpoints Configuration
// Replace these with your actual API endpoints
// =====================================================
const ENDPOINTS = {
  LIST: '/employees',                    // GET - List all employees
  GET_BY_ID: '/employees',               // GET - Get employee by ID: /employees/:id
  CREATE: '/employees',                  // POST - Create new employee
  UPDATE: '/employees',                  // PUT - Update employee: /employees/:id
  DELETE: '/employees',                  // DELETE - Delete employee: /employees/:id
  UPDATE_PERMISSIONS: '/employees',      // PATCH - Update permissions: /employees/:id/permissions
  UPDATE_STATUS: '/employees',           // PATCH - Update status: /employees/:id/status
};

// =====================================================
// Employee Service Functions
// =====================================================

/**
 * GET /api/employees
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - search: string (optional)
 * - hotelId: string (optional)
 * - department: string (optional)
 * - role: string (optional)
 * - status: string (optional)
 * 
 * Response: { success: true, data: { items: Employee[], total, page, limit, totalPages }, message, status }
 */
export async function getEmployees(params?: PaginationParams & { 
  hotelId?: string; 
  department?: string;
  role?: string;
  status?: string;
}): Promise<ApiResponse<PaginatedResponse<Employee>>> {
  return await apiGet<PaginatedResponse<Employee>>(ENDPOINTS.LIST, params);
}

/**
 * GET /api/employees/:id
 * 
 * Response: { success: true, data: Employee, message, status }
 */
export async function getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
  return await apiGet<Employee>(`${ENDPOINTS.GET_BY_ID}/${id}`);
}

/**
 * POST /api/employees
 * 
 * Request body:
 * {
 *   name: string,          // Required
 *   email: string,         // Required
 *   phone: string,         // Required
 *   role: string,          // Required
 *   hotelId: string,       // Required
 *   department: string,    // Required
 *   password: string       // Required for new employees
 * }
 * 
 * Response: { success: true, data: Employee, message: "Employee created", status: 201 }
 */
export async function createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
  return await apiPost<Employee>(ENDPOINTS.CREATE, data);
}

/**
 * PUT /api/employees/:id
 * 
 * Request body: Partial<CreateEmployeeRequest>
 * 
 * Response: { success: true, data: Employee, message: "Employee updated", status: 200 }
 */
export async function updateEmployee(id: string, data: Partial<CreateEmployeeRequest>): Promise<ApiResponse<Employee>> {
  return await apiPut<Employee>(`${ENDPOINTS.UPDATE}/${id}`, data);
}

/**
 * DELETE /api/employees/:id
 * 
 * Response: { success: true, data: null, message: "Employee deleted", status: 200 }
 */
export async function deleteEmployee(id: string): Promise<ApiResponse<null>> {
  return await apiDelete<null>(`${ENDPOINTS.DELETE}/${id}`);
}

/**
 * PATCH /api/employees/:id/permissions
 * 
 * Request body:
 * {
 *   permissions: Permission[]
 * }
 * 
 * Response: { success: true, data: Employee, message: "Permissions updated", status: 200 }
 */
export async function updateEmployeePermissions(id: string, permissions: Permission[]): Promise<ApiResponse<Employee>> {
  return await apiPatch<Employee>(`${ENDPOINTS.UPDATE_PERMISSIONS}/${id}/permissions`, { permissions });
}

/**
 * PATCH /api/employees/:id/status
 * 
 * Request body:
 * {
 *   status: 'active' | 'inactive' | 'suspended'
 * }
 * 
 * Response: { success: true, data: Employee, message: "Status updated", status: 200 }
 */
export async function updateEmployeeStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<Employee>> {
  return await apiPatch<Employee>(`${ENDPOINTS.UPDATE_STATUS}/${id}/status`, { status });
}

/**
 * Get employee statistics
 * GET /api/employees/stats
 */
export async function getEmployeeStats(): Promise<ApiResponse<{
  total: number;
  active: number;
  managers: number;
  departments: number;
}>> {
  return await apiGet(`${ENDPOINTS.LIST}/stats`);
}
