import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, Loader2, Filter, Users, Bed, Grid3X3, List, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { getPublicRooms, createPublicBooking, PublicRoom, PublicBookingResponse } from "@/services/publicService";
import { formatCurrency } from "@/lib/currency";
import { Textarea } from "@/components/ui/textarea";
import { useBookingFlow } from "@/hooks/useBookingFlow";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PublicRoomsPage() {
  const roomsApi = useApi<{ items: PublicRoom[]; totalItems: number }>();
  const bookingApi = useApi<PublicBookingResponse>({ showSuccessToast: true });
  
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minPrice: "",
    maxPrice: "",
    guests: "any",
  });

  // Room details modal state
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [detailRoom, setDetailRoom] = useState<PublicRoom | null>(null);
  
  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PublicRoom | null>(null);
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    paidAmount: "",
    specialRequests: "",
  });
  
  // Booking confirmation state
  const [bookingConfirmation, setBookingConfirmation] = useState<PublicBookingResponse | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  // This recalculates automatically whenever checkInDate or checkOutDate changes
const bookingSummary = useMemo(() => {
  // If either date or the room is missing, we show 0
  if (!selectedRoom || !bookingForm.checkInDate || !bookingForm.checkOutDate) {
    return { nights: 0, total: 0 };
  }

  const start = new Date(bookingForm.checkInDate);
  const end = new Date(bookingForm.checkOutDate);

  // Difference in milliseconds
  const diffTime = end.getTime() - start.getTime();
  
  // Convert to days (rounding up)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If the user picks a checkout date BEFORE checkin, we return 0
  const nights = diffDays > 0 ? diffDays : 0;
  const total = nights * Number(selectedRoom.price);

  return { nights, total };
}, [selectedRoom, bookingForm.checkInDate, bookingForm.checkOutDate]);

  const fetchRooms = async () => {
    const params: Record<string, unknown> = { pageSize: 50 };
    if (filters.search) params.search = filters.search;
    if (filters.category && filters.category !== "all") params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.guests && filters.guests !== "any") params.guests = filters.guests;
    
    const response = await roomsApi.execute(() => getPublicRooms(params as any));
    if (response.success && response.data) {
      setRooms(response.data.items);
    }
  };


  // === PHONE FORMATTER ===
const formatPhoneNumberDisplay = (phone: string | undefined): string => {
  // 1. Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // 2. Handle the leading '0' or '234'
  if (digits.startsWith("0")) {
    digits = "234" + digits.substring(1);
  } else if (digits.length > 0 && !digits.startsWith("234")) {
    // If user starts typing 803... directly, prepend 234
    digits = "234" + digits;
  }

  // 3. Limit to standard Nigerian length (234 + 10 digits)
  digits = digits.substring(0, 13);

  // 4. Apply visual grouping: +234 XXX XXX XXXX
  let formatted = "";
  if (digits.length > 0) {
    formatted += "+" + digits.substring(0, 3); // +234
    if (digits.length > 3) {
      formatted += " " + digits.substring(3, 6); // Area/Provider
    }
    if (digits.length > 6) {
      formatted += " " + digits.substring(6, 9); // First 3
    }
    if (digits.length > 9) {
      formatted += " " + digits.substring(9, 13); // Last 4
    }
  }

  return formatted;
};



  const handleSearch = () => {
    fetchRooms();
  };

  const openRoomDetails = (room: PublicRoom) => {
    setDetailRoom(room);
    setRoomDetailsOpen(true);
  };

  const openBookingModal = (room: PublicRoom) => {
    setSelectedRoom(room);
    setRoomDetailsOpen(false);
    setBookingModalOpen(true);
  };

  // 1. Initialize the Booking Flow Hook
const { startBookingProcess, isSubmitting: isBookingLoading } = useBookingFlow({
  bookingForm,
  selectedRoom,
  totalBill: bookingSummary.total,
  onSuccess: (data: any, isStartingPayment: boolean) => {
    if (isStartingPayment) {
      // Step A: Close the entry modal so Credo can gain focus
      setBookingModalOpen(false);
    } else {
      // Step B: Payment verified or Cash booking - Show the final receipt
      setBookingConfirmation(data);
      setBookingModalOpen(false);
      
      // Reset form for next time
      setBookingForm({
        guestName: "", guestEmail: "", guestPhone: "",
        checkInDate: "", checkOutDate: "", numberOfGuests: 1,
        paidAmount: "", specialRequests: "",
      });
    }
  }
});

  const availableRooms = rooms.filter((room) => room.status === "Available");
  const categories = [...new Set(rooms.map(r => r.categoryName))];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-gradient-gold">Rooms</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover our collection of luxurious rooms and suites, each designed for your comfort and relaxation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat || `category-${cat}`}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.guests} onValueChange={(v) => setFilters({ ...filters, guests: v })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Guests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4+ Guests</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {roomsApi.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Grid View */}
          {!roomsApi.isLoading && viewMode === "grid" && (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {availableRooms.map((room) => (
                <motion.div key={room.id} variants={fadeInUp}>
                  <Card variant={room.isPromoted ? "gold" : "elevated"} className="overflow-hidden group hover-lift">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
                        alt={room.categoryName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {room.isPromoted && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="default" className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="available">Available</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">{room.hotelName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {room.hotelCity}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        {room.categoryName}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        Room {room.doorNumber} • Floor {room.floor}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities?.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          <span className="text-2xl font-bold text-foreground">{formatCurrency(room.price)}</span>/night
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openRoomDetails(room)}>
                            Details
                          </Button>
                          <Button variant="hero" size="sm" onClick={() => openBookingModal(room)}>
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* List View */}
          {!roomsApi.isLoading && viewMode === "list" && (
            <div className="space-y-4">
              {availableRooms.map((room) => (
                <Card key={room.id} variant="elevated" className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden">
                      <img
                        src={room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
                        alt={room.categoryName}
                        className="w-full h-full object-cover"
                      />
                      {room.isPromoted && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="default" className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">{room.hotelName}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {room.hotelCity}
                            </span>
                          </div>
                          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                            {room.categoryName}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            Room {room.doorNumber} • Floor {room.floor}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {room.amenities?.map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-foreground">{formatCurrency(room.price)}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => openRoomDetails(room)}>
                              Details
                            </Button>
                            <Button variant="hero" size="sm" onClick={() => openBookingModal(room)}>
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!roomsApi.isLoading && availableRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No rooms found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find available rooms.</p>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />

      {/* Room Details Modal */}
      <Dialog open={roomDetailsOpen} onOpenChange={setRoomDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{detailRoom?.categoryName}</DialogTitle>
            <DialogDescription>{detailRoom?.hotelName} • {detailRoom?.hotelCity}</DialogDescription>
          </DialogHeader>
          {detailRoom && (
            <div className="space-y-6">
              <img
                src={detailRoom.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                alt={detailRoom.categoryName}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  <span>Room {detailRoom.doorNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Floor {detailRoom.floor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Up to 4 guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{detailRoom.categoryName}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {detailRoom.amenities?.map((amenity) => (
                    <Badge key={amenity} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-3xl font-bold text-foreground">{formatCurrency(detailRoom.price)}</span>
                  <span className="text-muted-foreground">/night</span>
                </div>
                <Button variant="hero" size="lg" onClick={() => openBookingModal(detailRoom)}>
                  Book This Room
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="font-heading text-2xl">Book Your Stay</DialogTitle>
      <DialogDescription>
        {selectedRoom && (
          <span className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-semibold">
              {selectedRoom.categoryName}
            </Badge>
            <span className="text-muted-foreground">Room {selectedRoom.doorNumber}</span>
          </span>
        )}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-6 py-4">
      {/* SECTION 1: GUEST INFORMATION */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">Guest Information</h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="guestName">Full Name *</Label>
            <Input
              id="guestName"
              value={bookingForm.guestName}
              onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
              placeholder="e.g. John Doe"
              className="bg-secondary/20"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guestEmail">Email Address *</Label>
              <Input
                id="guestEmail"
                type="email"
                value={bookingForm.guestEmail}
                onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                placeholder="john@example.com"
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guestPhone">Phone Number</Label>
              <Input
                id="guestPhone"
                value={bookingForm.guestPhone}
                onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                placeholder="+234 ..."
                className="bg-secondary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BOOKING DETAILS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">Stay Details</h4>
        <div className="space-y-3">
          {/* Date Picker Row with the Icon Fix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 date-input-wrapper">
              <Label htmlFor="checkInDate">Check-in Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                <Input
                  id="checkInDate"
                  type="date"
                  value={bookingForm.checkInDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                  className="pl-10 cursor-pointer bg-secondary/20"
                />
              </div>
            </div>
            <div className="space-y-1.5 date-input-wrapper">
              <Label htmlFor="checkOutDate">Check-out Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                <Input
                  id="checkOutDate"
                  type="date"
                  value={bookingForm.checkOutDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                  className="pl-10 cursor-pointer bg-secondary/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="numberOfGuests"
                  type="number"
                  min={1}
                  max={10}
                  value={bookingForm.numberOfGuests}
                  onChange={(e) => setBookingForm({ ...bookingForm, numberOfGuests: parseInt(e.target.value) || 1 })}
                  className="pl-10 bg-secondary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CONSOLIDATED PAYMENT SUMMARY */}
{selectedRoom && (
  <div className="rounded-xl border border-primary/20 overflow-hidden shadow-sm bg-background">
    {/* Top Summary Bar */}
    <div className="bg-primary/5 p-4 border-b border-primary/10">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Stay Duration
          </p>
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(selectedRoom.price)} × {bookingSummary.nights} {bookingSummary.nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            Total Amount Due
          </p>
          <p className="text-3xl font-mono font-bold text-primary leading-none">
            {formatCurrency(bookingSummary.total)}
          </p>
        </div>
      </div>
    </div>

    {/* Payment Inputs Row */}
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
      <div className="space-y-1.5">
        <Label htmlFor="paidAmount" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Amount Paying Now
        </Label>
        <div className="relative">
          <Input
            id="paidAmount"
            type="number"
            value={bookingForm.paidAmount}
            onChange={(e) => setBookingForm({ ...bookingForm, paidAmount: e.target.value })}
            placeholder="0.00"
            className="h-10 pl-3 font-mono bg-secondary/10 border-primary/10 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Remaining Balance
        </label>
        {(() => {
          const balance = bookingSummary.total - (Number(bookingForm.paidAmount) || 0);
          return (
            <div
              className={`h-10 flex items-center px-3 rounded-md border font-mono font-bold transition-colors ${
                balance > 0
                  ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  : "bg-green-500/10 text-green-600 border-green-500/20"
              }`}
            >
              {formatCurrency(balance)}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Validation Warning */}
    {bookingSummary.nights === 0 && bookingForm.checkInDate && (
      <div className="px-4 pb-4">
        <Badge variant="destructive" className="w-full justify-center py-1 animate-pulse">
          Check-out date must be after check-in date
        </Badge>
      </div>
    )}
  </div>
)}

      {/* SECTION 4: EXTRA REQUESTS */}
      <div className="space-y-1.5">
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <Textarea
          id="specialRequests"
          value={bookingForm.specialRequests}
          onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
          placeholder="e.g. Late check-in, dietary requirements, airport pickup..."
          className="bg-secondary/20 resize-none"
          rows={3}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        <Button 
          variant="outline" 
          className="flex-1 h-12" 
          onClick={() => setBookingModalOpen(false)}
        >
          Discard
        </Button>
        <Button 
  variant="hero" 
  className="flex-1 h-12 shadow-lg shadow-primary/20" 
  onClick={startBookingProcess} // Connected to Hook
  disabled={isBookingLoading || bookingSummary.nights <= 0}
>
  {isBookingLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      {bookingForm.paidAmount ? "Opening Payment..." : "Processing..."}
    </>
  ) : (
    "Confirm Booking"
  )}
</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      {/* Booking Confirmation Modal */}
      <Dialog open={!!bookingConfirmation} onOpenChange={() => setBookingConfirmation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-success">✓</span> Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your reservation has been successfully created.
            </DialogDescription>
          </DialogHeader>
          {bookingConfirmation && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="text-2xl font-bold text-primary">{bookingConfirmation.bookingReference}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span>{bookingConfirmation.categoryName} - {bookingConfirmation.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hotel</span>
                  <span>{bookingConfirmation.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span>{bookingConfirmation.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span>{bookingConfirmation.checkOutDate}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span>{formatCurrency(bookingConfirmation.totalAmount)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                A confirmation email has been sent to {bookingConfirmation.guestEmail}
              </p>
              <Button variant="hero" className="w-full" onClick={() => setBookingConfirmation(null)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
