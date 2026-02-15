import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Edit, Trash, DollarSign } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getLaundryCategories,
    getLaundryServiceTypes,
    getLaundryPrices,
    createLaundryPrice,
    updateLaundryPrice,
    deleteLaundryPrice
} from "@/services/laundryService";
import { LaundryCategory, LaundryServiceType, LaundryServicePrice, PaginatedResponse } from "@/types/api";

export default function LaundryPricingPage() {
    const pricesApi = useApi<PaginatedResponse<LaundryServicePrice>>();
    const categoriesApi = useApi<PaginatedResponse<LaundryCategory>>();
    const servicesApi = useApi<PaginatedResponse<LaundryServiceType>>();
    const mutationApi = useApi<LaundryServicePrice | null>({ showSuccessToast: true });

    const [prices, setPrices] = useState<LaundryServicePrice[]>([]);
    const [categories, setCategories] = useState<LaundryCategory[]>([]);
    const [services, setServices] = useState<LaundryServiceType[]>([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LaundryServicePrice | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

    const [form, setForm] = useState({ categoryId: "", serviceId: "", price: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Parallel fetch
        const [pricesRes, catsRes, servsRes] = await Promise.all([
            pricesApi.execute(() => getLaundryPrices()),
            categoriesApi.execute(() => getLaundryCategories()),
            servicesApi.execute(() => getLaundryServiceTypes())
        ]);

        if (pricesRes.success && pricesRes.data) setPrices(pricesRes.data.items);
        if (catsRes.success && catsRes.data) setCategories(catsRes.data.items);
        if (servsRes.success && servsRes.data) setServices(servsRes.data.items);
    };

    const openModal = (item?: LaundryServicePrice) => {
        if (item) {
            setEditingItem(item);
            setForm({
                categoryId: item.categoryId,
                serviceId: item.serviceId,
                price: item.price.toString()
            });
        } else {
            setEditingItem(null);
            setForm({ categoryId: "", serviceId: "", price: "" });
        }
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        const priceData = {
            ...form,
            price: parseFloat(form.price)
        };

        if (editingItem) {
            const response = await mutationApi.execute(() => updateLaundryPrice(editingItem.id, priceData));
            if (response.success) {
                fetchData();
                setModalOpen(false);
            }
        } else {
            const response = await mutationApi.execute(() => createLaundryPrice(priceData));
            if (response.success) {
                fetchData();
                setModalOpen(false);
            }
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deleteLaundryPrice(deleteDialog.id));
        if (response.success) {
            fetchData();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    const isLoading = pricesApi.isLoading || categoriesApi.isLoading || servicesApi.isLoading;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Laundry Pricing" subtitle="Configure prices for service & category combinations" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search pricing..." className="pl-10" />
                    </div>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Set Price
                    </Button>
                </div>

                {isLoading && <LoadingState message="Loading pricing data..." />}

                {!isLoading && (
                    <Card>
                        <CardContent className="p-0">
                            {prices.length === 0 ? (
                                <EmptyState
                                    icon={DollarSign}
                                    title="No pricing configured"
                                    description="Set prices for clothing categories and services."
                                    action={<Button onClick={() => openModal()}>Set Price</Button>}
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prices.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.categoryName || "Unknown Category"}</TableCell>
                                                <TableCell>{item.serviceName || "Unknown Service"}</TableCell>
                                                <TableCell className="font-bold text-primary">₦{item.price.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openModal(item)}>
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editingItem ? "Edit Price" : "Set Price"}
                onSubmit={handleSubmit}
                submitLabel={editingItem ? "Update Price" : "Set Price"}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Clothing Category" required>
                        <Select
                            value={form.categoryId}
                            onValueChange={(v) => setForm({ ...form, categoryId: v })}
                            disabled={!!editingItem} // Disable changing keys on edit if preferred, or allow it
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Service Type" required>
                        <Select
                            value={form.serviceId}
                            onValueChange={(v) => setForm({ ...form, serviceId: v })}
                            disabled={!!editingItem}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Price" required>
                        <Input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            placeholder="0.00"
                        />
                    </FormField>
                </div>
            </FormModal>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Delete Price"
                description="Are you sure you want to delete this pricing configuration?"
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
