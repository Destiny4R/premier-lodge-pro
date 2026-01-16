import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  ShoppingCart,
  UtensilsCrossed,
  Wine,
  Coffee,
  DollarSign,
  Package,
  Edit,
  Trash,
  MoreVertical,
} from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  CreateMenuItemRequest
} from "@/services/restaurantService";
import { MenuItem, PaginatedResponse } from "@/types/api";

export default function RestaurantPage() {
  // API States
  const menuApi = useApi<PaginatedResponse<MenuItem>>();
  const mutationApi = useApi<MenuItem | null>({ showSuccessToast: true });

  // Local state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [activeFilter, setActiveFilter] = useState<"all" | "food" | "drink">("all");

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "food" as "food" | "drink",
    price: "",
    description: "",
    inStock: true,
  });

  const [stockForm, setStockForm] = useState({
    itemId: "",
    quantity: "",
    type: "add",
    notes: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const response = await menuApi.execute(() => getMenuItems());
    if (response.success && response.data) {
      setMenuItems(response.data.items);
    }
  };

  const foodItems = menuItems.filter((item) => item.category === "food");
  const drinkItems = menuItems.filter((item) => item.category === "drink");
  const filteredItems = activeFilter === "all" ? menuItems : menuItems.filter(i => i.category === activeFilter);

  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description,
        inStock: item.inStock,
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: "", category: "food", price: "", description: "", inStock: true });
    }
    setItemModalOpen(true);
  };

  const handleItemSubmit = async () => {
    const itemData: CreateMenuItemRequest = {
      name: itemForm.name,
      category: itemForm.category,
      price: parseFloat(itemForm.price),
      description: itemForm.description,
      inStock: itemForm.inStock,
    };

    if (editingItem) {
      const response = await mutationApi.execute(() => updateMenuItem(editingItem.id, itemData));
      if (response.success) {
        fetchMenuItems();
        setItemModalOpen(false);
      }
    } else {
      const response = await mutationApi.execute(() => createMenuItem(itemData));
      if (response.success) {
        fetchMenuItems();
        setItemModalOpen(false);
      }
    }
  };

  const handleStockSubmit = () => {
    toast.success("Stock updated successfully");
    setStockModalOpen(false);
    setStockForm({ itemId: "", quantity: "", type: "add", notes: "" });
  };

  const handleDelete = async () => {
    const response = await mutationApi.execute(() => deleteMenuItem(deleteDialog.id));
    if (response.success) {
      fetchMenuItems();
    }
    setDeleteDialog({ open: false, id: "" });
  };

  const isLoading = menuApi.isLoading;
  const hasError = menuApi.error;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Restaurant & Bar" subtitle="Manage menu items, orders, and inventory" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search menu items..." className="pl-10 bg-secondary border-border" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setStockModalOpen(true)}>
              <Package className="w-4 h-4 mr-2" />
              Stock Intake
            </Button>
            <Button variant="hero" onClick={() => openItemModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Today's Sales", value: "₦--", icon: DollarSign, color: "text-success" },
            { label: "Active Orders", value: "--", icon: ShoppingCart, color: "text-primary" },
            { label: "Food Items", value: foodItems.length, icon: UtensilsCrossed, color: "text-warning" },
            { label: "Drink Items", value: drinkItems.length, icon: Wine, color: "text-info" },
          ].map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading menu items..." />}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorState 
            message={menuApi.error || 'Failed to load data'} 
            onRetry={fetchMenuItems} 
          />
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Menu Items</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={activeFilter === "all" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={activeFilter === "food" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setActiveFilter("food")}
                    >
                      <UtensilsCrossed className="w-4 h-4 mr-1" />
                      Food
                    </Button>
                    <Button 
                      variant={activeFilter === "drink" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setActiveFilter("drink")}
                    >
                      <Wine className="w-4 h-4 mr-1" />
                      Drinks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredItems.length === 0 ? (
                    <EmptyState
                      icon={UtensilsCrossed}
                      title="No menu items found"
                      description="Add your first menu item to get started"
                      action={
                        <Button onClick={() => openItemModal()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems.map((item) => (
                        <Card key={item.id} variant="elevated" className="p-4 flex gap-4 hover-lift">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{item.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openItemModal(item)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => setDeleteDialog({ open: true, id: item.id })}
                                  >
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-bold text-primary">₦{item.price?.toLocaleString()}</span>
                              <Badge variant={item.inStock ? "success" : "destructive"}>
                                {item.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* POS / Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Current Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active order</p>
                    <p className="text-sm">Go to Take Order to create orders</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      {/* Food Item Modal */}
      <FormModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        description="Create or update a food or drink item"
        onSubmit={handleItemSubmit}
        submitLabel={editingItem ? "Update Item" : "Add Item"}
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Item Name" required>
            <Input
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g., Grilled Salmon"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <Select value={itemForm.category} onValueChange={(v: "food" | "drink") => setItemForm({ ...itemForm, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Price" required>
              <Input
                type="number"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="0.00"
              />
            </FormField>
          </div>
          <FormField label="Description">
            <Textarea
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="Item description..."
              rows={2}
            />
          </FormField>
          <FormField label="In Stock">
            <div className="flex items-center gap-2">
              <Switch
                checked={itemForm.inStock}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, inStock: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {itemForm.inStock ? "Available for order" : "Currently unavailable"}
              </span>
            </div>
          </FormField>
        </div>
      </FormModal>

      {/* Stock Intake Modal */}
      <FormModal
        open={stockModalOpen}
        onOpenChange={setStockModalOpen}
        title="Stock Intake"
        description="Record new stock received"
        onSubmit={handleStockSubmit}
        submitLabel="Record Stock"
      >
        <div className="space-y-4">
          <FormField label="Menu Item" required>
            <Select value={stockForm.itemId} onValueChange={(v) => setStockForm({ ...stockForm, itemId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <Select value={stockForm.type} onValueChange={(v) => setStockForm({ ...stockForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Stock In</SelectItem>
                  <SelectItem value="remove">Stock Out</SelectItem>
                  <SelectItem value="adjust">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Quantity" required>
              <Input
                type="number"
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                placeholder="0"
              />
            </FormField>
          </div>
          <FormField label="Notes">
            <Textarea
              value={stockForm.notes}
              onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
              placeholder="Reason for stock adjustment..."
              rows={2}
            />
          </FormField>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
