import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dumbbell,
} from "lucide-react";
import { dashboardStats, bookings, guests, rooms } from "@/data/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const stats = [
  {
    label: "Total Rooms",
    value: dashboardStats.totalRooms,
    icon: BedDouble,
    change: "+2.5%",
    trend: "up",
    description: "Available: " + dashboardStats.availableRooms,
  },
  {
    label: "Occupancy Rate",
    value: Math.round((dashboardStats.occupiedRooms / dashboardStats.totalRooms) * 100) + "%",
    icon: TrendingUp,
    change: "+5.2%",
    trend: "up",
    description: dashboardStats.occupiedRooms + " rooms occupied",
  },
  {
    label: "Today's Check-ins",
    value: dashboardStats.todayCheckIns,
    icon: CalendarCheck,
    change: "+3",
    trend: "up",
    description: dashboardStats.todayCheckOuts + " check-outs",
  },
  {
    label: "Total Revenue",
    value: "$" + dashboardStats.totalRevenue.toLocaleString(),
    icon: DollarSign,
    change: "+12.3%",
    trend: "up",
    description: "This month",
  },
];

const recentBookings = bookings.slice(0, 5);

// Chart data
const weeklyRevenueData = [
  { day: "Mon", revenue: 12500, bookings: 24 },
  { day: "Tue", revenue: 15800, bookings: 32 },
  { day: "Wed", revenue: 14200, bookings: 28 },
  { day: "Thu", revenue: 18500, bookings: 36 },
  { day: "Fri", revenue: 22000, bookings: 45 },
  { day: "Sat", revenue: 28500, bookings: 58 },
  { day: "Sun", revenue: 24000, bookings: 48 },
];

const serviceRevenueData = [
  { name: "Rooms", value: 45, color: "hsl(var(--primary))" },
  { name: "Restaurant", value: 28, color: "hsl(var(--info))" },
  { name: "Events", value: 15, color: "hsl(var(--success))" },
  { name: "Other", value: 12, color: "hsl(var(--warning))" },
];

const occupancyTrendData = [
  { hour: "6AM", rate: 92 },
  { hour: "9AM", rate: 88 },
  { hour: "12PM", rate: 75 },
  { hour: "3PM", rate: 82 },
  { hour: "6PM", rate: 95 },
  { hour: "9PM", rate: 98 },
  { hour: "12AM", rate: 96 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening today."
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
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
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weeklyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
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
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={serviceRevenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceRevenueData.map((entry, index) => (
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
                  {serviceRevenueData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {recentBookings.map((booking) => {
                    const guest = guests.find((g) => g.id === booking.guestId);
                    const room = rooms.find((r) => r.id === booking.roomId);
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {guest?.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{guest?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Room {room?.roomNumber}
                            </p>
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
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Room Status & Occupancy Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Room Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-sm text-foreground">Available</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {dashboardStats.availableRooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm text-foreground">Occupied</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {dashboardStats.occupiedRooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span className="text-sm text-foreground">Reserved</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {dashboardStats.upcomingReservations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-sm text-foreground">Maintenance</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {dashboardStats.maintenanceRooms}
                    </span>
                  </div>
                </div>

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