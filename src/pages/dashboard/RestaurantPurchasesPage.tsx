import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LoadingState, EmptyState } from "@/components/ui/loading-state";
import { ViewModal, DetailRow } from "@/components/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useApi } from "@/hooks/useApi";
import { getRestaurantOrders, getRestaurantOrderById } from "@/services/restaurantService";
import { RestaurantOrder, PaginatedResponse } from "@/types/api";

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  preparing: { bg: "bg-blue-100", text: "text-blue-800", label: "Preparing" },
  ready: { bg: "bg-purple-100", text: "text-purple-800", label: "Ready" },
  delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
};

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  cash: { bg: "bg-green-50", text: "text-green-700" },
  card: { bg: "bg-blue-50", text: "text-blue-700" },
  "room-charge": { bg: "bg-purple-50", text: "text-purple-700" },
};

/**
 * Page: Restaurant Purchases
 * Endpoint: GET /api/restaurant/orders
 * Query params: page, pageSize, search, status, dateFilter (e.g., 'today')
 * Response: { success: boolean, data: PaginatedResponse<RestaurantOrder>, message: string }
 */
export default function RestaurantPurchasesPage() {
  const ordersApi = useApi<PaginatedResponse<RestaurantOrder>>();

  // State
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isToday, setIsToday] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [isToday, currentPage, pageSize, statusFilter, paymentFilter]);

  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchOrders = async () => {
    const params: any = {
      page: currentPage,
      pageSize,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      paymentMethod: paymentFilter !== "all" ? paymentFilter : undefined,
      dateFilter: isToday ? "today" : undefined,
    };

    try {
      const response = await ordersApi.execute(() =>
        getRestaurantOrders(params)
      );
      console.log("Fetched orders:", response.data.items);
      if (response.success && response.data) {
        setOrders(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      }
    } catch (error) {
      // Silently fail - show empty state instead of error
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  };

  const viewOrder = async (orderId: string) => {
    setViewLoading(true);
    setViewOrderOpen(true);
    try {
      const res = await getRestaurantOrderById(orderId);
      if (res.success && res.data) setSelectedOrder(res.data);
    } finally {
      setViewLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  // Calculate totals
  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return orders
      .filter((order) => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getVisibleTotal = () => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getDeliveredTotal = () => {
    return orders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG");
  };

  const exportToCSV = () => {
    const csv = [
      ["Order ID", "Order #", "Customer", "Total", "Status", "Payment", "Date"],
      ...orders.map((order) => [
        order.id,
        order.orderNumber,
        order.customerName,
        order.totalAmount,
        order.status,
        order.paymentMethod,
        formatDate(order.createdAt),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurant_orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Orders exported successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Restaurant Purchases" subtitle="View and manage all restaurant orders" />

      <div className="p-6 space-y-6 md:space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow bg-green-50 dark:bg-green-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                  Delivered Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(getDeliveredTotal())}
                </div>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  {orders.filter((o) => o.status === "delivered").length} orders
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow bg-blue-50 dark:bg-blue-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {isToday ? "Today's" : "Visible"} Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(isToday ? getTodayTotal() : getVisibleTotal())}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  {isToday ? "Today" : "Current view"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Date Toggle & Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Date Filter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isToday ? "default" : "outline"}
                    onClick={() => {
                      setIsToday(true);
                      setCurrentPage(1);
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    variant={!isToday ? "default" : "outline"}
                    onClick={() => {
                      setIsToday(false);
                      setCurrentPage(1);
                    }}
                  >
                    All Dates
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order #, customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full md:w-[150px] bg-secondary border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={(value) => {
                  setPaymentFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full md:w-[150px] bg-secondary border-border">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="room-charge">Room Charge</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleSearch} variant="outline" className="w-full md:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Search
                </Button>

                <Button onClick={exportToCSV} variant="outline" className="w-full md:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>
              Orders ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersApi.isLoading ? (
              <LoadingState message="Loading orders..." />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No Orders Found"
                description={
                  ordersApi.error
                    ? "The restaurant orders endpoint is not currently available"
                    : searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No orders yet"
                }
              />
            ) : (
              <ScrollArea className="max-h-[480px] pr-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Order #
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Payment
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Date/Time
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => {
                      const statusColor = STATUS_COLORS[order.status];
                      const paymentColor = PAYMENT_COLORS[order.paymentMethod];
                      console.log("Rendering order:", order);
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              {order.roomId && (
                                <p className="text-xs text-muted-foreground">Room: {order.roomId}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${statusColor?.bg} ${statusColor?.text} border-0`}>
                              {statusColor?.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={`${paymentColor?.bg} ${paymentColor?.text} border-0`}
                            >
                              {order.paymentMethod === "room-charge"
                                ? "Room Charge"
                                : order.paymentMethod
                                    ? order.paymentMethod.charAt(0).toUpperCase() +
                                      order.paymentMethod.slice(1)
                                    : "Unknown"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            <div className="text-xs">
                              <p>{new Date(order.createdAt).toLocaleDateString("en-NG")}</p>
                              <p>{new Date(order.createdAt).toLocaleTimeString("en-NG")}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => viewOrder(order.id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </ScrollArea>
            )}

              {/* View Modal */}
              <ViewModal
                open={viewOrderOpen}
                onOpenChange={(open) => {
                  setViewOrderOpen(open);
                  if (!open) setSelectedOrder(null);
                }}
                title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Order Details"}
              >
                {viewLoading ? (
                  <div className="py-6 text-center">Loading...</div>
                ) : selectedOrder ? (
                  <div className="space-y-4">
                    <DetailRow label="Customer" value={selectedOrder.customerName} />
                    <DetailRow label="Order #" value={selectedOrder.orderNumber} />
                    <DetailRow label="Status" value={selectedOrder.status} />
                    <DetailRow label="Payment" value={selectedOrder.paymentMethod} />
                    <DetailRow label="Date" value={new Date(selectedOrder.createdAt).toLocaleString()} />

                    <div className="pt-2">
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((it) => (
                          <div key={it.menuItemId} className="flex justify-between text-sm">
                            <div className="min-w-0 truncate">{it.name} <span className="text-muted-foreground text-xs">x{it.quantity}</span></div>
                            <div className="font-medium">₦{(it.price * it.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">No details available</div>
                )}
              </ViewModal>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalItems)} of {totalItems} orders
                </div>

                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      if (totalPages > 5 && i === 4) {
                        return (
                          <PaginationItem key="ellipsis">
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
