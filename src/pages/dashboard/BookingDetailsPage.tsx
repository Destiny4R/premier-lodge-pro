import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  User,
  Bed,
  Calendar,
  Phone,
  Mail,
  Hash,
  UtensilsCrossed,
  Shirt,
  CheckCircle,
  LogOut,
  XCircle,
  Building2,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { getBookingById, checkIn, checkOut, cancelBooking } from "@/services/bookingService";
import { Booking } from "@/types/api";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { ConfirmDialog } from "@/components/forms";
import { formatCurrency } from "@/lib/currency";

interface LaundryActivity {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
}

interface RestaurantChargeItem {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const bookingApi = useApi<Booking>();
  const mutationApi = useApi<Booking | null>({ showSuccessToast: true });
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [laundryActivities, setLaundryActivities] = useState<LaundryActivity[]>([]);
  const [restaurantChargeItems, setRestaurantChargeItems] = useState<RestaurantChargeItem[]>([]);
  const [hotelDetails, setHotelDetails] = useState({
    hotelAddress: "123 Luxury Avenue, Downtown City",
    hotelLogo: "/placeholder.svg",
    hotelPhone: "+234 800 123 4567",
  });
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    
    const response = await bookingApi.execute(() => getBookingById(bookingId));
    if (response.success && response.data) {
      setBooking(response.data);
      
      // Mock additional data for demo - in production, these would come from separate API calls
      setLaundryActivities([
        {
          id: "l1",
          date: "2024-01-16",
          items: [
            { name: "Shirt Ironing", quantity: 3, price: 500 },
            { name: "Pants Dry Clean", quantity: 2, price: 800 },
          ],
          total: 3100,
          status: "delivered",
        },
      ]);
      
      setRestaurantChargeItems([
        {
          id: "r1",
          date: "2024-01-15",
          items: [
            { name: "Continental Breakfast", quantity: 2, price: 2500 },
            { name: "Room Service Dinner", quantity: 1, price: 8500 },
          ],
          total: 13500,
          status: "delivered",
        },
        {
          id: "r2",
          date: "2024-01-16",
          items: [
            { name: "Lunch Buffet", quantity: 2, price: 4500 },
          ],
          total: 9000,
          status: "delivered",
        },
      ]);
    }
  };

  const handleCheckIn = async () => {
    if (!bookingId) return;
    const response = await mutationApi.execute(() => checkIn(bookingId));
    if (response.success) {
      fetchBookingDetails();
    }
  };

  const handleCheckOut = async () => {
    if (!bookingId) return;
    const response = await mutationApi.execute(() => checkOut(bookingId));
    if (response.success) {
      navigate(`/dashboard/checkout/${bookingId}`);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) return;
    const response = await mutationApi.execute(() => cancelBooking(bookingId));
    if (response.success) {
      setCancelDialog(false);
      fetchBookingDetails();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTotalLaundryCharges = () => {
    return laundryActivities.reduce((sum, a) => sum + a.total, 0);
  };

  const getTotalRestaurantCharges = () => {
    return restaurantChargeItems.reduce((sum, r) => sum + r.total, 0);
  };

  const statusColors: Record<string, "success" | "info" | "warning" | "secondary"> = {
    "checked-in": "success",
    confirmed: "info",
    "checked-out": "secondary",
    cancelled: "warning",
  };

  if (bookingApi.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Booking Details" subtitle="Loading..." />
        <div className="p-6">
          <LoadingState message="Loading booking details..." />
        </div>
      </div>
    );
  }

  if (bookingApi.error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Booking Details" subtitle="Error" />
        <div className="p-6">
          <ErrorState message={bookingApi.error} onRetry={fetchBookingDetails} />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Booking Details" subtitle="Not Found" />
        <div className="p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Booking not found</p>
            <Link to="/dashboard/bookings">
              <Button variant="outline">Back to Bookings</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Booking Details" 
        subtitle={`Reference: ${booking.bookingReference}`} 
      />

      <div className="p-6 space-y-6">
        {/* Back Button & Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <Link to="/dashboard/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
          <div className="flex items-center gap-2 print:hidden">
            {booking.status === "confirmed" && (
              <Button variant="default" size="sm" onClick={handleCheckIn} disabled={mutationApi.isLoading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In
              </Button>
            )}
            {booking.status === "checked-in" && (
              <Button variant="default" size="sm" onClick={handleCheckOut} disabled={mutationApi.isLoading}>
                <LogOut className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            )}
            {booking.status !== "cancelled" && booking.status !== "checked-out" && (
              <Button variant="destructive" size="sm" onClick={() => setCancelDialog(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </motion.div>

        {/* Printable Content */}
        <div ref={printRef} className="print:p-8">
          {/* Hotel Header - Only shows on print */}
          <div className="hidden print:block mb-8 pb-6 border-b-2 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={hotelDetails.hotelLogo} 
                  alt="Hotel Logo" 
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold">{booking.hotelName}</h1>
                  <p className="text-muted-foreground">{hotelDetails.hotelAddress}</p>
                  <p className="text-muted-foreground">{hotelDetails.hotelPhone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Booking Reference</p>
                <p className="text-xl font-bold text-primary">{booking.bookingReference}</p>
                <p className="text-sm text-muted-foreground mt-2">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4 bg-primary/10 print:bg-transparent print:border-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Booking Reference</p>
                      <p className="text-2xl font-bold text-primary">{booking.bookingReference}</p>
                    </div>
                    <Badge variant={statusColors[booking.status]} className="text-sm">
                      {booking.status}
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Guest Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Guest Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <img
                        src={booking.guestAvatar || 'https://ui-avatars.com/api/?name=Guest'}
                        alt={booking.guestName || 'Guest'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-semibold">{booking.guestName || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold">{booking.guestEmail || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-semibold">{booking.guestPhone || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Guest ID</p>
                            <p className="font-semibold">{booking.guestId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Room Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-primary" />
                      Room Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="text-xl font-bold">{booking.roomNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-semibold">{booking.roomCategory || '-'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Hotel</p>
                          <p className="font-semibold">{booking.hotelName || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nights</p>
                        <p className="font-semibold">{calculateNights()} night(s)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <p className="font-semibold">{booking.checkIn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-warning" />
                        <div>
                          <p className="text-sm text-muted-foreground">Check-out</p>
                          <p className="font-semibold">{booking.checkOut}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Laundry Activities */}
              {laundryActivities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shirt className="w-5 h-5 text-primary" />
                        Laundry Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {laundryActivities.map((activity) => (
                          <div key={activity.id} className="p-4 bg-secondary/30 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm text-muted-foreground">{activity.date}</p>
                              <Badge variant="secondary">{activity.status}</Badge>
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2">Item</th>
                                  <th className="text-center py-2">Qty</th>
                                  <th className="text-right py-2">Price</th>
                                  <th className="text-right py-2">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activity.items.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border/50">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                                    <td className="py-2 text-right">{formatCurrency(item.quantity * item.price)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="font-semibold">
                                  <td colSpan={3} className="py-2 text-right">Subtotal:</td>
                                  <td className="py-2 text-right">{formatCurrency(activity.total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Restaurant/Bar Charges */}
              {restaurantChargeItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                        Restaurant & Bar Charges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {restaurantChargeItems.map((charge) => (
                          <div key={charge.id} className="p-4 bg-secondary/30 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm text-muted-foreground">{charge.date}</p>
                              <Badge variant="secondary">{charge.status}</Badge>
                            </div>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2">Item</th>
                                  <th className="text-center py-2">Qty</th>
                                  <th className="text-right py-2">Price</th>
                                  <th className="text-right py-2">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {charge.items.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border/50">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                                    <td className="py-2 text-right">{formatCurrency(item.quantity * item.price)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="font-semibold">
                                  <td colSpan={3} className="py-2 text-right">Subtotal:</td>
                                  <td className="py-2 text-right">{formatCurrency(charge.total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Charges</span>
                      <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                    {getTotalRestaurantCharges() > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Restaurant & Bar</span>
                        <span className="font-semibold">{formatCurrency(getTotalRestaurantCharges())}</span>
                      </div>
                    )}
                    {getTotalLaundryCharges() > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Laundry</span>
                        <span className="font-semibold">{formatCurrency(getTotalLaundryCharges())}</span>
                      </div>
                    )}
                    {(booking.otherCharges || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Other Charges</span>
                        <span className="font-semibold">{formatCurrency(booking.otherCharges || 0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Grand Total</span>
                      <span className="text-primary">
                        {formatCurrency(
                          booking.totalAmount + 
                          getTotalRestaurantCharges() + 
                          getTotalLaundryCharges() + 
                          (booking.otherCharges || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid Amount</span>
                      <span className="text-success font-semibold">-{formatCurrency(booking.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Balance Due</span>
                      <span className="text-warning">
                        {formatCurrency(
                          booking.totalAmount + 
                          getTotalRestaurantCharges() + 
                          getTotalLaundryCharges() + 
                          (booking.otherCharges || 0) - 
                          booking.paidAmount
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="print:hidden pt-4 space-y-2">
                    <Link to={`/dashboard/checkout/${booking.id}`} className="block">
                      <Button variant="hero" className="w-full">
                        View Checkout Report
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 pt-6 border-t-2 border-border text-center text-sm text-muted-foreground">
            <p>Thank you for choosing {booking.hotelName}</p>
            <p className="mt-1">{hotelDetails.hotelAddress} | {hotelDetails.hotelPhone}</p>
            <p className="mt-2">This is a computer-generated document. No signature required.</p>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={cancelDialog}
        onOpenChange={setCancelDialog}
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
