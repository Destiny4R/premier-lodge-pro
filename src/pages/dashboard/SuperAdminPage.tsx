import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { 
  Hotel, Plus, Search, Building2, Users, DollarSign, 
  MoreVertical, Edit, Pause, Play, Trash, Eye, TrendingUp 
} from "lucide-react";
import { hotels as initialHotels, Hotel as HotelType } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000, bookings: 120 },
  { month: "Feb", revenue: 52000, bookings: 145 },
  { month: "Mar", revenue: 48000, bookings: 132 },
  { month: "Apr", revenue: 61000, bookings: 165 },
  { month: "May", revenue: 55000, bookings: 150 },
  { month: "Jun", revenue: 67000, bookings: 180 },
];

export default function SuperAdminPage() {
  const [hotels, setHotels] = useState(initialHotels);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "suspended">("active");
  const [formData, setFormData] = useState({ name: "", city: "", address: "" });

  const handleAddHotel = () => {
    const newHotel: HotelType = {
      id: `h${Date.now()}`,
      name: formData.name,
      city: formData.city,
      address: formData.address,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      rating: 4.5,
      status: "active",
    };
    setHotels([...hotels, newHotel]);
    setShowAddModal(false);
    setFormData({ name: "", city: "", address: "" });
    toast.success("Hotel added successfully");
  };

  const handleStatusChange = () => {
    if (!selectedHotel) return;
    setHotels(hotels.map((h) => (h.id === selectedHotel.id ? { ...h, status: newStatus } : h)));
    setShowStatusDialog(false);
    toast.success(`Hotel ${newStatus === "active" ? "activated" : newStatus === "suspended" ? "suspended" : "deactivated"}`);
  };

  const statusColors = { active: "success", inactive: "secondary", suspended: "destructive" } as const;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Super Admin Dashboard" subtitle="Manage all hotels and system settings" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Hotels", value: hotels.length, icon: Building2, change: "+2" },
            { label: "Active Hotels", value: hotels.filter((h) => h.status === "active").length, icon: Hotel, change: "+1" },
            { label: "Total Revenue", value: "₦328M", icon: DollarSign, change: "+15%" },
            { label: "Total Guests", value: "2,450", icon: Users, change: "+8%" },
          ].map((stat) => (
            <Card key={stat.label} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <Badge variant="success">{stat.change}</Badge>
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Bookings per Month</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Hotels List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Hotels</CardTitle>
            <Button variant="hero" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" />Add Hotel</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.map((hotel) => (
                <Card key={hotel.id} variant="elevated" className="overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground">{hotel.city}</p>
                      </div>
                      <Badge variant={statusColors[hotel.status]}>{hotel.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedHotel(hotel); setNewStatus(hotel.status === "active" ? "suspended" : "active"); setShowStatusDialog(true); }}>
                        {hotel.status === "active" ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                        {hotel.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <FormModal open={showAddModal} onOpenChange={setShowAddModal} title="Add New Hotel" onSubmit={handleAddHotel} submitLabel="Add Hotel">
        <div className="space-y-4">
          <FormField type="text" name="name" label="Hotel Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
          <FormField type="text" name="city" label="City" value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} required />
          <FormField type="text" name="address" label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} required />
        </div>
      </FormModal>

      <ConfirmDialog open={showStatusDialog} onOpenChange={setShowStatusDialog} title={`${newStatus === "active" ? "Activate" : "Suspend"} Hotel`} description={`Are you sure you want to ${newStatus === "active" ? "activate" : "suspend"} ${selectedHotel?.name}?`} confirmLabel="Confirm" onConfirm={handleStatusChange} variant={newStatus === "active" ? "info" : "warning"} />
    </div>
  );
}
