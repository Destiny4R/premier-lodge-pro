import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, Loader2, Filter, Users, Bed, Grid3X3, List } from "lucide-react";
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
    specialRequests: "",
  });
  
  // Booking confirmation state
  const [bookingConfirmation, setBookingConfirmation] = useState<PublicBookingResponse | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

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

  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;
    
    if (!bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.checkInDate || !bookingForm.checkOutDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const response = await bookingApi.execute(() => 
      createPublicBooking({
        roomId: selectedRoom.id || '',
        guestName: bookingForm.guestName,
        guestEmail: bookingForm.guestEmail,
        guestPhone: bookingForm.guestPhone,
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
        numberOfGuests: bookingForm.numberOfGuests,
        specialRequests: bookingForm.specialRequests || undefined,
      })
    );
    
    if (response.success && response.data) {
      setBookingConfirmation(response.data);
      setBookingModalOpen(false);
      setBookingForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: 1,
        specialRequests: "",
      });
    }
  };

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
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Room</DialogTitle>
            <DialogDescription>
              {selectedRoom && `${selectedRoom.categoryName} - Room ${selectedRoom.doorNumber}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Full Name *</Label>
              <Input
                id="guestName"
                value={bookingForm.guestName}
                onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                type="email"
                value={bookingForm.guestEmail}
                onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone</Label>
              <Input
                id="guestPhone"
                value={bookingForm.guestPhone}
                onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={bookingForm.checkInDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate">Check-out Date *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={bookingForm.checkOutDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min={1}
                max={10}
                value={bookingForm.numberOfGuests}
                onChange={(e) => setBookingForm({ ...bookingForm, numberOfGuests: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Input
                id="specialRequests"
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                placeholder="Any special requests..."
              />
            </div>
            {selectedRoom && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="font-semibold">{formatCurrency(selectedRoom.price)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleBookingSubmit}
                disabled={bookingApi.isLoading}
              >
                {bookingApi.isLoading ? "Booking..." : "Confirm Booking"}
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
