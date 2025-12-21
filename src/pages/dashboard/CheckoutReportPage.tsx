import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Download, CreditCard, Banknote } from "lucide-react";
import { bookings, guests, rooms, hotels, roomCategories, laundryOrders } from "@/data/mockData";
import { toast } from "sonner";

export default function CheckoutReportPage() {
  const { bookingId } = useParams();
  
  const booking = bookings.find(b => b.id === bookingId) || bookings[0];
  const guest = guests.find(g => g.id === booking?.guestId);
  const room = rooms.find(r => r.id === booking?.roomId);
  const hotel = hotels.find(h => h.id === booking?.hotelId);
  const category = roomCategories.find(c => c.id === room?.categoryId);

  // Mock charges
  const roomCharges = booking?.totalAmount || 0;
  const restaurantCharges = 125.40;
  const laundryCharges = 65.00;
  const poolCharges = 0; // Included in booking
  const gymCharges = 0; // Included in booking
  const otherCharges = 45.00; // Mini bar, phone calls, etc.
  
  const subtotal = roomCharges + restaurantCharges + laundryCharges + poolCharges + gymCharges + otherCharges;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const paidAmount = booking?.paidAmount || 0;
  const balance = total - paidAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Report downloaded successfully");
  };

  const handlePayment = (method: string) => {
    toast.success(`Payment of $${balance.toFixed(2)} received via ${method}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Checkout Report" subtitle={`Booking #${bookingId}`} />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="print:shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Guest Bill</CardTitle>
                  <p className="text-muted-foreground">Final checkout statement</p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Info */}
                <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={guest?.avatar} alt={guest?.name} className="w-14 h-14 rounded-full" />
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{guest?.name}</h3>
                      <p className="text-muted-foreground">{guest?.email}</p>
                      <p className="text-muted-foreground">{guest?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-semibold">{room?.roomNumber} - {category?.name}</p>
                    <p className="text-sm text-muted-foreground">{hotel?.name}</p>
                  </div>
                </div>

                {/* Stay Duration */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-semibold">{booking?.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-semibold">{booking?.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nights</p>
                    <p className="font-semibold">3</p>
                  </div>
                </div>

                {/* Charges Breakdown */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Room Charges</p>
                          <p className="text-sm text-muted-foreground">3 nights @ ${room?.price}/night</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${roomCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Restaurant & Bar</p>
                          <p className="text-sm text-muted-foreground">Food and beverages charged to room</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${restaurantCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Laundry Services</p>
                          <p className="text-sm text-muted-foreground">3x Shirts, 2x Pants</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${laundryCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Swimming Pool</p>
                          <p className="text-sm text-muted-foreground">Included in booking</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-success">Included</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Gym Access</p>
                          <p className="text-sm text-muted-foreground">Included in booking</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-success">Included</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Other Charges</p>
                          <p className="text-sm text-muted-foreground">Mini bar, phone calls</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${otherCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-secondary/30">
                        <td className="py-3 px-4 font-semibold">Subtotal</td>
                        <td className="py-3 px-4 text-right font-semibold">${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">Tax (10%)</td>
                        <td className="py-3 px-4 text-right">${tax.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-primary/5">
                        <td className="py-4 px-4 font-bold text-lg">Total</td>
                        <td className="py-4 px-4 text-right font-bold text-lg text-primary">${total.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4 text-muted-foreground">Already Paid</td>
                        <td className="py-3 px-4 text-right text-success">-${paidAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-warning/10">
                        <td className="py-4 px-4 font-bold text-lg">Balance Due</td>
                        <td className="py-4 px-4 text-right font-bold text-lg text-warning">${balance.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="print:hidden"
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Process Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Balance Due</p>
                  <p className="text-3xl font-bold text-warning">${balance.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <Button variant="hero" className="w-full" onClick={() => handlePayment("Card")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay with Card
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handlePayment("Cash")}>
                    <Banknote className="w-4 h-4 mr-2" />
                    Pay with Cash
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bill</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Advance Payment</span>
                      <span>-${paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border">
                      <span>Remaining</span>
                      <span className="text-warning">${balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Card variant="glass" className="p-3">
                  <p className="text-xs text-muted-foreground">
                    Payment confirmation will be sent to the guest's email address on file.
                  </p>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
