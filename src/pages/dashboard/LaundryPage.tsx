import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Shirt, Package, Clock, CheckCircle, DollarSign, Edit, Trash, MoreVertical, Printer } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { generateTransactionRef } from "@/lib/reference";
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
import { LaundryOrder, LaundryItem, PaginatedResponse } from "@/types/api";

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
  const mutationApi = useApi<LaundryOrder | LaundryItem | null>({ showSuccessToast: true });

  // Local state
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [clothingCategories, setClothingCategories] = useState<LaundryItem[]>([]);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LaundryItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "category" | "order"; id: string }>({ open: false, type: "category", id: "" });
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    items: { name: string; quantity: number; price: number; subtotal: number }[];
    total: number;
    paymentMethod: string;
    bookingReference?: string;
    date: string;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", price: "" });
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    items: [{ categoryId: "", quantity: "" }],
    paymentMethod: "cash" as "cash" | "card" | "room-charge",
    bookingReference: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchOrders();
    fetchItems();
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

  const resetOrderForm = () => {
    setOrderForm({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      items: [{ categoryId: "", quantity: "" }],
      paymentMethod: "cash",
      bookingReference: "",
    });
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
    // Validate required fields
    if (!orderForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!orderForm.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!orderForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!orderForm.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (orderForm.paymentMethod === "room-charge" && !orderForm.bookingReference.trim()) {
      toast.error("Booking reference is required for room charge");
      return;
    }

    const orderData = {
      fullName: orderForm.fullName,
      phone: orderForm.phone,
      email: orderForm.email,
      address: orderForm.address,
      items: orderForm.items.map(item => ({
        laundryItemId: item.categoryId,
        quantity: parseInt(item.quantity) || 0,
      })),
      paymentMethod: orderForm.paymentMethod,
      bookingReference: orderForm.paymentMethod === "room-charge" ? orderForm.bookingReference : undefined,
    };

    const response = await mutationApi.execute(() => createLaundryOrder(orderData));
    if (response.success) {
      fetchOrders();
      setOrderModalOpen(false);
      
      // Build receipt data
      const receiptItems = orderForm.items.map(item => {
        const category = clothingCategories.find(c => c.id === item.categoryId);
        const qty = parseInt(item.quantity) || 0;
        return {
          name: category?.name || "Unknown",
          quantity: qty,
          price: category?.price || 0,
          subtotal: (category?.price || 0) * qty,
        };
      });
      const total = receiptItems.reduce((sum, i) => sum + i.subtotal, 0);
      
      setReceiptData({
        orderNumber: generateTransactionRef("LDR"),
        customerName: orderForm.fullName,
        phone: orderForm.phone,
        email: orderForm.email,
        address: orderForm.address,
        items: receiptItems,
        total,
        paymentMethod: orderForm.paymentMethod === "room-charge" 
          ? `Room Charge (${orderForm.bookingReference})` 
          : orderForm.paymentMethod === "card" ? "Card" : "Cash",
        bookingReference: orderForm.paymentMethod === "room-charge" ? orderForm.bookingReference : undefined,
        date: new Date().toLocaleString(),
      });
      setSuccessModalOpen(true);
      resetOrderForm();
    }
  };

  const handlePrintReceipt = () => {
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
          <title>Laundry Receipt - ${receiptData?.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .hotel-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .hotel-info { font-size: 11px; margin-bottom: 3px; }
            .section-title { font-size: 13px; font-weight: bold; margin: 10px 0 5px; }
            .info-row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
            .items { margin: 15px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .grand-total { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 15px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
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
            <Button variant="hero" onClick={() => { resetOrderForm(); setOrderModalOpen(true); }}>
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
            { label: "Today's Revenue", value: "₦--", icon: DollarSign, color: "text-primary" },
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
                                  <h3 className="font-semibold text-foreground">{order.fullName || order.customerName}</h3>
                                  {order.bookingReference && (
                                    <Badge variant="secondary">
                                      {order.bookingReference}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                                </p>
                                {order.phone && (
                                  <p className="text-xs text-muted-foreground">{order.phone}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-foreground">₦{order.totalAmount?.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod?.replace("-", " ")}</p>
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
                          <p className="text-lg font-bold text-primary">₦{item.price?.toLocaleString()}</p>
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
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input
                value={orderForm.fullName}
                onChange={(e) => setOrderForm({ ...orderForm, fullName: e.target.value })}
                placeholder="Enter customer full name"
              />
            </FormField>
            <FormField label="Phone" required>
              <Input
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email" required>
              <Input
                type="email"
                value={orderForm.email}
                onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </FormField>
            <FormField label="Address" required>
              <Input
                value={orderForm.address}
                onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                placeholder="Enter address"
              />
            </FormField>
          </div>

          {/* Clothing Items */}
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
                      <SelectItem key={c.id} value={c.id}>{c.name} - ₦{c.price?.toLocaleString()}</SelectItem>
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

          {/* Payment Method */}
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
                <SelectItem value="room-charge">Charge to Room</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Booking Reference - only shown when room-charge is selected */}
          {orderForm.paymentMethod === "room-charge" && (
            <FormField label="Room Booking Number" required>
              <Input
                value={orderForm.bookingReference}
                onChange={(e) => setOrderForm({ ...orderForm, bookingReference: e.target.value })}
                placeholder="Enter booking reference (e.g., BK-2024-001234)"
              />
            </FormField>
          )}

          <Card variant="glass" className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Estimated Total</span>
              <span className="text-xl font-bold text-primary">₦{calculateTotal().toLocaleString()}</span>
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

      {/* Laundry Receipt Modal */}
      <FormModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Order Created Successfully"
        description="Laundry order has been recorded"
        onSubmit={() => setSuccessModalOpen(false)}
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
              <div className="text-xs font-semibold text-muted-foreground mt-1">LAUNDRY RECEIPT</div>
            </div>

            <div className="text-sm space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order #:</span>
                <span className="font-medium text-foreground">{receiptData?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{receiptData?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="text-foreground">{receiptData?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="text-foreground">{receiptData?.phone}</span>
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

            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">₦{receiptData?.total.toLocaleString()}</span>
            </div>

            <div className="footer text-center pt-4 mt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Thank you for choosing our laundry service!</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handlePrintReceipt}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </FormModal>
    </div>
  );
}