import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, EmptyState, StatsSkeleton, TableSkeleton } from "@/components/ui/loading-state";
import {
  BedDouble,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  UtensilsCrossed,
  Shirt,
} from "lucide-react";
import {
  getDashboardStats,
  getWeeklyRevenue,
  getServiceRevenue,
  getRecentBookings,
  getRoomStatus,
} from "@/services/dashboardService";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency";

// Chart colors
const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

interface DashboardData {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    totalRevenue: number;
    maintenanceRooms: number;
    upcomingReservations: number;
  } | null;
  weeklyRevenue: { day: string; revenue: number; bookings: number }[];
  serviceRevenue: { name: string; value: number }[];
  recentBookings: Array<{
    id: string;
    guestName: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
  roomStatus: {
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
  } | null;
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    weeklyRevenue: [],
    serviceRevenue: [],
    recentBookings: [],
    roomStatus: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all dashboard data in parallel
      const [statsRes, weeklyRes, serviceRes, bookingsRes, roomStatusRes] = await Promise.all([
        getDashboardStats(),
        getWeeklyRevenue(),
        getServiceRevenue(),
        getRecentBookings(),
        getRoomStatus(),
      ]);

      setData({
        stats: statsRes.success ? statsRes.data : null,
        weeklyRevenue: weeklyRes.success ? weeklyRes.data : [],
        serviceRevenue: serviceRes.success ? serviceRes.data : [],
        recentBookings: bookingsRes.success ? bookingsRes.data : [],
        roomStatus: roomStatusRes.success ? roomStatusRes.data : null,
      });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute stats for display
  const stats = data.stats
    ? [
        {
          label: "Total Rooms",
          value: data.stats.totalRooms,
          icon: BedDouble,
          change: "+2.5%",
          trend: "up" as const,
          description: `Available: ${data.stats.availableRooms}`,
        },
        {
          label: "Occupancy Rate",
          value: data.stats.totalRooms > 0 
            ? `${Math.round((data.stats.occupiedRooms / data.stats.totalRooms) * 100)}%`
            : "0%",
          icon: TrendingUp,
          change: "+5.2%",
          trend: "up" as const,
          description: `${data.stats.occupiedRooms} rooms occupied`,
        },
        {
          label: "Today's Check-ins",
          value: data.stats.todayCheckIns,
          icon: CalendarCheck,
          change: "+3",
          trend: "up" as const,
          description: `${data.stats.todayCheckOuts} check-outs`,
        },
        {
          label: "Total Revenue",
          value: formatCurrency(data.stats.totalRevenue),
          icon: DollarSign,
          change: "+12.3%",
          trend: "up" as const,
          description: "This month",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening today."
        />
        <div className="p-6 space-y-6">
          <StatsSkeleton count={4} />
          <TableSkeleton rows={5} columns={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening today."
        />
        <div className="p-6">
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="Unable to load dashboard"
                description={error}
                action={<Button variant="outline" onClick={fetchDashboardData}>Retry</Button>}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening today."
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        {stats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge
                        variant={stat.trend === "up" ? "success" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                      <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                title="No statistics available"
                description="Dashboard statistics will appear here once data is available."
              />
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Weekly Revenue</CardTitle>
                <Badge variant="secondary">This Week</Badge>
              </CardHeader>
              <CardContent>
                {data.weeklyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data.weeklyRevenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrencyCompact(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--popover-foreground))",
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    title="No revenue data"
                    description="Revenue data will appear here once available."
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Revenue Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Service</CardTitle>
              </CardHeader>
              <CardContent>
                {data.serviceRevenue.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={data.serviceRevenue}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.serviceRevenue.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--popover-foreground))",
                          }}
                          formatter={(value) => [`${value}%`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {data.serviceRevenue.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No service data"
                    description="Service revenue breakdown will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Bookings</CardTitle>
                <Link to="/dashboard/bookings">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {data.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {booking.guestName?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{booking.guestName}</p>
                            <p className="text-sm text-muted-foreground">Room {booking.roomNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              booking.status === "checked-in"
                                ? "success"
                                : booking.status === "confirmed"
                                ? "info"
                                : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {booking.checkIn} - {booking.checkOut}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent bookings"
                    description="Recent bookings will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Room Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Status</CardTitle>
              </CardHeader>
              <CardContent>
                {data.roomStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="text-sm text-foreground">Available</span>
                      </div>
                      <span className="font-semibold text-foreground">{data.roomStatus.available}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-sm text-foreground">Occupied</span>
                      </div>
                      <span className="font-semibold text-foreground">{data.roomStatus.occupied}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span className="text-sm text-foreground">Reserved</span>
                      </div>
                      <span className="font-semibold text-foreground">{data.roomStatus.reserved}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <span className="text-sm text-foreground">Maintenance</span>
                      </div>
                      <span className="font-semibold text-foreground">{data.roomStatus.maintenance}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No room data"
                    description="Room status will appear here."
                  />
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Last updated: Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: "New Booking", icon: CalendarCheck, color: "bg-primary/10 text-primary", href: "/dashboard/bookings" },
                  { label: "Check-in Guest", icon: Users, color: "bg-success/10 text-success", href: "/dashboard/guests" },
                  { label: "Add Room", icon: BedDouble, color: "bg-info/10 text-info", href: "/dashboard/rooms" },
                  { label: "View Reports", icon: TrendingUp, color: "bg-warning/10 text-warning", href: "/dashboard/reports" },
                  { label: "Restaurant Order", icon: UtensilsCrossed, color: "bg-destructive/10 text-destructive", href: "/dashboard/restaurant/orders" },
                  { label: "Laundry Order", icon: Shirt, color: "bg-muted text-muted-foreground", href: "/dashboard/laundry" },
                ].map((action) => (
                  <Link key={action.label} to={action.href}>
                    <button
                      className="w-full flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
