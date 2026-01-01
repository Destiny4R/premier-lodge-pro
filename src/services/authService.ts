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
  try {
    const response = await apiPost<LoginResponse>('/auth/login', credentials);
    
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
  } catch (error) {
    // For demo purposes, simulate successful login
    // REMOVE THIS IN PRODUCTION - Replace with actual API call
    console.warn('API not available, using mock login');
    
    const mockUsers: Record<string, LoginResponse> = {
      'superadmin@luxestay.com': {
        userId: 'u1',
        userName: 'Super Admin',
        email: 'superadmin@luxestay.com',
        token: 'mock-token-super-admin',
        roles: ['SuperAdmin'],
        permissions: ['Full Control'],
        expiresIn: 10000,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      },
      'admin@luxestay.com': {
        userId: 'u2',
        userName: 'Hotel Admin',
        email: 'admin@luxestay.com',
        token: 'mock-token-sub-admin',
        roles: ['SubAdmin'],
        permissions: ['Full Control', 'Can Edit', 'Can Delete', 'Can View', 'Can Create'],
        expiresIn: 10000,
        hotelId: 'h1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      },
      'manager@luxestay.com': {
        userId: 'u3',
        userName: 'John Manager',
        email: 'manager@luxestay.com',
        token: 'mock-token-manager',
        roles: ['Manager'],
        permissions: ['Can Edit', 'Can View', 'Can Create'],
        expiresIn: 10000,
        hotelId: 'h1',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      },
      'receptionist@luxestay.com': {
        userId: 'u4',
        userName: 'Jane Receptionist',
        email: 'receptionist@luxestay.com',
        token: 'mock-token-receptionist',
        roles: ['Receptionist'],
        permissions: ['Can View', 'Can Create'],
        expiresIn: 10000,
        hotelId: 'h1',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      },
    };
    
    const mockPasswords: Record<string, string> = {
      'superadmin@luxestay.com': 'admin123',
      'admin@luxestay.com': 'admin123',
      'manager@luxestay.com': 'manager123',
      'receptionist@luxestay.com': 'staff123',
    };
    
    const user = mockUsers[credentials.email.toLowerCase()];
    const validPassword = mockPasswords[credentials.email.toLowerCase()];
    
    if (user && validPassword === credentials.password) {
      setAuthToken(user.token);
      setUserData({
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        hotelId: user.hotelId,
        avatar: user.avatar,
      });
      
      return {
        success: true,
        data: user,
        message: 'Login successful',
        status: 200,
      };
    }
    
    return {
      success: false,
      data: null as unknown as LoginResponse,
      message: 'Invalid email or password',
      status: 401,
    };
  }
}

/**
 * Logout user
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
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
  try {
    return await apiPost<null>('/auth/reset-password', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Password reset link sent to your email',
      status: 200,
    };
  }
}

/**
 * POST /api/auth/change-password
 * 
 * Request payload:
 * {
 *   currentPassword: string,
 *   newPassword: string
 * }
 */
export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
  try {
    return await apiPost<null>('/auth/change-password', data);
  } catch (error) {
    // Mock response for demo
    console.warn('API not available, using mock response');
    return {
      success: true,
      data: null,
      message: 'Password changed successfully',
      status: 200,
    };
  }
}
