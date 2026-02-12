import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  CreditCard,
  Banknote,
  BedDouble,
  ArrowLeft,
  Printer,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField, FormModal } from "@/components/forms";
import { OrderCartItem } from "@/types/restaurant";
import { checkoutCash, checkoutRoomCharge } from "@/services/restaurantService";
import { CheckoutResponse } from "@/types/api";

interface ReceiptData {
  orderNumber: string;
  items: { name: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  bookingReference?: string;
  date: string;
}

export default function RestaurantCheckoutPage() {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "roomcharge">("cash");
  const [bookingReference, setBookingReference] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const storedCart = sessionStorage.getItem("restaurantCart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        toast.error("Failed to load cart");
        navigate("/dashboard/restaurant/orders");
      }
    } else {
      toast.error("No items in cart");
      navigate("/dashboard/restaurant/orders");
    }
    setLoading(false);
  }, [navigate]);

  const removeFromCart = (stockItemId: string) => {
    const newCart = cart.filter((item) => item.stockItemId !== stockItemId);
    setCart(newCart);
    sessionStorage.setItem("restaurantCart", JSON.stringify(newCart));
    if (newCart.length === 0) {
      toast.info("Cart is empty, redirecting...");
      navigate("/dashboard/restaurant/orders");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.stockItem.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCompleteOrder = async () => {
    // Basic client-side validation before sending request
    if (!cart || cart.length === 0) {
      toast.error("Cart is empty. Please add items before checking out.");
      return;
    }

    if (paymentMethod === "roomcharge" && !bookingReference.trim()) {
      toast.error("Please enter the booking reference number");
      return;
    }

    // Map and validate items payload
    const items = cart.map(item => ({
      stockId: Number(item.stockItemId),
      quantity: Number(item.quantity),
    }));

    if (items.some(i => !i.stockId || Number.isNaN(i.quantity) || i.quantity <= 0)) {
      toast.error("One or more items in the cart are invalid. Please check quantities.");
      return;
    }

    setSubmitting(true);

    try {
      let response;

      if (paymentMethod === "cash") {
        response = await checkoutCash({ items });
        console.log("Cash checkout response:", response);
      } else {
        response = await checkoutRoomCharge({ items, bookingReference });
        console.log("Room charge checkout response:", response);
      }

      if (response && response.success && response.data) {
        const data = response.data;
        const receipt: ReceiptData = {
          orderNumber: data.orderNumber,
          items: data.items,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.totalAmount,
          paymentMethod: data.paymentMethod === "room-charge"
            ? `Room Charge (${data.bookingReference})` : "Cash",
          bookingReference: data.bookingReference,
          date: data.date,
        };

        setReceiptData(receipt);
        setSuccessModalOpen(true);
        sessionStorage.removeItem("restaurantCart");
      } else {
        // Show backend message if present for clearer feedback
        toast.error(response?.message || "Checkout failed");
        console.error("Checkout error response:", response);
      }
    } catch (err) {
      // Log full error for debugging and show friendly message
      console.error("Checkout exception:", err);
      // If err has message or is ApiResponse, show its message
      const message = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : "An error occurred during checkout";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${receiptData?.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .hotel-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .hotel-info { font-size: 11px; margin-bottom: 3px; }
            .order-info { margin: 15px 0; font-size: 12px; }
            .items { margin: 15px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .totals { margin-top: 15px; }
            .total-row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 15px; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDone = () => {
    setSuccessModalOpen(false);
    navigate("/dashboard/restaurant/orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Checkout" subtitle="Review and complete your order" />

      <div className="p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard/restaurant/orders")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Order
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cart Items - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.stockItemId}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.stockItem.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₦{item.stockItem.price?.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-foreground">
                            ₦{(item.stockItem.price * item.quantity).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.stockItemId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({cart.length})</span>
                    <span className="text-foreground">
                      ₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">
                      ₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-border pt-3">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">
                      ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <FormField label="Payment Method" required>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      className="flex flex-col items-center gap-2 h-auto py-6"
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <Banknote className="w-8 h-8" />
                      <span>Cash</span>
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "roomcharge" ? "default" : "outline"}
                      className="flex flex-col items-center gap-2 h-auto py-6"
                      onClick={() => setPaymentMethod("roomcharge")}
                    >
                      <BedDouble className="w-8 h-8" />
                      <span>Charge to Room</span>
                    </Button>
                  </div>
                </FormField>

                {/* Booking Reference for Room Charge */}
                {paymentMethod === "roomcharge" && (
                  <FormField label="Booking Reference Number" required>
                    <Input
                      value={bookingReference}
                      onChange={(e) => setBookingReference(e.target.value)}
                      placeholder="Enter booking reference (e.g., BK-2024-001234)"
                    />
                  </FormField>
                )}

                {/* Complete Order Button */}
                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={handleCompleteOrder}
                  disabled={submitting}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {submitting ? "Processing..." : "Complete Order"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Modal with Receipt */}
      <FormModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Order Complete"
        description="Your order has been successfully processed"
        onSubmit={handleDone}
        submitLabel="Done"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          {/* Printable Receipt */}
          <div ref={printRef} className="p-4 bg-card rounded-lg border border-border">
            <div className="header text-center pb-4 border-b border-border mb-4">
              <div className="hotel-name text-lg font-bold text-foreground">LuxeStay Grand Palace</div>
              <div className="hotel-info text-xs text-muted-foreground">123 Fifth Avenue, Manhattan</div>
              <div className="hotel-info text-xs text-muted-foreground">Tel: +234 123 456 7890</div>
            </div>

            <div className="order-info text-sm space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order #:</span>
                <span className="font-medium text-foreground">{receiptData?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{receiptData?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment:</span>
                <span className="text-foreground">{receiptData?.paymentMethod}</span>
              </div>
            </div>

            <div className="items border-t border-b border-border py-3 my-3">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span className="flex-1">Item</span>
                <span className="w-12 text-center">Qty</span>
                <span className="w-20 text-right">Amount</span>
              </div>
              {receiptData?.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-1">
                  <span className="flex-1 text-foreground">{item.name}</span>
                  <span className="w-12 text-center text-muted-foreground">{item.quantity}</span>
                  <span className="w-20 text-right text-foreground">₦{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="totals space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">₦{receiptData?.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="text-foreground">₦{receiptData?.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">₦{receiptData?.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="footer text-center pt-4 mt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Thank you for your order!</p>
              <p className="text-xs text-muted-foreground">Please come again</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </FormModal>
    </div>
  );
}