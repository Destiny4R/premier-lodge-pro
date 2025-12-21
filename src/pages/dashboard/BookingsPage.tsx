import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle,
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  FileText,
  LogOut,
} from "lucide-react";
import { bookings, guests, rooms, hotels, roomCategories, Booking } from "@/data/mockData";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusColors: Record<string, "success" | "info" | "warning" | "secondary"> = {
  "checked-in": "success",
  confirmed: "info",
  "checked-out": "secondary",
  cancelled: "warning",
};

export default function BookingsPage() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  const [bookingForm, setBookingForm] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    paidAmount: "",
  });

  const handleBookingSubmit = () => {
    toast.success("Booking created successfully");
    setBookingModalOpen(false);
  };

  const handleReservationSubmit = () => {
    toast.success("Reservation created successfully");
    setReservationModalOpen(false);
  };

  const handleCheckIn = (bookingId: string) => {
    toast.success("Guest checked in successfully");
  };

  const handleCancel = () => {
    toast.success("Booking cancelled");
    setCancelDialog({ open: false, id: "" });
  };

  const availableRooms = rooms.filter(r => r.status === "available");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Bookings & Reservations" subtitle="Manage all bookings and check-ins" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." className="pl-10 bg-secondary border-border" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setReservationModalOpen(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Reserve Room
            </Button>
            <Button variant="hero" onClick={() => setBookingModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Today's Check-ins", value: 12, icon: ArrowRight, color: "text-success" },
            { label: "Today's Check-outs", value: 8, icon: LogOut, color: "text-info" },
            { label: "Pending Payments", value: "$23,450", icon: DollarSign, color: "text-warning" },
            { label: "Active Bookings", value: 89, icon: Calendar, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Bookings</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Today</Button>
                <Button variant="ghost" size="sm">This Week</Button>
                <Button variant="ghost" size="sm">This Month</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Guest</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-in</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-out</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const guest = guests.find((g) => g.id === booking.guestId);
                      const room = rooms.find((r) => r.id === booking.roomId);
                      const hotel = hotels.find((h) => h.id === booking.hotelId);
                      return (
                        <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={guest?.avatar}
                                alt={guest?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">{guest?.name}</p>
                                <p className="text-sm text-muted-foreground">{guest?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-foreground">Room {room?.roomNumber}</p>
                            <p className="text-sm text-muted-foreground">{hotel?.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{booking.checkIn}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{booking.checkOut}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-foreground">${booking.totalAmount}</p>
                            <p className="text-xs text-muted-foreground">Paid: ${booking.paidAmount}</p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewBooking(booking)}>
                                  <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Booking
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {booking.status === "confirmed" && (
                                  <DropdownMenuItem onClick={() => handleCheckIn(booking.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> Check In
                                  </DropdownMenuItem>
                                )}
                                {booking.status === "checked-in" && (
                                  <DropdownMenuItem onClick={() => setCheckoutBooking(booking)}>
                                    <LogOut className="w-4 h-4 mr-2" /> Check Out
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link to={`/dashboard/checkout/${booking.id}`}>
                                    <FileText className="w-4 h-4 mr-2" /> Checkout Report
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setCancelDialog({ open: true, id: booking.id })}
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* New Booking Modal */}
      <FormModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        title="Create New Booking"
        description="Book a room for a guest with immediate confirmation"
        onSubmit={handleBookingSubmit}
        submitLabel="Create Booking"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Guest" required>
            <Select value={bookingForm.guestId} onValueChange={(v) => setBookingForm({ ...bookingForm, guestId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name} - {g.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Room" required>
            <Select value={bookingForm.roomId} onValueChange={(v) => setBookingForm({ ...bookingForm, roomId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select available room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => {
                  const hotel = hotels.find(h => h.id === r.hotelId);
                  const category = roomCategories.find(c => c.id === r.categoryId);
                  return (
                    <SelectItem key={r.id} value={r.id}>
                      Room {r.roomNumber} - {category?.name} ({hotel?.name}) - ${r.price}/night
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date" required>
              <Input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
              />
            </FormField>
            <FormField label="Check-out Date" required>
              <Input
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Payment Amount" hint="Initial payment">
            <Input
              type="number"
              value={bookingForm.paidAmount}
              onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })}
              placeholder="0"
            />
          </FormField>
        </div>
      </FormModal>

      {/* Reservation Modal */}
      <FormModal
        open={reservationModalOpen}
        onOpenChange={setReservationModalOpen}
        title="Reserve Room"
        description="Reserve a room without immediate payment"
        onSubmit={handleReservationSubmit}
        submitLabel="Create Reservation"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Guest" required>
            <Select value={bookingForm.guestId} onValueChange={(v) => setBookingForm({ ...bookingForm, guestId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name} - {g.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Room" required>
            <Select value={bookingForm.roomId} onValueChange={(v) => setBookingForm({ ...bookingForm, roomId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room to reserve" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => {
                  const hotel = hotels.find(h => h.id === r.hotelId);
                  const category = roomCategories.find(c => c.id === r.categoryId);
                  return (
                    <SelectItem key={r.id} value={r.id}>
                      Room {r.roomNumber} - {category?.name} ({hotel?.name}) - ${r.price}/night
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date" required>
              <Input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
              />
            </FormField>
            <FormField label="Check-out Date" required>
              <Input
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
              />
            </FormField>
          </div>
          <Card variant="glass" className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Reservations hold the room without payment. The guest must check in within 24 hours of the scheduled date or the reservation may be cancelled.
            </p>
          </Card>
        </div>
      </FormModal>

      {/* View Booking Modal */}
      <ViewModal
        open={!!viewBooking}
        onOpenChange={() => setViewBooking(null)}
        title="Booking Details"
        size="lg"
      >
        {viewBooking && (() => {
          const guest = guests.find(g => g.id === viewBooking.guestId);
          const room = rooms.find(r => r.id === viewBooking.roomId);
          const hotel = hotels.find(h => h.id === viewBooking.hotelId);
          const category = roomCategories.find(c => c.id === room?.categoryId);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <img src={guest?.avatar} alt={guest?.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-semibold text-foreground">{guest?.name}</h3>
                  <p className="text-sm text-muted-foreground">{guest?.email}</p>
                </div>
                <Badge variant={statusColors[viewBooking.status]} className="ml-auto">{viewBooking.status}</Badge>
              </div>
              <DetailRow label="Room" value={`Room ${room?.roomNumber} - ${category?.name}`} />
              <DetailRow label="Hotel" value={hotel?.name} />
              <DetailRow label="Check-in" value={viewBooking.checkIn} />
              <DetailRow label="Check-out" value={viewBooking.checkOut} />
              <DetailRow label="Total Amount" value={`$${viewBooking.totalAmount}`} />
              <DetailRow label="Paid Amount" value={`$${viewBooking.paidAmount}`} />
              <DetailRow label="Balance Due" value={`$${viewBooking.totalAmount - viewBooking.paidAmount}`} />
            </div>
          );
        })()}
      </ViewModal>

      {/* Checkout Modal */}
      <ViewModal
        open={!!checkoutBooking}
        onOpenChange={() => setCheckoutBooking(null)}
        title="Checkout Summary"
        size="lg"
      >
        {checkoutBooking && (() => {
          const guest = guests.find(g => g.id === checkoutBooking.guestId);
          const room = rooms.find(r => r.id === checkoutBooking.roomId);
          return (
            <div className="space-y-4">
              <Card variant="glass" className="p-4">
                <h4 className="font-semibold mb-3">Guest: {guest?.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Charges</span>
                    <span className="font-medium">${checkoutBooking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Restaurant Charges</span>
                    <span className="font-medium">$125.40</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Laundry Charges</span>
                    <span className="font-medium">$65.00</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">${checkoutBooking.totalAmount + 125.40 + 65}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Paid</span>
                    <span className="font-medium">-${checkoutBooking.paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t border-border pt-2 mt-2">
                    <span className="font-bold">Balance Due</span>
                    <span className="font-bold text-warning">${checkoutBooking.totalAmount + 125.40 + 65 - checkoutBooking.paidAmount}</span>
                  </div>
                </div>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setCheckoutBooking(null)}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1" onClick={() => {
                  toast.success("Guest checked out successfully");
                  setCheckoutBooking(null);
                }}>
                  Complete Checkout
                </Button>
              </div>
            </div>
          );
        })()}
      </ViewModal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        onConfirm={handleCancel}
        variant="destructive"
        confirmLabel="Cancel Booking"
      />
    </div>
  );
}
