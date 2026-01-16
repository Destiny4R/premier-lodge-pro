import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Sparkles, Loader2, Phone, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { getPublicRooms, getPublicAmenities, submitContactForm, createPublicBooking, PublicRoom, PublicBookingResponse, Amenity, ContactRequest } from "@/services/publicService";
import { formatCurrency } from "@/lib/currency";
import heroImage from "@/assets/hero-hotel.jpg";

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

const defaultAmenities = [
  { icon: Wifi, label: "Free WiFi", description: "Complimentary high-speed internet access throughout the hotel" },
  { icon: Car, label: "Valet Parking", description: "Secure parking with professional valet service" },
  { icon: Coffee, label: "24/7 Room Service", description: "Gourmet dining delivered to your room anytime" },
  { icon: Dumbbell, label: "Fitness Center", description: "State-of-the-art gym equipment and personal trainers" },
  { icon: Waves, label: "Swimming Pool", description: "Olympic-sized pool with poolside bar service" },
  { icon: Utensils, label: "Fine Dining", description: "Award-winning restaurant with international cuisine" },
];

const iconMap: Record<string, any> = {
  wifi: Wifi,
  car: Car,
  coffee: Coffee,
  dumbbell: Dumbbell,
  waves: Waves,
  utensils: Utensils,
};

export default function LandingPage() {
  // API States
  const roomsApi = useApi<{ items: PublicRoom[]; totalItems: number }>();
  const bookingApi = useApi<PublicBookingResponse>({ showSuccessToast: true });
  
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [searchParams, setSearchParams] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  
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

  /**
   * GET /api/public/rooms
   * Fetch available rooms for public display
   */
  const fetchRooms = async () => {
    const params: Record<string, unknown> = { pageSize: 6 };
    if (searchParams.city) params.city = searchParams.city;
    if (searchParams.checkIn) params.checkIn = searchParams.checkIn;
    if (searchParams.checkOut) params.checkOut = searchParams.checkOut;
    if (searchParams.guests > 1) params.guests = searchParams.guests;
    
    const response = await roomsApi.execute(() => getPublicRooms(params as any));
    if (response.success && response.data) {
      setRooms(response.data.items);
    }
  };

  const handleSearch = () => {
    fetchRooms();
  };

  const openBookingModal = (room: PublicRoom) => {
    setSelectedRoom(room);
    setBookingForm({
      ...bookingForm,
      checkInDate: searchParams.checkIn,
      checkOutDate: searchParams.checkOut,
      numberOfGuests: searchParams.guests,
    });
    setBookingModalOpen(true);
  };

  /**
   * POST /api/public/bookings
   * Create a new booking
   */
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
      // Reset form
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

  // Get available rooms sorted by promotion status
  const availableRooms = rooms
    .filter((room) => room.status === "Available")
    .sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury Hotel Lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Award-Winning Luxury Hotels</span>
            </motion.div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Experience
              <span className="text-gradient-gold"> Luxury</span>
              <br />
              Redefined
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover world-class accommodations, exceptional service, and unforgettable moments at our exclusive collection of hotels and resorts.
            </p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <Card variant="glass" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="City or Hotel"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                      className="pl-10 h-12 bg-secondary border-border"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      value={searchParams.checkIn}
                      onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                      className="pl-10 h-12 bg-secondary border-border"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      value={searchParams.checkOut}
                      onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                      className="pl-10 h-12 bg-secondary border-border"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) || 1 })}
                      className="pl-10 h-12 bg-secondary border-border"
                    />
                  </div>
                  <Button variant="hero" size="lg" className="h-12" onClick={handleSearch}>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-24 bg-card" id="rooms">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-primary font-medium mb-4">
              ACCOMMODATIONS
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Featured Rooms
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each room is thoughtfully designed to provide the ultimate in comfort and luxury.
            </motion.p>
          </motion.div>

          {/* Loading State */}
          {roomsApi.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Rooms Grid */}
          {!roomsApi.isLoading && (
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {availableRooms.slice(0, 6).map((room) => (
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
                        <Button variant="hero" size="sm" onClick={() => openBookingModal(room)}>
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!roomsApi.isLoading && availableRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No rooms available matching your criteria.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/rooms">
              <Button variant="outline" size="lg">View All Rooms</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24" id="amenities">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-primary font-medium mb-4">
              WORLD-CLASS AMENITIES
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {defaultAmenities.map((amenity) => (
              <motion.div key={amenity.label} variants={fadeInUp}>
                <Card variant="glass" className="p-6 text-center hover-lift group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <amenity.icon className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-2">{amenity.label}</p>
                  <p className="text-xs text-muted-foreground">{amenity.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-card" id="testimonials">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-primary font-medium mb-4">
              GUEST REVIEWS
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Our Guests Say
            </motion.h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { name: "Sarah M.", role: "Business Traveler", text: "Exceptional service and beautiful rooms. The attention to detail is remarkable.", rating: 5 },
              { name: "James L.", role: "Family Vacation", text: "Perfect for our family getaway. The kids loved the pool and the staff was incredibly accommodating.", rating: 5 },
              { name: "Emily R.", role: "Honeymoon", text: "Made our honeymoon unforgettable. The romantic dinner setup was a beautiful surprise.", rating: 5 },
            ].map((testimonial) => (
              <motion.div key={testimonial.name} variants={fadeInUp}>
                <Card variant="elevated" className="p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-card" id="contact">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-primary font-medium mb-4">
              GET IN TOUCH
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contact Us
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help make your stay unforgettable.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <Card variant="glass" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+234 800 123 4567</p>
                    <p className="text-muted-foreground">+234 800 987 6543</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">info@premierlodge.ng</p>
                    <p className="text-muted-foreground">reservations@premierlodge.ng</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">123 Victoria Island</p>
                    <p className="text-muted-foreground">Lagos, Nigeria</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" className="p-8">
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-6">Send us a Message</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: ContactRequest = {
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    subject: formData.get('subject') as string,
                    message: formData.get('message') as string,
                  };
                  submitContactForm(data).then(res => {
                    if (res.success) {
                      toast.success('Message sent! We will get back to you soon.');
                      (e.target as HTMLFormElement).reset();
                    } else {
                      toast.error('Failed to send message');
                    }
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name *</Label>
                      <Input id="contact-name" name="name" placeholder="Your name" required className="bg-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input id="contact-email" name="email" type="email" placeholder="your@email.com" required className="bg-secondary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input id="contact-phone" name="phone" placeholder="+234 800 000 0000" className="bg-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">Subject *</Label>
                      <Input id="contact-subject" name="subject" placeholder="How can we help?" required className="bg-secondary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message *</Label>
                    <Textarea id="contact-message" name="message" placeholder="Tell us more..." rows={4} required className="bg-secondary" />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Experience Luxury?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Book your stay today and discover why guests from around the world choose Premier Lodge.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <Button variant="hero" size="lg">
                  Book Now
                </Button>
              </Link>
              <Link to="#rooms">
                <Button variant="outline" size="lg">
                  View Rooms
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />

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
                placeholder="+1 555-0123"
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
