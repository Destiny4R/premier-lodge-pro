import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Package,
  AlertTriangle,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockItem, FoodCategory, OrderCartItem } from "@/types/restaurant";
import { stockService } from "@/services/stockService";
import { foodCategoryService } from "@/services/foodCategoryService";

// Mock data for fallback
const mockCategories: FoodCategory[] = [
  { id: "fc1", hotelId: "h1", name: "Appetizers", description: "Starters", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc2", hotelId: "h1", name: "Main Course", description: "Main dishes", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc3", hotelId: "h1", name: "Desserts", description: "Sweet treats", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc4", hotelId: "h1", name: "Beverages", description: "Drinks", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

const mockStock: StockItem[] = [
  { id: "s1", hotelId: "h1", categoryId: "fc1", categoryName: "Appetizers", name: "Spring Rolls", image: "", quantity: 50, price: 1500, description: "Crispy vegetable spring rolls", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s2", hotelId: "h1", categoryId: "fc2", categoryName: "Main Course", name: "Grilled Chicken", image: "", quantity: 30, price: 4500, description: "Marinated grilled chicken breast", minimumStockLevel: 15, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s3", hotelId: "h1", categoryId: "fc2", categoryName: "Main Course", name: "Jollof Rice", image: "", quantity: 100, price: 2500, description: "Nigerian style jollof rice", minimumStockLevel: 20, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s4", hotelId: "h1", categoryId: "fc3", categoryName: "Desserts", name: "Chocolate Cake", image: "", quantity: 8, price: 3000, description: "Rich chocolate layer cake", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s5", hotelId: "h1", categoryId: "fc4", categoryName: "Beverages", name: "Fresh Orange Juice", image: "", quantity: 25, price: 1000, description: "Freshly squeezed orange juice", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s6", hotelId: "h1", categoryId: "fc2", categoryName: "Main Course", name: "Fried Rice", image: "", quantity: 80, price: 2800, description: "Special fried rice with vegetables", minimumStockLevel: 15, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "s7", hotelId: "h1", categoryId: "fc4", categoryName: "Beverages", name: "Chapman", image: "", quantity: 40, price: 1500, description: "Nigerian non-alcoholic cocktail", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

export default function TakeOrderPage() {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<OrderCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, catRes] = await Promise.all([
        stockService.getStockItems(),
        foodCategoryService.getFoodCategories(),
      ]);
      
      if (stockRes.success && stockRes.data?.items) {
        setStockItems(stockRes.data.items);
      } else {
        setStockItems(mockStock);
      }
      
      if (catRes.success && catRes.data?.items) {
        setCategories(catRes.data.items);
      } else {
        setCategories(mockCategories);
      }
    } catch {
      setStockItems(mockStock);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableQuantity = (stockItem: StockItem) => {
    const cartItem = cart.find(c => c.stockItemId === stockItem.id);
    const inCart = cartItem?.quantity || 0;
    return stockItem.quantity - inCart;
  };

  const addToCart = (item: StockItem) => {
    const availableQty = getAvailableQuantity(item);
    if (availableQty <= 0) {
      toast.error("No more stock available");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.stockItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.stockItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { stockItemId: item.id, stockItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (stockItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.stockItemId === stockItemId) {
            const newQuantity = item.quantity + delta;
            // Check max stock
            if (delta > 0 && newQuantity > item.stockItem.quantity) {
              toast.error("Cannot exceed available stock");
              return item;
            }
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderCartItem[];
    });
  };

  const removeFromCart = (stockItemId: string) => {
    setCart((prev) => prev.filter((item) => item.stockItemId !== stockItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.stockItem.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    // Store cart in sessionStorage for checkout page
    sessionStorage.setItem("restaurantCart", JSON.stringify(cart));
    navigate("/dashboard/restaurant/checkout");
  };

  const filteredItems = stockItems
    .filter((item) => selectedCategory === "all" || item.categoryId === selectedCategory)
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const isLowStock = (item: StockItem) => item.quantity <= item.minimumStockLevel;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Take Order" subtitle="Select items from stock to create an order" />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Items */}
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
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Grid */}
            <Card>
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map((item) => {
                      const availableQty = getAvailableQuantity(item);
                      const outOfStock = item.quantity === 0;
                      const inCart = cart.find(c => c.stockItemId === item.id);
                      
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            variant="elevated"
                            className={`p-4 cursor-pointer transition-all hover-lift relative ${
                              outOfStock && "opacity-50 cursor-not-allowed"
                            } ${inCart && "ring-2 ring-primary"}`}
                            onClick={() => !outOfStock && addToCart(item)}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-20 object-cover rounded-lg mb-2"
                              />
                            ) : (
                              <div className="w-full h-20 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                                <Package className="w-8 h-8 text-primary" />
                              </div>
                            )}
                            
                            <h3 className="font-medium text-foreground text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.categoryName}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-primary font-semibold text-sm">
                                ₦{item.price?.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {isLowStock(item) && !outOfStock && (
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Qty: {availableQty}
                                </span>
                              </div>
                            </div>
                            
                            {outOfStock && (
                              <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                                Out of Stock
                              </Badge>
                            )}
                            
                            {inCart && (
                              <Badge className="absolute top-2 left-2 text-xs">
                                {inCart.quantity} in cart
                              </Badge>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
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
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length}</Badge>
                  )}
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
                            key={item.stockItemId}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {item.stockItem.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ₦{item.stockItem.price?.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.stockItemId, -1)}
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
                                onClick={() => updateQuantity(item.stockItemId, 1)}
                                disabled={item.quantity >= item.stockItem.quantity}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeFromCart(item.stockItemId)}
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
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">
                          ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={handleProceedToCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
