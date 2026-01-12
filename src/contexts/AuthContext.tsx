import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authService } from "@/services";
import { LoginResponse } from "@/types/api";
import { getStoredUser, getStoredToken, setAuthData, clearAuthData } from "@/lib/api";

// =====================================================
// Auth Context - API Integration
// =====================================================

export type UserRole = "Super Admin" | "SubAdmin" | "Manager" | "Receptionist" | "Gym Head" | "Dry Cleaner" | "Restaurant Bar";

export interface User {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: string[];
  hotelId?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return getStoredUser();
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return getStoredToken();
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Login user with email and password
   * 
   * API Endpoint: POST /api/auth/login
   * Request: { email: string, password: string }
   * Response: {
   *   success: boolean,
   *   data: {
   *     userId: string,
   *     userName: string,
   *     email: string,
   *     token: string,
   *     roles: string[],
   *     permissions: string[],
   *     expiresIn: number,
   *     hotelId?: string,
   *     avatar?: string
   *   },
   *   message: string,
   *   status: number
   * }
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        const userData: User = {
          userId: response.data.userId,
          userName: response.data.userName,
          email: response.data.email,
          roles: response.data.roles,
          permissions: response.data.permissions,
          hotelId: response.data.hotelId,
          avatar: response.data.avatar,
        };
        
        // Store auth data
        setAuthData(response.data.token, userData);
        setUser(userData);
        setToken(response.data.token);
        
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: response.message || "Login failed" };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || "An error occurred during login" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthData();
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        isLoading,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
