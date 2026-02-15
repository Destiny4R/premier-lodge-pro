import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Shirt, Clock, CheckCircle, Package, UserPlus, MoreVertical, Trash, BedDouble, Eye } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getLaundryOrders,
    getLaundryCategories,
    getLaundryServiceTypes,
    getLaundryPrices,
    createLaundryGuestOrder,
    createLaundryVisitorOrder,
    updateLaundryOrderStatus,
    deleteLaundryOrder,
} from "@/services/laundryService";
import { LaundryOrder, LaundryCategory, LaundryServiceType, LaundryServicePrice, PaginatedResponse, CreateLaundryOrderItemRequest } from "@/types/api";

const statusColors: Record<string, "info" | "warning" | "success" | "secondary"> = {
    received: "info",
    processing: "warning",
    ready: "success",
    delivered: "secondary",
};

// ── Types for the multi-layer order form ──

interface OrderItemForm {
    clothingTypeId: string;
    quantity: string;
    selectedServiceIds: string[];
}

const emptyItem = (): OrderItemForm => ({
    clothingTypeId: "",
    quantity: "1",
    selectedServiceIds: [],
});

export default function LaundryOrdersPage() {
    const navigate = useNavigate();
    const ordersApi = useApi<PaginatedResponse<LaundryOrder>>();
    const categoriesApi = useApi<PaginatedResponse<LaundryCategory>>();
    const servicesApi = useApi<PaginatedResponse<LaundryServiceType>>();
    const pricesApi = useApi<PaginatedResponse<LaundryServicePrice>>();
    const mutationApi = useApi<LaundryOrder | null>({ showSuccessToast: true });

    const [orders, setOrders] = useState<LaundryOrder[]>([]);
    const [categories, setCategories] = useState<LaundryCategory[]>([]);
    const [serviceTypes, setServiceTypes] = useState<LaundryServiceType[]>([]);
    const [prices, setPrices] = useState<LaundryServicePrice[]>([]);

    const [guestModalOpen, setGuestModalOpen] = useState(false);
    const [visitorModalOpen, setVisitorModalOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");

    // Guest form
    const [guestForm, setGuestForm] = useState({
        bookingReference: "",
        items: [emptyItem()],
    });

    // Visitor form
    const [visitorForm, setVisitorForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        items: [emptyItem()],
    });

    useEffect(() => {
        fetchOrders();
        fetchMasterData();
    }, []);

    const fetchOrders = async () => {
        const response = await ordersApi.execute(() => getLaundryOrders());
        if (response.success && response.data) {
            setOrders(response.data.items);
        }
    };

    const fetchMasterData = async () => {
        const [catsRes, servsRes, pricesRes] = await Promise.all([
            categoriesApi.execute(() => getLaundryCategories({ limit: 100 })),
            servicesApi.execute(() => getLaundryServiceTypes({ limit: 100 })),
            pricesApi.execute(() => getLaundryPrices({ limit: 200 })),
        ]);
        if (catsRes.success && catsRes.data) setCategories(catsRes.data.items);
        if (servsRes.success && servsRes.data) setServiceTypes(servsRes.data.items);
        if (pricesRes.success && pricesRes.data) setPrices(pricesRes.data.items);
    };

    // ── Helpers ──

    // Get services that have a price configured for a specific clothing type
    const getAvailableServices = (clothingTypeId: string) => {
        const availablePrices = prices.filter(p => p.categoryId === clothingTypeId);
        return serviceTypes.filter(s => availablePrices.some(p => p.serviceId === s.id));
    };

    // Get price for a clothing type + service type combo
    const getPrice = (clothingTypeId: string, serviceTypeId: string): number => {
        const priceEntry = prices.find(p => p.categoryId === clothingTypeId && p.serviceId === serviceTypeId);
        return priceEntry?.price || 0;
    };

    // Calculate total for a set of order items
    const calculateTotal = (items: OrderItemForm[]): number => {
        return items.reduce((sum, item) => {
            const qty = parseInt(item.quantity) || 0;
            const servicesTotal = item.selectedServiceIds.reduce((sSum, sId) => {
                return sSum + getPrice(item.clothingTypeId, sId);
            }, 0);
            return sum + (servicesTotal * qty);
        }, 0);
    };

    // ── Item management ──

    const addItem = (type: "guest" | "visitor") => {
        if (type === "guest") {
            setGuestForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
        } else {
            setVisitorForm(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
        }
    };

    const removeItem = (type: "guest" | "visitor", index: number) => {
        if (type === "guest") {
            setGuestForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        } else {
            setVisitorForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        }
    };

    const updateItemField = (type: "guest" | "visitor", index: number, field: keyof OrderItemForm, value: string | string[]) => {
        const setter = type === "guest" ? setGuestForm : setVisitorForm;
        setter((prev: any) => {
            const newItems = [...prev.items];
            if (field === "clothingTypeId") {
                // Reset services when clothing type changes
                newItems[index] = { ...newItems[index], clothingTypeId: value as string, selectedServiceIds: [] };
            } else {
                newItems[index] = { ...newItems[index], [field]: value };
            }
            return { ...prev, items: newItems };
        });
    };

    const toggleService = (type: "guest" | "visitor", itemIndex: number, serviceId: string) => {
        const items = type === "guest" ? guestForm.items : visitorForm.items;
        const currentServices = items[itemIndex].selectedServiceIds;
        const newServices = currentServices.includes(serviceId)
            ? currentServices.filter(id => id !== serviceId)
            : [...currentServices, serviceId];
        updateItemField(type, itemIndex, "selectedServiceIds", newServices);
    };

    // ── Build payload from form items ──

    const buildPayloadItems = (items: OrderItemForm[]): CreateLaundryOrderItemRequest[] => {
        return items
            .filter(i => i.clothingTypeId && i.selectedServiceIds.length > 0)
            .map(i => ({
                clothingTypeId: i.clothingTypeId,
                quantity: parseInt(i.quantity) || 1,
                serviceTypeIds: i.selectedServiceIds,
            }));
    };

    // ── Submissions ──

    const handleGuestSubmit = async () => {
        const items = buildPayloadItems(guestForm.items);
        if (items.length === 0) return;

        const response = await mutationApi.execute(() => createLaundryGuestOrder({
            bookingReference: guestForm.bookingReference,
            items,
        }));

        if (response.success) {
            fetchOrders();
            setGuestModalOpen(false);
            setGuestForm({ bookingReference: "", items: [emptyItem()] });
        }
    };

    const handleVisitorSubmit = async () => {
        const items = buildPayloadItems(visitorForm.items);
        if (items.length === 0) return;

        const response = await mutationApi.execute(() => createLaundryVisitorOrder({
            fullName: visitorForm.fullName,
            phone: visitorForm.phone,
            email: visitorForm.email,
            address: visitorForm.address,
            items,
        }));

        if (response.success) {
            fetchOrders();
            setVisitorModalOpen(false);
            setVisitorForm({ fullName: "", phone: "", email: "", address: "", items: [emptyItem()] });
        }
    };

    const handleStatusUpdate = async (id: string, status: LaundryOrder['status']) => {
        await mutationApi.execute(() => updateLaundryOrderStatus(id, status));
        fetchOrders();
    };

    const handleDelete = async () => {
        await mutationApi.execute(() => deleteLaundryOrder(deleteDialog.id));
        fetchOrders();
        setDeleteDialog({ open: false, id: "" });
    };

    // ── Render an item row in the order form ──

    const renderItemRow = (type: "guest" | "visitor", item: OrderItemForm, index: number) => {
        const availableServices = item.clothingTypeId ? getAvailableServices(item.clothingTypeId) : [];
        const items = type === "guest" ? guestForm.items : visitorForm.items;

        return (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Item {index + 1}</span>
                    {items.length > 1 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-7 w-7"
                            onClick={() => removeItem(type, index)}
                        >
                            <Trash className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="text-sm font-medium mb-1 block">Clothing Type</label>
                        <Select
                            value={item.clothingTypeId}
                            onValueChange={(v) => updateItemField(type, index, "clothingTypeId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select clothing" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Qty</label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateItemField(type, index, "quantity", e.target.value)}
                        />
                    </div>
                </div>

                {item.clothingTypeId && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">Services</label>
                        {availableServices.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No prices configured for this clothing type yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableServices.map(service => {
                                    const price = getPrice(item.clothingTypeId, service.id);
                                    const isSelected = item.selectedServiceIds.includes(service.id);
                                    return (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => toggleService(type, index, service.id)}
                                            className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                                                ${isSelected
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                                                }
                                            `}
                                        >
                                            <span>{service.name}</span>
                                            <span className="opacity-75">₦{price.toLocaleString()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {item.selectedServiceIds.length > 0 && (
                    <div className="text-xs text-right text-muted-foreground border-t border-border pt-2">
                        Item subtotal: <span className="font-bold text-foreground">
                            ₦{(item.selectedServiceIds.reduce((s, sId) => s + getPrice(item.clothingTypeId, sId), 0) * (parseInt(item.quantity) || 0)).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // ── Filtering ──

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return o.status === 'received' || o.status === 'processing';
        if (activeTab === 'ready') return o.status === 'ready';
        if (activeTab === 'completed') return o.status === 'delivered';
        return true;
    }).filter(o =>
        o.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.bookingReference?.toLowerCase().includes(search.toLowerCase())
    );

    // Payment status helper
    const getPaymentBadge = (order: LaundryOrder) => {
        if (order.paidAmount >= order.totalAmount) return <Badge variant="success">Paid</Badge>;
        if (order.paidAmount > 0) return <Badge variant="warning">Partial</Badge>;
        return <Badge variant="secondary">Unpaid</Badge>;
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Laundry Orders" subtitle="Track and manage laundry orders" />

            <div className="p-6 space-y-6">
                {/* Stats Bar */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-warning" />
                                <span className="font-semibold text-sm">{orders.filter(o => o.status === 'received').length} Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-info" />
                                <span className="font-semibold text-sm">{orders.filter(o => o.status === 'processing').length} Processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success" />
                                <span className="font-semibold text-sm">{orders.filter(o => o.status === 'ready').length} Ready</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setGuestModalOpen(true)}>
                                <BedDouble className="w-4 h-4 mr-2" /> Charge to Room
                            </Button>
                            <Button onClick={() => setVisitorModalOpen(true)}>
                                <UserPlus className="w-4 h-4 mr-2" /> Visitor Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
                        {['all', 'pending', 'ready', 'completed'].map(tab => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setActiveTab(tab)}
                                className="capitalize"
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Orders List */}
                {ordersApi.isLoading ? (
                    <LoadingState message="Loading orders..." />
                ) : filteredOrders.length === 0 ? (
                    <EmptyState
                        icon={Shirt}
                        title="No orders found"
                        description="Create a new order to get started."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredOrders.map(order => (
                            <Card key={order.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/laundry/orders/${order.id}`)}>
                                <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${statusColors[order.status]}/10 text-${statusColors[order.status]}`}>
                                            <Shirt className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold">{order.fullName}</h3>
                                                {order.orderNumber && <Badge variant="outline" className="font-mono text-xs">{order.orderNumber}</Badge>}
                                                {order.bookingReference && <Badge variant="outline">{order.bookingReference}</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items?.length || 0} item(s) • ₦{order.totalAmount?.toLocaleString()}
                                            </p>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {order.items?.map((item) => (
                                                    <span key={item.id} className="mr-2 inline-block">
                                                        {item.quantity}x {item.clothingTypeName}
                                                        {item.services?.length > 0 && ` (${item.services.map(s => s.serviceName).join(', ')})`}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                                                {getPaymentBadge(order)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/laundry/orders/${order.id}`); }}>
                                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'processing'); }}>Mark Processing</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'ready'); }}>Mark Ready</DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'delivered'); }}>Mark Delivered</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: order.id }); }}>
                                                    Delete Order
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Guest Order Modal ── */}
            <FormModal
                open={guestModalOpen}
                onOpenChange={setGuestModalOpen}
                title="New Guest Order — Charge to Room"
                onSubmit={handleGuestSubmit}
                submitLabel={`Create Order (₦${calculateTotal(guestForm.items).toLocaleString()})`}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    <FormField label="Booking Reference" required>
                        <Input
                            value={guestForm.bookingReference}
                            onChange={(e) => setGuestForm({ ...guestForm, bookingReference: e.target.value })}
                            placeholder="BK-..."
                        />
                    </FormField>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold">Order Items</label>
                        {guestForm.items.map((item, i) => renderItemRow('guest', item, i))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addItem('guest')} className="mt-2 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add Item
                        </Button>
                    </div>
                </div>
            </FormModal>

            {/* ── Visitor Order Modal ── */}
            <FormModal
                open={visitorModalOpen}
                onOpenChange={setVisitorModalOpen}
                title="New Visitor Order"
                onSubmit={handleVisitorSubmit}
                submitLabel={`Create Order (₦${calculateTotal(visitorForm.items).toLocaleString()})`}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Full Name" required>
                            <Input
                                value={visitorForm.fullName}
                                onChange={(e) => setVisitorForm({ ...visitorForm, fullName: e.target.value })}
                                placeholder="Customer name"
                            />
                        </FormField>
                        <FormField label="Phone" required>
                            <Input
                                value={visitorForm.phone}
                                onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                                placeholder="08012345678"
                            />
                        </FormField>
                    </div>
                    <FormField label="Address">
                        <Input
                            value={visitorForm.address}
                            onChange={(e) => setVisitorForm({ ...visitorForm, address: e.target.value })}
                            placeholder="Customer address"
                        />
                    </FormField>
                    <FormField label="Email">
                        <Input
                            value={visitorForm.email}
                            onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </FormField>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold">Order Items</label>
                        {visitorForm.items.map((item, i) => renderItemRow('visitor', item, i))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addItem('visitor')} className="mt-2 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add Item
                        </Button>
                    </div>
                </div>
            </FormModal>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Delete Order"
                description="Are you sure you want to delete this order? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
