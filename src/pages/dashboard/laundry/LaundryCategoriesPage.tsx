import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreVertical, Edit, Trash, Package } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getLaundryCategories,
    createLaundryCategory,
    updateLaundryCategory,
    deleteLaundryCategory
} from "@/services/laundryService";
import { LaundryCategory, PaginatedResponse } from "@/types/api";

export default function LaundryCategoriesPage() {
    const api = useApi<PaginatedResponse<LaundryCategory>>();
    const mutationApi = useApi<LaundryCategory | null>({ showSuccessToast: true });

    const [categories, setCategories] = useState<LaundryCategory[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LaundryCategory | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

    const [form, setForm] = useState({ name: "", description: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await api.execute(() => getLaundryCategories());
        if (response.success && response.data) {
            setCategories(response.data.items);
        }
    };

    const openModal = (item?: LaundryCategory) => {
        if (item) {
            setEditingItem(item);
            setForm({ name: item.name, description: item.description || "" });
        } else {
            setEditingItem(null);
            setForm({ name: "", description: "" });
        }
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (editingItem) {
            const response = await mutationApi.execute(() => updateLaundryCategory(editingItem.id, form));
            if (response.success) {
                fetchData();
                setModalOpen(false);
            }
        } else {
            const response = await mutationApi.execute(() => createLaundryCategory(form));
            if (response.success) {
                fetchData();
                setModalOpen(false);
            }
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deleteLaundryCategory(deleteDialog.id));
        if (response.success) {
            fetchData();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Laundry Categories" subtitle="Manage clothing types (e.g., Shirts, Suits)" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search categories..." className="pl-10" />
                    </div>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" /> Add Category
                    </Button>
                </div>

                {api.isLoading && <LoadingState message="Loading categories..." />}

                {api.error && (
                    <ErrorState message={api.error} onRetry={fetchData} />
                )}

                {!api.isLoading && !api.error && (
                    <Card>
                        <CardContent className="p-0">
                            {categories.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="No categories found"
                                    description="Create your first clothing category to get started."
                                    action={<Button onClick={() => openModal()}>Add Category</Button>}
                                />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{item.description || "—"}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </TableCell>
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
                title={editingItem ? "Edit Category" : "New Category"}
                onSubmit={handleSubmit}
                submitLabel={editingItem ? "Save Changes" : "Create Category"}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Category Name" required>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Shirts"
                        />
                    </FormField>
                    <FormField label="Description">
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description..."
                        />
                    </FormField>
                </div>
            </FormModal>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Delete Category"
                description="Are you sure you want to delete this category?"
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
