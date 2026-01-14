import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState, EmptyState } from "@/components/ui/loading-state";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Utensils,
  Shirt,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  LogOut,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  getGuestById,
  getGuestBookings,
  getGuestRestaurantOrders,
  getGuestLaundryOrders,
} from "@/services/guestService";
import {
  createBooking,
  createReservation,
  checkIn,
  checkOut,
  cancelBooking,
  extendBooking,
} from "@/services/bookingService";
import { getRooms } from "@/services/roomService";
import { Guest, Booking, RestaurantOrder, LaundryOrder, Room, PaginatedResponse } from "@/types/api";

/**
 * Guest Details Page
 * 
 * This page shows detailed guest information with tabs for:
 * - Bookings (with actions: Book room, Extend stay, Check in, Check out, Cancel)
 * - Restaurant orders
 * - Laundry orders
 * 
 * API Endpoints used:
 * 
 * GET /api/v3/guests/getGuestinfo/:id
 * Response: { success: boolean, data: Guest, message: string, status: number }
 * 
 * GET /api/v3/guests/:id/bookings
 * Response: { success: boolean, data: { items: Booking[], totalItems: number }, message: string, status: number }
 * 
 * GET /api/v3/guests/:id/restaurant-orders
 * Response: { success: boolean, data: { items: RestaurantOrder[], totalItems: number }, message: string, status: number }
 * 
 * GET /api/v3/guests/:id/laundry-orders
 * Response: { success: boolean, data: { items: LaundryOrder[], totalItems: number }, message: string, status: number }
 */

const statusColors: Record<string, "success" | "info" | "warning" | "secondary"> = {
  "checked-in": "success",
  confirmed: "info",
  "checked-out": "secondary",
  cancelled: "warning",
  pending: "warning",
  preparing: "info",
  ready: "success",
  delivered: "secondary",
  received: "warning",
  processing: "info",
};

export default function GuestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data state
  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bookings");

  // Pagination state for each tab
  const [bookingsPagination, setBookingsPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });
  const [restaurantPagination, setRestaurantPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });
  const [laundryPagination, setLaundryPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });

  // Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<"check-in" | "reservation">("check-in");
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    roomId: "",
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    paidAmount: "",
  });

  const [extendForm, setExtendForm] = useState({
    newCheckOut: null as Date | null,
    additionalPayment: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [guestRes, bookingsRes, restaurantRes, laundryRes, roomsRes] = await Promise.all([
        getGuestById(id),
        getGuestBookings(id),
        getGuestRestaurantOrders(id),
        getGuestLaundryOrders(id),
        getRooms({ status: 'available' }),
      ]);

      if (guestRes.success) {
        setGuest(guestRes.data);
      } else {
        setError(guestRes.message);
      }

      if (bookingsRes.success) {
        setBookings(bookingsRes.data.items);
        setBookingsPagination(prev => ({
          ...prev,
          totalItems: bookingsRes.data.totalItems,
          totalPages: bookingsRes.data.totalPages || Math.ceil(bookingsRes.data.totalItems / prev.pageSize),
        }));
      }

      if (restaurantRes.success) {
        setRestaurantOrders(restaurantRes.data.items);
        setRestaurantPagination(prev => ({
          ...prev,
          totalItems: restaurantRes.data.totalItems,
          totalPages: restaurantRes.data.totalPages || Math.ceil(restaurantRes.data.totalItems / prev.pageSize),
        }));
      }

      if (laundryRes.success) {
        setLaundryOrders(laundryRes.data.items);
        setLaundryPagination(prev => ({
          ...prev,
          totalItems: laundryRes.data.totalItems,
          totalPages: laundryRes.data.totalPages || Math.ceil(laundryRes.data.totalItems / prev.pageSize),
        }));
      }

      if (roomsRes.success) {
        setRooms(roomsRes.data.items);
      }
    } catch (err) {
      setError("Failed to load guest details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetBookingForm = () => {
    setBookingForm({ roomId: "", checkIn: null, checkOut: null, paidAmount: "" });
  };

  const handleBookingSubmit = async () => {
    if (!id || !bookingForm.checkIn || !bookingForm.checkOut || !bookingForm.roomId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        guestId: id,
        roomId: bookingForm.roomId,
        checkIn: bookingForm.checkIn.toISOString().split('T')[0],
        checkOut: bookingForm.checkOut.toISOString().split('T')[0],
        paidAmount: parseFloat(bookingForm.paidAmount) || 0,
      };

      const response = bookingType === "check-in"
        ? await createBooking(payload)
        : await createReservation(payload);

      if (response.success) {
        toast.success(bookingType === "check-in" ? "Guest checked in successfully" : "Reservation created successfully");
        setBookingModalOpen(false);
        resetBookingForm();
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendSubmit = async () => {
    if (!selectedBooking || !extendForm.newCheckOut) {
      toast.error("Please select a new check-out date");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await extendBooking(selectedBooking.id, {
        newCheckOut: extendForm.newCheckOut.toISOString().split('T')[0],
        additionalPayment: parseFloat(extendForm.additionalPayment) || 0,
      });

      if (response.success) {
        toast.success("Booking extended successfully");
        setExtendModalOpen(false);
        setSelectedBooking(null);
        setExtendForm({ newCheckOut: null, additionalPayment: "" });
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await checkIn(bookingId);
      if (response.success) {
        toast.success("Guest checked in successfully");
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    try {
      const response = await checkOut(bookingId);
      if (response.success) {
        toast.success("Guest checked out successfully");
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);

    try {
      const response = await cancelBooking(cancelDialog.id);
      if (response.success) {
        toast.success("Booking cancelled successfully");
        setCancelDialog({ open: false, id: "" });
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBookingModal = (type: "check-in" | "reservation") => {
    setBookingType(type);
    setBookingModalOpen(true);
  };

  const openExtendModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setExtendForm({
      newCheckOut: new Date(booking.checkOut),
      additionalPayment: "",
    });
    setExtendModalOpen(true);
  };

  const availableRooms = rooms.filter(r => r.status === "Available");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Guest Details" subtitle="Loading guest information..." />
        <div className="p-6">
          <Card>
            <CardContent className="py-12">
              <LoadingState message="Loading guest details..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Guest Details" subtitle="Error loading guest" />
        <div className="p-6">
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="Guest not found"
                description={error || "The guest you're looking for doesn't exist"}
                action={
                  <Button variant="outline" onClick={() => navigate("/dashboard/guests")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Guests
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const guestName = guest.name || `${guest.firstname || ''} ${guest.lastname || ''}`.trim() || 'Guest';
  const guestEmail = guest.email || guest.Email || '';
  const guestPhone = guest.phone || '';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Guest Details" 
        subtitle={`Viewing information for ${guestName}`} 
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/dashboard/guests")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guests
        </Button>

        {/* Guest Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {guestName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">{guestName}</h2>
                    <Link to={`/dashboard/guests?edit=${guest.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Guest
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{guestPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{guest.address || guest.city || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{guest.totalStays || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Stays</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">${(guest.totalSpent || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">ID: {guest.idType || guest.identificationtype || 'N/A'}</p>
                      <p className="text-sm font-medium text-foreground">{guest.idNumber || guest.identificationnumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Book Room
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => openBookingModal("check-in")}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In (Direct)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openBookingModal("reservation")}>
                <Calendar className="w-4 h-4 mr-2" />
                Make Reservation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bookings ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Restaurant ({restaurantOrders.length})
              </TabsTrigger>
              <TabsTrigger value="laundry" className="flex items-center gap-2">
                <Shirt className="w-4 h-4" />
                Laundry ({laundryOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No bookings yet"
                      description="This guest has no booking history"
                      action={
                        <Button onClick={() => openBookingModal("check-in")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Booking
                        </Button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-in</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-out</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-4">
                                <span className="font-mono text-sm text-foreground">{booking.bookingReference || '-'}</span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-medium text-foreground">Room {booking.roomNumber || '-'}</p>
                                <p className="text-sm text-muted-foreground">{booking.roomCategory || '-'}</p>
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
                                <Badge variant={booking.bookingType === 'reservation' ? 'info' : 'success'}>
                                  {booking.bookingType || 'check-in'}
                                </Badge>
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
                                    {/* Check In - only for reservations */}
                                    {booking.bookingType === 'reservation' && booking.status === 'confirmed' && (
                                      <DropdownMenuItem onClick={() => handleCheckIn(booking.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Check In
                                      </DropdownMenuItem>
                                    )}
                                    {/* Extend Stay - only for checked-in bookings */}
                                    {booking.status === 'checked-in' && (
                                      <DropdownMenuItem onClick={() => openExtendModal(booking)}>
                                        <Clock className="w-4 h-4 mr-2" /> Extend Stay
                                      </DropdownMenuItem>
                                    )}
                                    {/* Check Out - only for checked-in bookings */}
                                    {booking.status === 'checked-in' && (
                                      <DropdownMenuItem onClick={() => handleCheckOut(booking.id)}>
                                        <LogOut className="w-4 h-4 mr-2" /> Check Out
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                      <Link to={`/dashboard/checkout/${booking.id}`}>
                                        <FileText className="w-4 h-4 mr-2" /> Checkout Report
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {/* Cancel - only for active bookings */}
                                    {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setCancelDialog({ open: true, id: booking.id })}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Bookings Pagination */}
                  {bookings.length > 0 && bookingsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {bookings.length} of {bookingsPagination.totalItems} bookings
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBookingsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={bookingsPagination.page === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {bookingsPagination.page} of {bookingsPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBookingsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={bookingsPagination.page === bookingsPagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Restaurant Tab */}
            <TabsContent value="restaurant">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Restaurant Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {restaurantOrders.length === 0 ? (
                    <EmptyState
                      icon={Utensils}
                      title="No restaurant orders"
                      description="This guest has no restaurant order history"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {restaurantOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                              <td className="py-4 px-4">
                                {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                              </td>
                              <td className="py-4 px-4 font-semibold">${order.totalAmount}</td>
                              <td className="py-4 px-4 capitalize">{order.paymentMethod}</td>
                              <td className="py-4 px-4">
                                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Restaurant Pagination */}
                  {restaurantOrders.length > 0 && restaurantPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {restaurantOrders.length} of {restaurantPagination.totalItems} orders
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestaurantPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={restaurantPagination.page === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {restaurantPagination.page} of {restaurantPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestaurantPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={restaurantPagination.page === restaurantPagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Laundry Tab */}
            <TabsContent value="laundry">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Laundry Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {laundryOrders.length === 0 ? (
                    <EmptyState
                      icon={Shirt}
                      title="No laundry orders"
                      description="This guest has no laundry order history"
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {laundryOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                              <td className="py-4 px-4">
                                {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                              </td>
                              <td className="py-4 px-4 font-semibold">${order.totalAmount}</td>
                              <td className="py-4 px-4 capitalize">{order.paymentMethod}</td>
                              <td className="py-4 px-4">
                                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                              </td>
                              <td className="py-4 px-4 text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Laundry Pagination */}
                  {laundryOrders.length > 0 && laundryPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {laundryOrders.length} of {laundryPagination.totalItems} orders
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLaundryPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={laundryPagination.page === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {laundryPagination.page} of {laundryPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLaundryPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={laundryPagination.page === laundryPagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <FormModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        title={bookingType === "check-in" ? "Check In Guest" : "Create Reservation"}
        description={bookingType === "check-in" ? "Book a room with immediate check-in" : "Reserve a room for future check-in"}
        onSubmit={handleBookingSubmit}
        submitLabel={bookingType === "check-in" ? "Check In" : "Create Reservation"}
        size="lg"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <FormField label="Room" required>
            <Select value={bookingForm.roomId} onValueChange={(v) => setBookingForm({ ...bookingForm, roomId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select available room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id || ''}>
                    Room {r.doorNumber} - {r.categoryName || 'Unknown'} - ${r.price}/night
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
          {bookingType === "check-in" && (
            <FormField label="Payment Amount" hint="Initial payment">
              <Input
                type="number"
                value={bookingForm.paidAmount}
                onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })}
                placeholder="0"
              />
            </FormField>
          )}
        </div>
      </FormModal>

      {/* Extend Stay Modal */}
      <FormModal
        open={extendModalOpen}
        onOpenChange={setExtendModalOpen}
        title="Extend Stay"
        description={`Extend booking for ${guestName}`}
        onSubmit={handleExtendSubmit}
        submitLabel="Extend Stay"
        size="md"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {selectedBooking && (
            <Card variant="glass" className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Current Check-out</p>
              <p className="font-semibold">{selectedBooking.checkOut}</p>
            </Card>
          )}
          <FormField label="New Check-out Date" required>
            <DatePicker
              value={extendForm.newCheckOut}
              onChange={(date) => setExtendForm(prev => ({ ...prev, newCheckOut: date }))}
              placeholder="Select new check-out date"
              minDate={selectedBooking ? new Date(selectedBooking.checkOut) : undefined}
            />
          </FormField>
          <FormField label="Additional Payment" hint="Amount for extended stay">
            <Input
              type="number"
              value={extendForm.additionalPayment}
              onChange={(e) => setExtendForm({ ...extendForm, additionalPayment: e.target.value })}
              placeholder="0"
            />
          </FormField>
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
              <div>
                <h3 className="font-semibold text-foreground">{viewBooking.bookingReference}</h3>
                <p className="text-sm text-muted-foreground">Booking Reference</p>
              </div>
              <Badge variant={statusColors[viewBooking.status]} className="ml-auto">{viewBooking.status}</Badge>
            </div>
            <DetailRow label="Room" value={`Room ${viewBooking.roomNumber || '-'} - ${viewBooking.roomCategory || 'Unknown'}`} />
            <DetailRow label="Check-in" value={viewBooking.checkIn} />
            <DetailRow label="Check-out" value={viewBooking.checkOut} />
            <DetailRow label="Booking Type" value={viewBooking.bookingType || 'check-in'} />
            <DetailRow label="Total Amount" value={`$${viewBooking.totalAmount}`} />
            <DetailRow label="Paid Amount" value={`$${viewBooking.paidAmount}`} />
            <DetailRow label="Balance Due" value={`$${viewBooking.totalAmount - viewBooking.paidAmount}`} />
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
        isLoading={isSubmitting}
      />
    </div>
  );
}
