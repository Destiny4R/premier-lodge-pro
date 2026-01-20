import { useState, useEffect } from "react";
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
  DollarSign,
  ArrowRight,
  CheckCircle,
  MoreVertical,
  Eye,
  Edit,
  XCircle,
  FileText,
  LogOut,
  Clock,
  ChevronDown,
} from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { DatePicker } from "@/components/ui/date-picker";
import {
  getBookings,
  getBookingStats,
  createBooking,
  createReservation,
  checkIn,
  checkOut,
  cancelBooking,
  extendBooking,
  BookingFilterPeriod,
} from "@/services/bookingService";
import { getRooms } from "@/services/roomService";
import { getGuests } from "@/services/guestService";
import { Booking, Room, Guest, PaginationParams } from "@/types/api";

const statusColors: Record<string, "success" | "info" | "warning" | "secondary"> = {
  "checked-in": "success",
  confirmed: "info",
  "checked-out": "secondary",
  cancelled: "warning",
};

const typeColors: Record<string, "success" | "info"> = {
  "check-in": "success",
  "reservation": "info",
};

export default function BookingsPage() {
  // API States
  const bookingsApi = useApi<{ items: Booking[]; totalItems: number }>();
  const statsApi = useApi<{ todayCheckIns: number; todayCheckOuts: number; pendingPayments: number; activeBookings: number }>();
  const roomsApi = useApi<{ items: Room[]; totalItems: number }>();
  const guestsApi = useApi<{ items: Guest[]; totalItems: number }>();
  const mutationApi = useApi<Booking | null>({ showSuccessToast: true });

  // Local state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState({ todayCheckIns: 0, todayCheckOuts: 0, pendingPayments: 0, activeBookings: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [periodFilter, setPeriodFilter] = useState<BookingFilterPeriod>('all');

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [bookingForm, setBookingForm] = useState({
    guestId: "",
    roomId: "",
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    paidAmount: "",
  });

  const [extendForm, setExtendForm] = useState({
    newCheckOut: null as Date | null,
    additionalPayment: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchBookings({ page, pageSize, period: periodFilter !== 'all' ? periodFilter : undefined });
    fetchStats();
    fetchRooms();
    fetchGuests();
  }, []);

  // Debounced search and period filter
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBookings({ 
        search: searchQuery || undefined, 
        page, 
        pageSize,
        period: periodFilter !== 'all' ? periodFilter : undefined
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, page, pageSize, periodFilter]);

  // Keep check-in/check-out consistent and not in the past
  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    setBookingForm((prev) => {
      let changed = false;
      let next = { ...prev };

      if (next.checkIn && next.checkIn < today) {
        next.checkIn = null;
        changed = true;
      }

      if (next.checkOut && next.checkOut < today) {
        next.checkOut = null;
        changed = true;
      }

      if (next.checkIn && next.checkOut && next.checkOut < next.checkIn) {
        next.checkOut = null;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  const fetchBookings = async (params?: PaginationParams & { period?: BookingFilterPeriod }) => {
    /**
     * GET /api/v3/bookings/getbookings
     * Query params: { page, pageSize, search, period: 'today' | 'this_week' | 'this_month' }
     * Returns: { success: boolean, data: { items: Booking[], totalItems: number, ... }, message: string }
     */
    const response = await bookingsApi.execute(() => getBookings(params));
    console.log(response);
    if (response.success && response.data) {
      setBookings(response.data.items);
    }
  };

  const fetchStats = async () => {
    /**
     * GET /api/bookings/stats
     * Returns: { success: boolean, data: { todayCheckIns, todayCheckOuts, pendingPayments, activeBookings }, message: string }
     */
    const response = await statsApi.execute(() => getBookingStats());
    if (response.success && response.data) {
      setStats(response.data);
    }
  };

  const fetchRooms = async () => {
    /**
     * GET /api/rooms?status=available
     * Returns available rooms for booking
     */
    const response = await roomsApi.execute(() => getRooms({ status: 'available' }));
    if (response.success && response.data) {
      setRooms(response.data.items);
    }
  };

  const fetchGuests = async () => {
    /**
     * GET /api/guests
     * Returns all guests for selection
     */
    const response = await guestsApi.execute(() => getGuests());
    if (response.success && response.data) {
      setGuests(response.data.items);
    }
  };

  const resetForm = () => {
    setBookingForm({ guestId: "", roomId: "", checkIn: null, checkOut: null, paidAmount: "" });
  };

  const handleBookingSubmit = async () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    /**
     * POST /api/bookings
     * Request: { guestId, roomId, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), paidAmount }
     */
    const response = await mutationApi.execute(() =>
      createBooking({
        guestId: bookingForm.guestId,
        roomId: bookingForm.roomId,
        checkIn: bookingForm.checkIn!.toISOString().split('T')[0],
        checkOut: bookingForm.checkOut!.toISOString().split('T')[0],
        paidAmount: parseFloat(bookingForm.paidAmount) || 0,
      })
    );
    if (response.success) {
      fetchBookings();
      fetchStats();
      fetchRooms();
      setBookingModalOpen(false);
      resetForm();
    }
  };

  const handleReservationSubmit = async () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    /**
     * POST /api/bookings/reservation
     * Request: { guestId, roomId, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD) }
     */
    const response = await mutationApi.execute(() =>
      createReservation({
        guestId: bookingForm.guestId,
        roomId: bookingForm.roomId,
        checkIn: bookingForm.checkIn!.toISOString().split('T')[0],
        checkOut: bookingForm.checkOut!.toISOString().split('T')[0],
      })
    );
    if (response.success) {
      fetchBookings();
      fetchStats();
      fetchRooms();
      setReservationModalOpen(false);
      resetForm();
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    /**
     * PUT /api/bookings/:id/check-in
     */
    const response = await mutationApi.execute(() => checkIn(bookingId));
    if (response.success) {
      fetchBookings();
      fetchStats();
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    /**
     * PUT /api/bookings/:id/check-out
     */
    const response = await mutationApi.execute(() => checkOut(bookingId));
    if (response.success) {
      fetchBookings();
      fetchStats();
      fetchRooms();
      setCheckoutBooking(null);
    }
  };

  const handleCancel = async () => {
    /**
     * PUT /api/bookings/:id/cancel
     */
    const response = await mutationApi.execute(() => cancelBooking(cancelDialog.id));
    if (response.success) {
      fetchBookings();
      fetchStats();
      fetchRooms();
      setCancelDialog({ open: false, id: "" });
    }
  };

  const availableRooms = rooms.filter(r => r.status === "Available");
  const isLoading = bookingsApi.isLoading || statsApi.isLoading;

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
              <Input placeholder="Search bookings..." className="pl-10 bg-secondary border-border" onChange={(e) => { setSearchQuery((e.target as HTMLInputElement).value); setPage(1); }} value={searchQuery} />
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
            { label: "Today's Check-ins", value: stats.todayCheckIns, icon: ArrowRight, color: "text-success" },
            { label: "Today's Check-outs", value: stats.todayCheckOuts, icon: LogOut, color: "text-info" },
            { label: "Pending Payments", value: `$${stats.pendingPayments.toLocaleString()}`, icon: DollarSign, color: "text-warning" },
            { label: "Active Bookings", value: stats.activeBookings, icon: Calendar, color: "text-primary" },
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

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading bookings..." />}

        {/* Error State */}
        {bookingsApi.error && !isLoading && (
          <ErrorState message={bookingsApi.error} onRetry={fetchBookings} />
        )}

        {/* Bookings Table */}
        {!isLoading && !bookingsApi.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">All Bookings</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={periodFilter === 'today' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setPeriodFilter(periodFilter === 'today' ? 'all' : 'today')}
                  >
                    Today
                  </Button>
                  <Button 
                    variant={periodFilter === 'this_week' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setPeriodFilter(periodFilter === 'this_week' ? 'all' : 'this_week')}
                  >
                    This Week
                  </Button>
                  <Button 
                    variant={periodFilter === 'this_month' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setPeriodFilter(periodFilter === 'this_month' ? 'all' : 'this_month')}
                  >
                    This Month
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No bookings found"
                    description="Create your first booking to get started"
                    action={
                      <Button onClick={() => setBookingModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                      </Button>
                    }
                  />
                ) : (
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
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={booking.guestAvatar || 'https://ui-avatars.com/api/?name=Guest'}
                                  alt={booking.guestName || 'Guest'}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-foreground">{booking.guestName || '-'}</p>
                                  <p className="text-sm text-muted-foreground">{booking.guestEmail || '-'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium text-foreground">Room {booking.roomNumber || '-'}</p>
                              <p className="text-sm text-muted-foreground">{booking.hotelName || '-'}</p>
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
                              <p className="font-semibold text-foreground">₦{booking.totalAmount?.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Paid: ₦{booking.paidAmount?.toLocaleString()}</p>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
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
        isLoading={mutationApi.isLoading}
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
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    Room {r.doorNumber} - {r.categoryName || 'Unknown'} ({r.hotelName || 'Unknown'}) - ₦{r.price?.toLocaleString()}/night
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date" required>
              <DatePicker
                value={bookingForm.checkIn}
                onChange={(date) => setBookingForm(prev => ({ ...prev, checkIn: date }))}
                placeholder="Select check-in date"
              />
            </FormField>
            <FormField label="Check-out Date" required>
              <DatePicker
                value={bookingForm.checkOut}
                onChange={(date) => setBookingForm(prev => ({ ...prev, checkOut: date }))}
                placeholder="Select check-out date"
                minDate={bookingForm.checkIn || undefined}
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
        isLoading={mutationApi.isLoading}
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
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    Room {r.doorNumber} - {r.categoryName || 'Unknown'} ({r.hotelName || 'Unknown'}) - ₦{r.price?.toLocaleString()}/night
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date" required>
              <DatePicker
                value={bookingForm.checkIn}
                onChange={(date) => setBookingForm(prev => ({ ...prev, checkIn: date }))}
                placeholder="Select check-in date"
              />
            </FormField>
            <FormField label="Check-out Date" required>
              <DatePicker
                value={bookingForm.checkOut}
                onChange={(date) => setBookingForm(prev => ({ ...prev, checkOut: date }))}
                placeholder="Select check-out date"
                minDate={bookingForm.checkIn || undefined}
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
        {viewBooking && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <img src={viewBooking.guestAvatar || 'https://ui-avatars.com/api/?name=Guest'} alt={viewBooking.guestName || 'Guest'} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-semibold text-foreground">{viewBooking.guestName || '-'}</h3>
                <p className="text-sm text-muted-foreground">{viewBooking.guestEmail || '-'}</p>
              </div>
              <Badge variant={statusColors[viewBooking.status]} className="ml-auto">{viewBooking.status}</Badge>
            </div>
            <DetailRow label="Room" value={`Room ${viewBooking.roomNumber || '-'}`} />
            <DetailRow label="Hotel" value={viewBooking.hotelName || '-'} />
            <DetailRow label="Check-in" value={viewBooking.checkIn} />
            <DetailRow label="Check-out" value={viewBooking.checkOut} />
            <DetailRow label="Total Amount" value={`₦${viewBooking.totalAmount?.toLocaleString()}`} />
            <DetailRow label="Paid Amount" value={`₦${viewBooking.paidAmount?.toLocaleString()}`} />
            <DetailRow label="Balance Due" value={`₦${(viewBooking.totalAmount - viewBooking.paidAmount)?.toLocaleString()}`} />
          </div>
        )}
      </ViewModal>

      {/* Checkout Modal */}
      <ViewModal
        open={!!checkoutBooking}
        onOpenChange={() => setCheckoutBooking(null)}
        title="Checkout Summary"
        size="lg"
      >
        {checkoutBooking && (
          <div className="space-y-4">
            <Card variant="glass" className="p-4">
              <h4 className="font-semibold mb-3">Guest: {checkoutBooking.guestName || '-'}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Charges</span>
                  <span className="font-medium">₦{checkoutBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restaurant Charges</span>
                  <span className="font-medium">₦0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Laundry Charges</span>
                  <span className="font-medium">₦0</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">₦{checkoutBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="font-medium">-₦{checkoutBooking.paidAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-border pt-2 mt-2">
                  <span className="font-bold">Balance Due</span>
                  <span className="font-bold text-warning">₦{(checkoutBooking.totalAmount - checkoutBooking.paidAmount)?.toLocaleString()}</span>
                </div>
              </div>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCheckoutBooking(null)}>
                Cancel
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={() => handleCheckOut(checkoutBooking.id)}
                disabled={mutationApi.isLoading}
              >
                {mutationApi.isLoading ? "Processing..." : "Complete Checkout"}
              </Button>
            </div>
          </div>
        )}
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
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
