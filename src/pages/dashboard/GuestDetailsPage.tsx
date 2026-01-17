// src/pages/dashboard/guestDetails.tsx

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
  Search,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  getGuestById,
  getGuestBookings,
  getGuestRestaurantOrders,
  getGuestLaundryOrders,
  updateGuest, // ← ADDED
} from "@/services/guestService";
import {
  createBooking,
  createReservation,
  checkIn,
  checkOut,
  cancelBooking,
  extendBooking,
} from "@/services/bookingService";
import { getRooms, getRoomCategoriesWithAvailableRooms } from "@/services/roomService";
import { Guest, Booking, RestaurantOrder, RoomCategoryWithRooms, LaundryOrder, Room, PaginatedResponse } from "@/types/api";

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

const ID_TYPE_OPTIONS = [
  { label: "National ID", value: "NIN" },
  { label: "International Passport", value: "ITP" },
  { label: "Driver's License", value: "DRL" },
  { label: "Permanent Voter's Card", value: "PVC" },
];

const getIdTypeLabel = (code: string | undefined): string => {
  if (!code) return '—';
  const option = ID_TYPE_OPTIONS.find(opt => opt.value === code);
  return option ? option.label : code;
};


export default function GuestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [guest, setGuest] = useState<Guest | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>([]);
  const [laundryOrders, setLaundryOrders] = useState<LaundryOrder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bookings");

  // Pagination state
  const [bookingsPagination, setBookingsPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });
  const [restaurantPagination, setRestaurantPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });
  const [laundryPagination, setLaundryPagination] = useState({ page: 1, pageSize: 5, totalItems: 0, totalPages: 1 });

  // Search state
  const [bookingsSearch, setBookingsSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [laundrySearch, setLaundrySearch] = useState("");

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

  const [roomCategories, setRoomCategories] = useState<RoomCategoryWithRooms[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredRooms, setFilteredRooms] = useState<{ id: string; roomnumber: string; floor: number }[]>([]);

  const fetchData = useCallback(async () => {
  if (!id) return;
  setIsLoading(true);
  setError(null);
  try {
    const [guestRes, bookingsRes, restaurantRes, laundryRes, roomsRes, categoriesRes] = await Promise.all([
      getGuestById(id),
      getGuestBookings(id),
      getGuestRestaurantOrders(id),
      getGuestLaundryOrders(id),
      getRooms({ status: 'available' }),
      getRoomCategoriesWithAvailableRooms(),
    ]);

    // Handle guest data
    if (guestRes.success) {
      const rawGuest = guestRes.data;
      const normalizedGuest: Guest = {
        ...rawGuest,
        name: rawGuest.name || `${rawGuest.firstname || ''} ${rawGuest.lastname || ''}`.trim() || 'Guest',
        firstname: rawGuest.firstname || (rawGuest.name?.split(' ')[0] || ''),
        lastname: rawGuest.lastname || (rawGuest.name?.split(' ').slice(1).join(' ') || ''),
        email: rawGuest.emailAddress || rawGuest.email || rawGuest.Email || '',
        phone: rawGuest.phoneNo || rawGuest.phone || rawGuest.Phone || '',
        address: rawGuest.address || '',
        city: rawGuest.city || '',
        country: rawGuest.country || '',
        idType: rawGuest.idType || rawGuest.identificationType || '',
        idNumber: rawGuest.idNumber || rawGuest.identificationNumber || '',
        totalStays: rawGuest.totalStays ?? 0,
        totalSpent: rawGuest.totalSpent ?? 0,
        accommodation: rawGuest.accommodation || '',
      };
      setGuest(normalizedGuest);
    } else {
      setError(guestRes.message);
    }

    // Handle categories (independent of guest success)
    if (categoriesRes.success) {
      setRoomCategories(categoriesRes.data);
    }

    // Handle other data...
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
        // ✅ Sync guest accommodation status based on booking type
        await updateGuest(id, { accommodation: bookingType === "check-in" ? "checked_in" : "reservation" });

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
        // ✅ Update guest status to "checked_in"
        if (id) await updateGuest(id, { accommodation: "checked_in" });
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
        // Optional: clear accommodation or leave as historical
        // if (id) await updateGuest(id, { accommodation: "" });
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
  setSelectedCategory(null);
  setFilteredRooms([]);
  setBookingForm({ roomId: "", checkIn: null, checkOut: null, paidAmount: "" });
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

  // Filtered data based on search
  const filteredBookings = bookings.filter(booking => {
    if (!bookingsSearch) return true;
    const search = bookingsSearch.toLowerCase();
    return (
      booking.bookingReference?.toLowerCase().includes(search) ||
      booking.roomNumber?.toLowerCase().includes(search) ||
      booking.roomCategory?.toLowerCase().includes(search) ||
      booking.status?.toLowerCase().includes(search) ||
      booking.checkIn?.toLowerCase().includes(search) ||
      booking.checkOut?.toLowerCase().includes(search)
    );
  });

  const filteredRestaurantOrders = restaurantOrders.filter(order => {
    if (!restaurantSearch) return true;
    const search = restaurantSearch.toLowerCase();
    return (
      order.id?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search) ||
      order.paymentMethod?.toLowerCase().includes(search) ||
      order.items?.some(item => item.name?.toLowerCase().includes(search))
    );
  });

  const filteredLaundryOrders = laundryOrders.filter(order => {
    if (!laundrySearch) return true;
    const search = laundrySearch.toLowerCase();
    return (
      order.id?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search) ||
      order.paymentMethod?.toLowerCase().includes(search) ||
      order.items?.some(item => item.name?.toLowerCase().includes(search))
    );
  });

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
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-primary">
            {(guest.firstname || guest.lastname || guest.name || 'G').charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">
                  {guest.name || `${guest.firstname || ''} ${guest.lastname || ''}`.trim() || 'Guest'}
                </h2>
                {guest.accommodation && (
                  <Badge variant={guest.accommodation === 'checked_in' ? 'success' : 'info'}>
                    {guest.accommodation === 'checked_in' ? 'Checked In' : 'Reservation'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Guest ID: {guest.id}
              </p>
            </div>
            <Link to={`/dashboard/guests?edit=${guest.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Guest
              </Button>
            </Link>
          </div>

          {/* Contact & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  <div className="flex items-start gap-2 text-muted-foreground">
    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span className="truncate">{guestEmail || '—'}</span>
  </div>
  <div className="flex items-start gap-2 text-muted-foreground">
    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span className="truncate">{guestPhone || '—'}</span>
  </div>
  <div className="flex items-start gap-2 text-muted-foreground">
    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span className="truncate">
      {[
        guest.address,
        guest.city,
        guest.country
      ].filter(Boolean).join(', ') || '—'}
    </span>
  </div>
</div>

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
            <div className="text-center min-w-[100px]">
              <p className="text-2xl font-bold text-foreground">{guest.totalStays || 0}</p>
              <p className="text-sm text-muted-foreground">Total Stays</p>
            </div>
            <div className="h-8 w-px bg-border/50 hidden sm:block" />
            <div className="text-center min-w-[120px]">
              <p className="text-2xl font-bold text-primary">{formatCurrency(guest.totalSpent || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="h-8 w-px bg-border/50 hidden sm:block" />
            <div className="text-center min-w-[140px]">
              <p className="text-sm text-muted-foreground">ID Type</p>
              <p className="text-sm font-medium text-foreground">
                {getIdTypeLabel(guest.idType || guest.identificationType)}
              </p>
              <p className="text-sm font-mono text-foreground mt-1">
                {guest.idNumber || guest.identificationNumber || '—'}
              </p>
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Booking History</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bookings..."
                      value={bookingsSearch}
                      onChange={(e) => setBookingsSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredBookings.length === 0 ? (
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
                          {filteredBookings.map((booking) => (
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
                                <p className="font-semibold text-foreground">{formatCurrency(booking.totalAmount)}</p>
                                <p className="text-xs text-muted-foreground">Paid: {formatCurrency(booking.paidAmount)}</p>
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
                                    {booking.bookingType === 'reservation' && booking.status === 'confirmed' && (
                                      <DropdownMenuItem onClick={() => handleCheckIn(booking.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Check In
                                      </DropdownMenuItem>
                                    )}
                                    {booking.status === 'checked-in' && (
                                      <>
                                        <DropdownMenuItem onClick={() => openExtendModal(booking)}>
                                          <Clock className="w-4 h-4 mr-2" /> Extend Stay
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCheckOut(booking.id)}>
                                          <LogOut className="w-4 h-4 mr-2" /> Check Out
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuItem asChild>
                                      <Link to={`/dashboard/checkout/${booking.id}`}>
                                        <FileText className="w-4 h-4 mr-2" /> Checkout Report
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
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

                  {filteredBookings.length > 0 && bookingsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredBookings.length} of {bookingsPagination.totalItems} bookings
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Restaurant Orders</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={restaurantSearch}
                      onChange={(e) => setRestaurantSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredRestaurantOrders.length === 0 ? (
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
                          {filteredRestaurantOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                              <td className="py-4 px-4">
                                {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                              </td>
                              <td className="py-4 px-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
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

                  {filteredRestaurantOrders.length > 0 && restaurantPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredRestaurantOrders.length} of {restaurantPagination.totalItems} orders
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Laundry Orders</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={laundrySearch}
                      onChange={(e) => setLaundrySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredLaundryOrders.length === 0 ? (
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
                          {filteredLaundryOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                              <td className="py-4 px-4">
                                {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                              </td>
                              <td className="py-4 px-4 font-semibold">{formatCurrency(order.totalAmount)}</td>
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

                  {filteredLaundryOrders.length > 0 && laundryPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredLaundryOrders.length} of {laundryPagination.totalItems} orders
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
    {/* Category Selection */}
    <FormField label="Room Category" required>
      <Select
        value={selectedCategory || ""}
        onValueChange={(value) => {
          setSelectedCategory(value);
          const category = roomCategories.find(c => c.id.toString() === value);
          setFilteredRooms(
            category?.rooms.map(r => ({
              id: r.id.toString(), // Convert to string
              roomnumber: r.roomnumber,
              floor: r.floor
            })) || []
          );
          setBookingForm(prev => ({ ...prev, roomId: "" }));
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {roomCategories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name} — ₦{category.price.toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>

    {/* Room Selection */}
    <FormField label="Room Number" required>
      <Select
        value={bookingForm.roomId}
        onValueChange={(value) => setBookingForm(prev => ({ ...prev, roomId: value }))}
        disabled={!selectedCategory}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={
              selectedCategory 
                ? "Select a room" 
                : "Select category first"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {filteredRooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              Room {room.roomnumber} (Floor {room.floor})
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