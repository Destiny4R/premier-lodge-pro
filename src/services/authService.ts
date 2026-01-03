import { apiPost, setAuthToken, setUserData, removeAuthToken, getUserData } from '@/lib/api';
import { 
  ApiResponse, 
  LoginResponse, 
  LoginRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from '@/types/api';

// =====================================================
// Auth Service - Handles authentication API calls
// =====================================================
// ENDPOINT CONFIGURATION:
// Replace these endpoints with your actual API endpoints
// =====================================================

const ENDPOINTS = {
  LOGIN: '/auth/login',           // POST - Login endpoint
  LOGOUT: '/auth/logout',         // POST - Logout endpoint (optional)
  RESET_PASSWORD: '/auth/reset-password',    // POST - Request password reset
  CHANGE_PASSWORD: '/auth/change-password',  // POST - Change password
  FORGOT_PASSWORD: '/auth/forgot-password',  // POST - Forgot password
};

/**
 * POST /api/auth/login
 * 
 * Request payload:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Login successful",
 *   statusCode: 200,
 *   data: {
 *     userId: "f0490b44-450d-4690-8a78-8c87df797bf2",
 *     userName: "user@example.com",
 *     email: "user@example.com",
 *     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
 *     roles: ["SubAdmin"],
 *     permissions: ["Full Control", "Can Edit", "Can Delete", "Can View", "Can Create"],
 *     expiresIn: 10000,
 *     hotelId?: "hotel-uuid",
 *     avatar?: "https://..."
 *   }
 * }
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiPost<LoginResponse>(ENDPOINTS.LOGIN, credentials);
  
  if (response.success && response.data) {
    // Store token and user data
    setAuthToken(response.data.token);
    setUserData({
      userId: response.data.userId,
      userName: response.data.userName,
      email: response.data.email,
      roles: response.data.roles,
      permissions: response.data.permissions,
      hotelId: response.data.hotelId,
      avatar: response.data.avatar,
    });
  }
  
  return response;
}

/**
 * Logout user - clears local storage
 */
export function logout(): void {
  removeAuthToken();
}

/**
 * Get current user from storage
 */
export function getCurrentUser() {
  return getUserData();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getUserData();
}

/**
 * POST /api/auth/reset-password
 * 
 * Request payload:
 * {
 *   email: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Password reset link sent to your email",
 *   status: 200,
 *   data: null
 * }
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
  return await apiPost<null>(ENDPOINTS.RESET_PASSWORD, data);
}

/**
 * POST /api/auth/change-password
 * 
 * Request payload:
 * {
 *   currentPassword: string,
 *   newPassword: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Password changed successfully",
 *   status: 200,
 *   data: null
 * }
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
  return await apiPost<null>(ENDPOINTS.CHANGE_PASSWORD, data);
}

// Export as object for named import compatibility
export const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  resetPassword,
  changePassword,
};
