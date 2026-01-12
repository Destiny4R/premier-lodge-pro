import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Download, CreditCard, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { getCheckoutReport } from "@/services/bookingService";
import { CheckoutReport } from "@/types/api";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";

export default function CheckoutReportPage() {
  const { bookingId } = useParams();
  const reportApi = useApi<CheckoutReport>();
  const [report, setReport] = useState<CheckoutReport | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchReport();
    }
  }, [bookingId]);

  /**
   * GET /api/v3/bookings/checkout-report/:id
   * Fetch checkout report for a booking
   */
  const fetchReport = async () => {
    if (!bookingId) return;
    
    const response = await reportApi.execute(() => getCheckoutReport(bookingId));
    if (response.success && response.data) {
      setReport(response.data);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Report downloaded successfully");
  };

  const handlePayment = (method: string) => {
    if (report) {
      toast.success(`Payment of $${report.balance.toFixed(2)} received via ${method}`);
    }
  };

  if (reportApi.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Checkout Report" subtitle="Loading..." />
        <div className="p-6">
          <LoadingState message="Loading checkout report..." />
        </div>
      </div>
    );
  }

  if (reportApi.error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Checkout Report" subtitle="Error" />
        <div className="p-6">
          <ErrorState message={reportApi.error} onRetry={fetchReport} />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Checkout Report" subtitle="Not Found" />
        <div className="p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Report not found</p>
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
      <DashboardHeader title="Checkout Report" subtitle={`Booking ${report.bookingReference}`} />

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
                {/* Booking Reference Banner */}
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                  <p className="text-2xl font-bold text-primary">{report.bookingReference}</p>
                </div>

                {/* Guest Info */}
                <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary">
                        {report.guestName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{report.guestName}</h3>
                      <p className="text-muted-foreground">{report.guestEmail}</p>
                      <p className="text-muted-foreground">{report.guestPhone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-semibold">{report.roomNumber} - {report.roomCategory}</p>
                    <p className="text-sm text-muted-foreground">{report.hotelName}</p>
                  </div>
                </div>

                {/* Stay Duration */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-semibold">{report.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-semibold">{report.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nights</p>
                    <p className="font-semibold">{report.nights}</p>
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
                          <p className="text-sm text-muted-foreground">{report.nights} nights</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${report.roomCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Restaurant & Bar</p>
                          <p className="text-sm text-muted-foreground">Food and beverages charged to room</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${report.restaurantCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Laundry Services</p>
                          <p className="text-sm text-muted-foreground">Laundry items</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${report.laundryCharges.toFixed(2)}</td>
                      </tr>
                      {report.poolCharges !== undefined && (
                        <tr className="border-t border-border">
                          <td className="py-3 px-4">
                            <p className="font-medium">Swimming Pool</p>
                            <p className="text-sm text-muted-foreground">{report.poolCharges === 0 ? 'Included in booking' : 'Pool access'}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {report.poolCharges === 0 ? <span className="text-success">Included</span> : `$${report.poolCharges.toFixed(2)}`}
                          </td>
                        </tr>
                      )}
                      {report.gymCharges !== undefined && (
                        <tr className="border-t border-border">
                          <td className="py-3 px-4">
                            <p className="font-medium">Gym Access</p>
                            <p className="text-sm text-muted-foreground">{report.gymCharges === 0 ? 'Included in booking' : 'Gym access'}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {report.gymCharges === 0 ? <span className="text-success">Included</span> : `$${report.gymCharges.toFixed(2)}`}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">
                          <p className="font-medium">Other Charges</p>
                          <p className="text-sm text-muted-foreground">Mini bar, phone calls, etc.</p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">${report.otherCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-secondary/30">
                        <td className="py-3 px-4 font-semibold">Subtotal</td>
                        <td className="py-3 px-4 text-right font-semibold">${report.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4">Tax (10%)</td>
                        <td className="py-3 px-4 text-right">${report.tax.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-primary/5">
                        <td className="py-4 px-4 font-bold text-lg">Total</td>
                        <td className="py-4 px-4 text-right font-bold text-lg text-primary">${report.totalAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-3 px-4 text-muted-foreground">Already Paid</td>
                        <td className="py-3 px-4 text-right text-success">-${report.paidAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-warning/10">
                        <td className="py-4 px-4 font-bold text-lg">Balance Due</td>
                        <td className="py-4 px-4 text-right font-bold text-lg text-warning">${report.balance.toFixed(2)}</td>
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
                  <p className="text-3xl font-bold text-warning">${report.balance.toFixed(2)}</p>
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
                      <span>${report.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Advance Payment</span>
                      <span>-${report.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border">
                      <span>Remaining</span>
                      <span className="text-warning">${report.balance.toFixed(2)}</span>
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
