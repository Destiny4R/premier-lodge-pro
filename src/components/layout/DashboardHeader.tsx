import { Bell, Search, Menu, Moon, Sun, User, Settings, Lock, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { setMobileOpen } = useSidebarContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get display name and role from new user format
  const displayName = user?.userName || "Admin User";
  const displayRole = user?.roles?.[0] || "User";

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-3 sm:px-6">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-heading font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
          {/* Search - Hidden on mobile */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-48 xl:w-64 pl-10 bg-secondary border-border"
            />
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 sm:h-9 sm:w-9">
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 h-8 sm:h-9">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-primary">
                    {displayName.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {displayRole}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-3 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-primary">
                    {displayName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@luxestay.com"}</p>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/change-password")} className="cursor-pointer">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
