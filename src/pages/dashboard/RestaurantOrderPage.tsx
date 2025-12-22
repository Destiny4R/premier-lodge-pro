import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Minus,
  Search,
  ShoppingCart,
  UtensilsCrossed,
  Wine,
  Trash2,
  CreditCard,
  Banknote,
  BedDouble,
  User,
} from "lucide-react";
import { menuItems, guests, rooms, MenuItem } from "@/data/mockData";
import { FormModal, FormField } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem extends MenuItem {
  quantity: number;
}

export default function RestaurantOrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "food" | "drink">("all");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customerType: "walk-in" as "walk-in" | "guest",
    guestId: "",
    paymentMethod: "cash" as "cash" | "card" | "room-charge",
  });

  const filteredItems = menuItems
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter((item) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const handleCompleteOrder = () => {
    const paymentLabel = checkoutForm.paymentMethod === "room-charge" 
      ? "charged to room" 
      : checkoutForm.paymentMethod;
    toast.success(`Order completed successfully! Payment: ${paymentLabel}`);
    setCheckoutModalOpen(false);
    clearCart();
    setCheckoutForm({
      customerType: "walk-in",
      guestId: "",
      paymentMethod: "cash",
    });
  };

  const checkedInGuests = guests.filter((g) => g.totalStays > 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Take Order" subtitle="Point of sale for restaurant & bar" />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  onClick={() => setActiveCategory("all")}
                >
                  All
                </Button>
                <Button
                  variant={activeCategory === "food" ? "default" : "outline"}
                  onClick={() => setActiveCategory("food")}
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Food
                </Button>
                <Button
                  variant={activeCategory === "drink" ? "default" : "outline"}
                  onClick={() => setActiveCategory("drink")}
                >
                  <Wine className="w-4 h-4 mr-2" />
                  Drinks
                </Button>
              </div>
            </div>

            {/* Menu Grid */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        variant="elevated"
                        className={`p-4 cursor-pointer transition-all hover-lift ${
                          !item.inStock && "opacity-50"
                        }`}
                        onClick={() => item.inStock && addToCart(item)}
                      >
                        <div className="text-4xl mb-2">
                          {item.category === "food" ? "🍽️" : "🍹"}
                        </div>
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-semibold">
                            ${item.price}
                          </span>
                          {!item.inStock && (
                            <Badge variant="secondary" className="text-xs">
                              Out
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Click items to add them</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ${item.price} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Totals */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (10%)</span>
                        <span className="text-foreground">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={handleCheckout}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Checkout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Checkout Modal */}
      <FormModal
        open={checkoutModalOpen}
        onOpenChange={setCheckoutModalOpen}
        title="Complete Order"
        description="Select payment method and complete the order"
        onSubmit={handleCompleteOrder}
        submitLabel="Complete Order"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="text-foreground">{cart.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-primary font-bold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>

          <FormField label="Customer Type" required>
            <Select
              value={checkoutForm.customerType}
              onValueChange={(v: "walk-in" | "guest") =>
                setCheckoutForm({ ...checkoutForm, customerType: v, guestId: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walk-in">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Walk-in Customer
                  </div>
                </SelectItem>
                <SelectItem value="guest">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4" />
                    Hotel Guest
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {checkoutForm.customerType === "guest" && (
            <FormField label="Select Guest" required>
              <Select
                value={checkoutForm.guestId}
                onValueChange={(v) => setCheckoutForm({ ...checkoutForm, guestId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {checkedInGuests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.name} - Room 101
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField label="Payment Method" required>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={checkoutForm.paymentMethod === "cash" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "cash" })}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-sm">Cash</span>
              </Button>
              <Button
                type="button"
                variant={checkoutForm.paymentMethod === "card" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "card" })}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Card</span>
              </Button>
              {checkoutForm.customerType === "guest" && (
                <Button
                  type="button"
                  variant={checkoutForm.paymentMethod === "room-charge" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "room-charge" })}
                >
                  <BedDouble className="w-6 h-6" />
                  <span className="text-sm">Room</span>
                </Button>
              )}
            </div>
          </FormField>
        </div>
      </FormModal>
    </div>
  );
}