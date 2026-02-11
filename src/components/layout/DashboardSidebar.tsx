import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  ShoppingBag,
  PieChart,
  Building2,
  DollarSign,
  X,
  FolderOpen,
  Package,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarContext } from "@/contexts/SidebarContext";

interface SidebarProps {
  userRole?: string;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: string[];
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["all"] },
  { icon: BedDouble, label: "Rooms", path: "/dashboard/rooms", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: Users, label: "Guests", path: "/dashboard/guests", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: CalendarCheck, label: "Bookings", path: "/dashboard/bookings", roles: ["sub-admin", "manager", "receptionist"] },
  { 
    icon: UtensilsCrossed, 
    label: "Restaurant & Bar", 
    path: "/dashboard/restaurant", 
    roles: ["sub-admin", "manager", "restaurant"],
    children: [
      { icon: FolderOpen, label: "Food Categories", path: "/dashboard/restaurant/categories", roles: ["all"] },
      { icon: Package, label: "Stock Management", path: "/dashboard/restaurant/stock", roles: ["all"] },
      { icon: ShoppingCart, label: "Take Order", path: "/dashboard/restaurant/orders", roles: ["all"] },
      { icon: Receipt, label: "Purchases", path: "/dashboard/restaurant/purchases", roles: ["all"] },
    ]
  },
  { icon: Shirt, label: "Laundry", path: "/dashboard/laundry", roles: ["sub-admin", "manager", "dry cleaner"] },
  { icon: PartyPopper, label: "Events", path: "/dashboard/events", roles: ["sub-admin", "manager", "receptionist"] },
  { icon: Dumbbell, label: "Gym", path: "/dashboard/gym", roles: ["sub-admin", "manager", "gymhead"] },
  { icon: Waves, label: "Pool", path: "/dashboard/pool", roles: ["sub-admin", "manager"] },
  { 
    icon: BarChart3, 
    label: "Reports", 
    path: "/dashboard/reports", 
    roles: ["sub-admin", "manager"],
    children: [
      { icon: PieChart, label: "Overview", path: "/dashboard/reports", roles: ["sub-admin"] },
      { icon: BedDouble, label: "Rooms Report", path: "/dashboard/reports/rooms", roles: ["sub-admin"] },
      { icon: CalendarCheck, label: "Bookings Report", path: "/dashboard/reports/bookings", roles: ["sub-admin"] },
      { icon: UtensilsCrossed, label: "Restaurant Report", path: "/dashboard/reports/restaurant", roles: ["sub-admin"] },
      { icon: Shirt, label: "Laundry Report", path: "/dashboard/reports/laundry", roles: ["sub-admin"] },
      { icon: PartyPopper, label: "Events Report", path: "/dashboard/reports/events", roles: ["sub-admin"] },
      { icon: Dumbbell, label: "Gym Report", path: "/dashboard/reports/gym", roles: ["sub-admin"] },
      { icon: Waves, label: "Pool Report", path: "/dashboard/reports/pool", roles: ["sub-admin"] },
      { icon: DollarSign, label: "Revenue Report", path: "/dashboard/reports/revenue", roles: ["sub-admin"] },
    ]
  },
  { icon: UserCog, label: "Employees", path: "/dashboard/employees", roles: ["sub-admin", "Manager"] },
  { icon: Building2, label: "Departments", path: "/dashboard/departments", roles: ["sub-admin", "Manager"] },
  { icon: Shield, label: "Super Admin", path: "/dashboard/super-admin", roles: ["super-admin"] },
  { icon: UserCog, label: "Hotel Admins", path: "/dashboard/hotel-admins", roles: ["super-admin"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", roles: ["sub-admin", "super-admin"] },
];

export function DashboardSidebar({ userRole = "sub-admin" }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed, isMobileOpen, setMobileOpen } = useSidebarContext();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const actualRoleRaw = user?.roles?.[0] || userRole;

  const normalizeRole = (r: string | undefined) =>
    (r || "").toString().toLowerCase().replace(/\s+/g, "").replace(/[-_]/g, "");

  const normalizedActual = normalizeRole(actualRoleRaw as string);

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes("all") || item.roles.some((role) => normalizeRole(role) === normalizedActual)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleExpanded = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    );
  };

  const isMenuExpanded = (label: string) => expandedMenus.includes(label);

  const isActiveRoute = (path: string, children?: MenuItem[]) => {
    if (location.pathname === path) return true;
    if (children) {
      return children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden lg:flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center flex-shrink-0">
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
              onClick={toggleCollapsed}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = isActiveRoute(item.path, item.children);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = isMenuExpanded(item.label);

                if (hasChildren && !collapsed) {
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={cn(
                          "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-sidebar-primary/20 text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.children?.map((child) => {
                              const isChildActive = location.pathname === child.path;
                              return (
                                <li key={child.path}>
                                  <Link
                                    to={child.path}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                      isChildActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                  >
                                    <child.icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{child.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? item.label : undefined}
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
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  {user?.userName?.charAt(0) || "A"}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.userName || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {user?.roles?.[0] || "User"}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-screen w-[280px] bg-sidebar border-r border-sidebar-border lg:hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
                <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                  <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-heading text-xl font-bold text-sidebar-foreground">
                    LuxeStay
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                  {filteredMenuItems.map((item) => {
                    const isActive = isActiveRoute(item.path, item.children);
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = isMenuExpanded(item.label);

                    if (hasChildren) {
                      return (
                        <li key={item.path}>
                          <button
                            onClick={() => toggleExpanded(item.label)}
                            className={cn(
                              "flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-sidebar-primary/20 text-sidebar-primary-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 mt-1 space-y-1 overflow-hidden"
                              >
                                {item.children?.map((child) => {
                                  const isChildActive = location.pathname === child.path;
                                  return (
                                    <li key={child.path}>
                                      <button
                                        onClick={() => handleNavigation(child.path)}
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm w-full text-left",
                                          isChildActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        )}
                                      >
                                        <child.icon className="w-4 h-4 flex-shrink-0" />
                                        <span>{child.label}</span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    }

                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <span className="text-sm font-semibold text-sidebar-foreground">
                      {user?.userName?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.userName || "Admin User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {user?.roles?.[0] || "User"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full mt-3 text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}