import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: (User & { password: string })[] = [
  {
    id: "u1",
    name: "Super Admin",
    email: "superadmin@luxestay.com",
    password: "admin123",
    role: "super-admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    id: "u2",
    name: "Hotel Admin",
    email: "admin@luxestay.com",
    password: "admin123",
    role: "sub-admin",
    hotelId: "h1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "u3",
    name: "John Manager",
    email: "manager@luxestay.com",
    password: "manager123",
    role: "manager",
    hotelId: "h1",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    id: "u4",
    name: "Jane Receptionist",
    email: "receptionist@luxestay.com",
    password: "staff123",
    role: "receptionist",
    hotelId: "h1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
];

const SESSION_KEY = "luxestay_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
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
