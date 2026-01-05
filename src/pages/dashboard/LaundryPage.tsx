import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Shirt, Package, Clock, CheckCircle, DollarSign, Edit, Trash, MoreVertical } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { 
  getLaundryOrders, 
  getLaundryItems,
  createLaundryOrder, 
  updateLaundryOrderStatus, 
  deleteLaundryOrder,
  createLaundryItem,
  updateLaundryItem,
  deleteLaundryItem
} from "@/services/laundryService";
import { getGuests } from "@/services/guestService";
import { LaundryOrder, LaundryItem, Guest, PaginatedResponse } from "@/types/api";

const statusColors: Record<string, "info" | "warning" | "success" | "secondary"> = {
  received: "info",
  processing: "warning",
  ready: "success",
  delivered: "secondary",
};

export default function LaundryPage() {
  // API States
  const ordersApi = useApi<PaginatedResponse<LaundryOrder>>();
  const itemsApi = useApi<PaginatedResponse<LaundryItem>>();
  const guestsApi = useApi<PaginatedResponse<Guest>>();
  const mutationApi = useApi<LaundryOrder | LaundryItem | null>({ showSuccessToast: true });

  // Local state
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [clothingCategories, setClothingCategories] = useState<LaundryItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LaundryItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "category" | "order"; id: string }>({ open: false, type: "category", id: "" });

  const [categoryForm, setCategoryForm] = useState({ name: "", price: "" });
  const [orderForm, setOrderForm] = useState({
    customerType: "guest" as "guest" | "external",
    guestId: "",
    customerName: "",
    items: [{ categoryId: "", quantity: "" }],
    paymentMethod: "cash" as "cash" | "card" | "room-charge",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchOrders();
    fetchItems();
    fetchGuests();
  }, []);

  const fetchOrders = async () => {
    const response = await ordersApi.execute(() => getLaundryOrders());
    if (response.success && response.data) {
      setOrders(response.data.items);
    }
  };

  const fetchItems = async () => {
    const response = await itemsApi.execute(() => getLaundryItems());
    if (response.success && response.data) {
      setClothingCategories(response.data.items);
    }
  };

  const fetchGuests = async () => {
    const response = await guestsApi.execute(() => getGuests());
    if (response.success && response.data) {
      setGuests(response.data.items);
    }
  };

  const openCategoryModal = (category?: LaundryItem) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, price: category.price.toString() });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", price: "" });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async () => {
    const categoryData = {
      name: categoryForm.name,
      price: parseFloat(categoryForm.price),
    };

    if (editingCategory) {
      const response = await mutationApi.execute(() => updateLaundryItem(editingCategory.id, categoryData));
      if (response.success) {
        fetchItems();
        setCategoryModalOpen(false);
      }
    } else {
      const response = await mutationApi.execute(() => createLaundryItem(categoryData));
      if (response.success) {
        fetchItems();
        setCategoryModalOpen(false);
      }
    }
  };

  const handleOrderSubmit = async () => {
    const orderData = {
      guestId: orderForm.customerType === 'guest' ? orderForm.guestId : undefined,
      customerName: orderForm.customerType === 'guest' 
        ? guests.find(g => g.id === orderForm.guestId)?.name || ''
        : orderForm.customerName,
      items: orderForm.items.map(item => ({
        laundryItemId: item.categoryId,
        quantity: parseInt(item.quantity) || 0,
      })),
      paymentMethod: orderForm.paymentMethod,
    };

    const response = await mutationApi.execute(() => createLaundryOrder(orderData));
    if (response.success) {
      fetchOrders();
      setOrderModalOpen(false);
      setOrderForm({
        customerType: "guest",
        guestId: "",
        customerName: "",
        items: [{ categoryId: "", quantity: "" }],
        paymentMethod: "cash",
      });
    }
  };

  const handleStatusUpdate = async (orderId: string, status: LaundryOrder['status']) => {
    const response = await mutationApi.execute(() => updateLaundryOrderStatus(orderId, status));
    if (response.success) {
      fetchOrders();
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.type === "category") {
      const response = await mutationApi.execute(() => deleteLaundryItem(deleteDialog.id));
      if (response.success) {
        fetchItems();
      }
    } else {
      const response = await mutationApi.execute(() => deleteLaundryOrder(deleteDialog.id));
      if (response.success) {
        fetchOrders();
      }
    }
    setDeleteDialog({ open: false, type: "category", id: "" });
  };

  const addOrderItem = () => {
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, { categoryId: "", quantity: "" }],
    });
  };

  const updateOrderItem = (index: number, field: "categoryId" | "quantity", value: string) => {
    const newItems = [...orderForm.items];
    newItems[index][field] = value;
    setOrderForm({ ...orderForm, items: newItems });
  };

  const removeOrderItem = (index: number) => {
    if (orderForm.items.length > 1) {
      const newItems = orderForm.items.filter((_, i) => i !== index);
      setOrderForm({ ...orderForm, items: newItems });
    }
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((total, item) => {
      const category = clothingCategories.find(c => c.id === item.categoryId);
      return total + (category?.price || 0) * (parseInt(item.quantity) || 0);
    }, 0);
  };

  const isLoading = ordersApi.isLoading || itemsApi.isLoading;
  const hasError = ordersApi.error || itemsApi.error;

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'received').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Laundry Services" subtitle="Track and manage all laundry orders" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-10 bg-secondary border-border" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => openCategoryModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button variant="hero" onClick={() => setOrderModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
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
            { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-warning" },
            { label: "In Processing", value: processingOrders, icon: Shirt, color: "text-info" },
            { label: "Ready for Pickup", value: readyOrders, icon: CheckCircle, color: "text-success" },
            { label: "Today's Revenue", value: "$--", icon: DollarSign, color: "text-primary" },
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
        {isLoading && <LoadingState message="Loading laundry data..." />}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorState 
            message={ordersApi.error || itemsApi.error || 'Failed to load data'} 
            onRetry={() => { fetchOrders(); fetchItems(); }} 
          />
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <>
            {/* Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Laundry Orders</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">All</Button>
                    <Button variant="ghost" size="sm">In-House</Button>
                    <Button variant="ghost" size="sm">External</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <EmptyState
                      icon={Shirt}
                      title="No laundry orders"
                      description="Create your first laundry order"
                      action={
                        <Button onClick={() => setOrderModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          New Order
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} variant="elevated" className="p-4 hover-lift">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shirt className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{order.customerName}</h3>
                                  <Badge variant={order.guestId ? "default" : "secondary"}>
                                    {order.guestId ? "Guest" : "External"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-foreground">${order.totalAmount}</p>
                                <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod}</p>
                              </div>
                              <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">Update</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')}>
                                    Mark as Processing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'ready')}>
                                    Mark as Ready
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')}>
                                    Mark as Delivered
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Clothing Categories & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  {clothingCategories.length === 0 ? (
                    <EmptyState
                      icon={Package}
                      title="No clothing categories"
                      description="Add clothing categories to create orders"
                      action={
                        <Button onClick={() => openCategoryModal()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {clothingCategories.map((item) => (
                        <Card key={item.id} variant="glass" className="p-4 text-center relative group">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openCategoryModal(item)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteDialog({ open: true, type: "category", id: item.id })}
                              >
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-lg font-bold text-primary">${item.price}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Clothing Category Modal */}
      <FormModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        title={editingCategory ? "Edit Clothing Category" : "Add Clothing Category"}
        description="Define clothing type and pricing"
        onSubmit={handleCategorySubmit}
        submitLabel={editingCategory ? "Update Category" : "Add Category"}
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Category Name" required>
            <Input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g., Shirts, Pants, Suits"
            />
          </FormField>
          <FormField label="Price per Item" required>
            <Input
              type="number"
              value={categoryForm.price}
              onChange={(e) => setCategoryForm({ ...categoryForm, price: e.target.value })}
              placeholder="0.00"
            />
          </FormField>
        </div>
      </FormModal>

      {/* Laundry Order Modal */}
      <FormModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        title="Create Laundry Order"
        description="Record new laundry intake"
        onSubmit={handleOrderSubmit}
        submitLabel="Create Order"
        size="lg"
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Customer Type" required>
            <Select 
              value={orderForm.customerType} 
              onValueChange={(v: "guest" | "external") => setOrderForm({ ...orderForm, customerType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest">Hotel Guest</SelectItem>
                <SelectItem value="external">External Customer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {orderForm.customerType === "guest" ? (
            <FormField label="Select Guest" required>
              <Select value={orderForm.guestId} onValueChange={(v) => setOrderForm({ ...orderForm, guestId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name} - {g.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : (
            <FormField label="Customer Name" required>
              <Input
                value={orderForm.customerName}
                onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                placeholder="Customer full name"
              />
            </FormField>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Clothing Items</label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>
            {orderForm.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Select 
                  value={item.categoryId} 
                  onValueChange={(v) => updateOrderItem(index, "categoryId", v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select clothing" />
                  </SelectTrigger>
                  <SelectContent>
                    {clothingCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - ${c.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(index, "quantity", e.target.value)}
                  placeholder="Qty"
                  className="w-20"
                />
                {orderForm.items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOrderItem(index)}>
                    <Trash className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <FormField label="Payment Method" required>
            <Select 
              value={orderForm.paymentMethod} 
              onValueChange={(v: "cash" | "card" | "room-charge") => setOrderForm({ ...orderForm, paymentMethod: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                {orderForm.customerType === "guest" && (
                  <SelectItem value="room-charge">Charge to Room</SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormField>

          <Card variant="glass" className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Estimated Total</span>
              <span className="text-xl font-bold text-primary">${calculateTotal()}</span>
            </div>
          </Card>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={deleteDialog.type === "category" ? "Delete Category" : "Delete Order"}
        description={deleteDialog.type === "category" 
          ? "Are you sure you want to delete this clothing category? This action cannot be undone."
          : "Are you sure you want to delete this order? This action cannot be undone."
        }
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
