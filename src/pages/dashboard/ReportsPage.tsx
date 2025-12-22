import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  BedDouble,
  Calendar,
  Filter,
  PieChart,
  LineChart as LineChartIcon,
  UtensilsCrossed,
  Shirt,
  Dumbbell,
  Waves,
  PartyPopper,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 45000, bookings: 120 },
  { month: "Feb", revenue: 52000, bookings: 145 },
  { month: "Mar", revenue: 48000, bookings: 132 },
  { month: "Apr", revenue: 61000, bookings: 167 },
  { month: "May", revenue: 55000, bookings: 152 },
  { month: "Jun", revenue: 67000, bookings: 189 },
  { month: "Jul", revenue: 72000, bookings: 201 },
  { month: "Aug", revenue: 78000, bookings: 215 },
  { month: "Sep", revenue: 65000, bookings: 178 },
  { month: "Oct", revenue: 58000, bookings: 156 },
  { month: "Nov", revenue: 62000, bookings: 171 },
  { month: "Dec", revenue: 85000, bookings: 234 },
];

const occupancyData = [
  { day: "Mon", occupancy: 72 },
  { day: "Tue", occupancy: 78 },
  { day: "Wed", occupancy: 85 },
  { day: "Thu", occupancy: 82 },
  { day: "Fri", occupancy: 95 },
  { day: "Sat", occupancy: 98 },
  { day: "Sun", occupancy: 88 },
];

const roomTypeData = [
  { name: "Standard", value: 35, color: "hsl(var(--primary))" },
  { name: "Deluxe", value: 28, color: "hsl(var(--info))" },
  { name: "Suite", value: 22, color: "hsl(var(--success))" },
  { name: "Presidential", value: 15, color: "hsl(var(--warning))" },
];

const restaurantData = [
  { time: "8AM", sales: 1200 },
  { time: "10AM", sales: 800 },
  { time: "12PM", sales: 3500 },
  { time: "2PM", sales: 2800 },
  { time: "4PM", sales: 1500 },
  { time: "6PM", sales: 2200 },
  { time: "8PM", sales: 4200 },
  { time: "10PM", sales: 2800 },
];

const serviceDistribution = [
  { name: "Room Charges", value: 45 },
  { name: "Restaurant", value: 25 },
  { name: "Laundry", value: 10 },
  { name: "Events", value: 12 },
  { name: "Gym & Pool", value: 8 },
];

const reportCategories = [
  { id: "overview", label: "Overview", icon: PieChart },
  { id: "rooms", label: "Rooms Report", icon: BedDouble },
  { id: "bookings", label: "Bookings Report", icon: Calendar },
  { id: "restaurant", label: "Restaurant Report", icon: UtensilsCrossed },
  { id: "laundry", label: "Laundry Report", icon: Shirt },
  { id: "events", label: "Events Report", icon: PartyPopper },
  { id: "gym", label: "Gym Report", icon: Dumbbell },
  { id: "pool", label: "Pool Report", icon: Waves },
  { id: "revenue", label: "Revenue Report", icon: DollarSign },
];

export default function ReportsPage() {
  const { reportType } = useParams();
  const activeReport = reportType || "overview";
  const [dateRange, setDateRange] = useState("this-month");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Reports & Analytics" subtitle="View detailed reports and export data" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                <SelectItem value="receptionist">Receptionists</SelectItem>
                <SelectItem value="restaurant">Restaurant Staff</SelectItem>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </motion.div>

        {/* Report Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {reportCategories.map((cat) => (
            <Link key={cat.id} to={cat.id === "overview" ? "/dashboard/reports" : `/dashboard/reports/${cat.id}`}>
              <Button
                variant={activeReport === cat.id ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            </Link>
          ))}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Revenue", value: "$145,680", change: "+12.3%", icon: DollarSign, trend: "up" },
            { label: "Occupancy Rate", value: "78%", change: "+5.2%", icon: BedDouble, trend: "up" },
            { label: "Total Guests", value: "1,245", change: "+8.1%", icon: Users, trend: "up" },
            { label: "Avg. Stay", value: "3.2 nights", change: "+0.5", icon: TrendingUp, trend: "up" },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <Badge variant="success" className="text-sm">{stat.change}</Badge>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Occupancy by Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekly Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value) => [`${value}%`, "Occupancy"]}
                    />
                    <Bar dataKey="occupancy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Room Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Room Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={roomTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roomTypeData.map((entry, index) => (
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
                      formatter={(value) => [`${value}%`, "Bookings"]}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Restaurant Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Restaurant Sales Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={restaurantData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value) => [`$${value}`, "Sales"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Service Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Service Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {serviceDistribution.map((service, index) => (
                  <div key={service.name} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${service.value * 2.51} 251`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-foreground">{service.value}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Revenue Report", "Occupancy Report", "Guest Statistics", "Restaurant Sales", "Laundry Services", "Event Bookings"].map((report) => (
                <Card key={report} variant="glass" className="p-4 flex items-center justify-between hover-lift cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium">{report}</span>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}