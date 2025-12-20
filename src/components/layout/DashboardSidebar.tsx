import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  UtensilsCrossed,
  Shirt,
  PartyPopper,
  Dumbbell,
  Waves,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Hotel,
  UserCog,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  userRole?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["all"] },
  { icon: BedDouble, label: "Rooms", path: "/dashboard/rooms", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: Users, label: "Guests", path: "/dashboard/guests", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: CalendarCheck, label: "Bookings", path: "/dashboard/bookings", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: UtensilsCrossed, label: "Restaurant & Bar", path: "/dashboard/restaurant", roles: ["sub-admin", "manager", "restaurant-staff"] },
  { icon: Shirt, label: "Laundry", path: "/dashboard/laundry", roles: ["sub-admin", "manager", "laundry-staff"] },
  { icon: PartyPopper, label: "Events", path: "/dashboard/events", roles: ["sub-admin", "manager", "event-manager"] },
  { icon: Dumbbell, label: "Gym", path: "/dashboard/gym", roles: ["sub-admin", "manager", "gym-head"] },
  { icon: Waves, label: "Pool", path: "/dashboard/pool", roles: ["sub-admin", "manager"] },
  { icon: BarChart3, label: "Reports", path: "/dashboard/reports", roles: ["sub-admin", "manager"] },
  { icon: UserCog, label: "Employees", path: "/dashboard/employees", roles: ["sub-admin", "manager"] },
  { icon: Shield, label: "Super Admin", path: "/dashboard/super-admin", roles: ["super-admin"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", roles: ["sub-admin", "super-admin"] },
];

export function DashboardSidebar({ userRole = "sub-admin" }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const actualRole = user?.role || userRole;
  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.includes("all") || item.roles.includes(actualRole)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center">
              <Hotel className="w-6 h-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-heading text-xl font-bold text-sidebar-foreground">
                LuxeStay
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">AU</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">Sub-Admin</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn(
              "w-full mt-3 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "px-0"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
