import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Plus, CreditCard, Banknote, Building, BedDouble, Shirt } from "lucide-react";
import { FormModal, FormField } from "@/components/forms";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getLaundryOrderById,
    updateLaundryOrderStatus,
    addPaymentToOrder,
} from "@/services/laundryService";
import { LaundryOrder, LaundryPayment, CreateLaundryPaymentRequest } from "@/types/api";

const statusColors: Record<string, "info" | "warning" | "success" | "secondary"> = {
    received: "info",
    processing: "warning",
    ready: "success",
    delivered: "secondary",
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
    cash: <Banknote className="w-4 h-4" />,
    card: <CreditCard className="w-4 h-4" />,
    transfer: <Building className="w-4 h-4" />,
    "room-charge": <BedDouble className="w-4 h-4" />,
};

export default function LaundryOrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const orderApi = useApi<LaundryOrder>();
    const mutationApi = useApi<LaundryOrder | LaundryPayment | null>({ showSuccessToast: true });

    const [order, setOrder] = useState<LaundryOrder | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState<CreateLaundryPaymentRequest>({
        amount: 0,
        method: "cash",
        reference: "",
        bookingReference: "",
    });

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        if (!orderId) return;
        const response = await orderApi.execute(() => getLaundryOrderById(orderId));
        if (response.success && response.data) {
            setOrder(response.data);
        }
    };

    const handleStatusUpdate = async (status: LaundryOrder['status']) => {
        if (!orderId) return;
        await mutationApi.execute(() => updateLaundryOrderStatus(orderId, status));
        fetchOrder();
    };

    const handleAddPayment = async () => {
        if (!orderId) return;
        const response = await mutationApi.execute(() => addPaymentToOrder(orderId, {
            ...paymentForm,
            amount: Number(paymentForm.amount),
        }));
        if (response.success) {
            fetchOrder();
            setPaymentModalOpen(false);
            setPaymentForm({ amount: 0, method: "cash", reference: "", bookingReference: "" });
        }
    };

    const openPaymentModal = () => {
        // Pre-fill with balance
        setPaymentForm({
            amount: order?.balance || 0,
            method: order?.bookingReference ? "room-charge" : "cash",
            reference: "",
            bookingReference: order?.bookingReference || "",
        });
        setPaymentModalOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    if (orderApi.isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="Order Details" subtitle="Loading..." />
                <div className="p-6"><LoadingState message="Loading order details..." /></div>
            </div>
        );
    }

    if (orderApi.error || !order) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="Order Details" subtitle="Error" />
                <div className="p-6">
                    <ErrorState message={orderApi.error || "Order not found"} onRetry={fetchOrder} />
                </div>
            </div>
        );
    }

    // Calculate item-level subtotals
    const getItemSubtotal = (item: LaundryOrder['items'][0]) => {
        const servicesTotal = item.services?.reduce((sum, s) => sum + s.unitPrice, 0) || 0;
        return servicesTotal * item.quantity;
    };

    return (
        <div className="min-h-screen bg-background print:bg-white">
            <DashboardHeader
                title={`Order ${order.orderNumber || order.id.slice(0, 8)}`}
                subtitle={`${order.fullName} — ${new Date(order.createdAt).toLocaleDateString()}`}
            />

            <div className="p-6 space-y-6">
                {/* Back + Actions */}
                <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
                    <Button variant="ghost" onClick={() => navigate('/dashboard/laundry/orders')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                    </Button>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        {order.status === 'received' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('processing')}>
                                Mark Processing
                            </Button>
                        )}
                        {order.status === 'processing' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('ready')}>
                                Mark Ready
                            </Button>
                        )}
                        {order.status === 'ready' && (
                            <Button size="sm" onClick={() => handleStatusUpdate('delivered')}>
                                Mark Delivered
                            </Button>
                        )}
                        {order.balance > 0 && (
                            <Button size="sm" onClick={openPaymentModal}>
                                <Plus className="w-4 h-4 mr-2" /> Add Payment
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Header */}
                <Card>
                    <CardContent className="p-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                                <p className="font-semibold">{order.fullName}</p>
                                {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <Badge variant={statusColors[order.status]} className="capitalize">{order.status}</Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Booking Ref</p>
                                <p className="font-medium">{order.bookingReference || "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Date</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        {(order.email || order.address) && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                                {order.email && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                                        <p className="text-sm">{order.email}</p>
                                    </div>
                                )}
                                {order.address && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                                        <p className="text-sm">{order.address}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Items & Services Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shirt className="w-5 h-5" /> Order Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Clothing Type</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.clothingTypeName || "Unknown"}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {item.services?.map(service => (
                                                    <div key={service.id} className="flex items-center justify-between text-sm">
                                                        <span>{service.serviceName}</span>
                                                        <span className="text-muted-foreground ml-4">₦{service.unitPrice.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            ₦{getItemSubtotal(item).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="font-bold text-lg">₦{order.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount Paid</span>
                                    <span className="font-medium text-success">₦{order.paidAmount?.toLocaleString()}</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold">Balance</span>
                                        <span className={`font-bold text-lg ${order.balance > 0 ? "text-destructive" : "text-success"}`}>
                                            ₦{order.balance?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {order.balance > 0 && (
                                    <Button className="w-full mt-3 print:hidden" onClick={openPaymentModal}>
                                        <Plus className="w-4 h-4 mr-2" /> Record Payment
                                    </Button>
                                )}
                                {order.balance <= 0 && (
                                    <Badge variant="success" className="w-full justify-center py-2 text-sm mt-3">
                                        ✓ Fully Paid
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payments Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(!order.payments || order.payments.length === 0) ? (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    No payments recorded yet.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 capitalize">
                                                        {paymentMethodIcons[payment.method] || null}
                                                        {payment.method}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">₦{payment.amount.toLocaleString()}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {payment.reference || payment.bookingReference || "—"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(payment.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Payment Modal */}
            <FormModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                title="Record Payment"
                onSubmit={handleAddPayment}
                submitLabel={`Pay ₦${Number(paymentForm.amount || 0).toLocaleString()}`}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Amount" required>
                        <Input
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                            placeholder="0.00"
                        />
                    </FormField>

                    <FormField label="Payment Method" required>
                        <Select
                            value={paymentForm.method}
                            onValueChange={(v: CreateLaundryPaymentRequest['method']) => setPaymentForm({ ...paymentForm, method: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="transfer">Bank Transfer</SelectItem>
                                <SelectItem value="room-charge">Charge to Room</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    {paymentForm.method === 'room-charge' && (
                        <FormField label="Booking Reference" required>
                            <Input
                                value={paymentForm.bookingReference}
                                onChange={(e) => setPaymentForm({ ...paymentForm, bookingReference: e.target.value })}
                                placeholder="BK-..."
                            />
                        </FormField>
                    )}

                    {paymentForm.method !== 'cash' && paymentForm.method !== 'room-charge' && (
                        <FormField label="Transaction Reference">
                            <Input
                                value={paymentForm.reference}
                                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                placeholder="Optional reference"
                            />
                        </FormField>
                    )}
                </div>
            </FormModal>
        </div>
    );
}
