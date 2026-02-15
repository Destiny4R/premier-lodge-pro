import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Dumbbell, Edit, Trash, MoreVertical } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getGymPlans,
    createGymPlan,
    updateGymPlan,
    deleteGymPlan,
    GymPlan
} from "@/services/gymService";
import { PaginatedResponse } from "@/types/api";

export default function GymPlansPage() {
    const plansApi = useApi<PaginatedResponse<GymPlan>>();
    const mutationApi = useApi<GymPlan | null>({ showSuccessToast: true });

    const [plans, setPlans] = useState<GymPlan[]>([]);
    const [planModalOpen, setPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<GymPlan | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

    const [planForm, setPlanForm] = useState({
        name: "",
        duration: "",
        price: "",
        features: "",
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        const response = await plansApi.execute(() => getGymPlans());
        if (response.success && response.data) {
            setPlans(response.data.items);
        }
    };

    const openPlanModal = (plan?: GymPlan) => {
        if (plan) {
            setEditingPlan(plan);
            setPlanForm({
                name: plan.name,
                duration: plan.duration.toString(),
                price: plan.price.toString(),
                features: plan.features.join(", "),
            });
        } else {
            setEditingPlan(null);
            setPlanForm({ name: "", duration: "", price: "", features: "" });
        }
        setPlanModalOpen(true);
    };

    const handlePlanSubmit = async () => {
        const planData = {
            name: planForm.name,
            duration: parseInt(planForm.duration),
            price: parseFloat(planForm.price),
            features: planForm.features.split(",").map(f => f.trim()),
        };

        if (editingPlan) {
            const response = await mutationApi.execute(() => updateGymPlan(editingPlan.id, planData));
            if (response.success) {
                fetchPlans();
                setPlanModalOpen(false);
            }
        } else {
            const response = await mutationApi.execute(() => createGymPlan(planData));
            if (response.success) {
                fetchPlans();
                setPlanModalOpen(false);
            }
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deleteGymPlan(deleteDialog.id));
        if (response.success) {
            fetchPlans();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Gym Plans" subtitle="Manage membership plans and pricing" />
            <div className="p-6 space-y-6">
                {/* Action Button - always visible */}
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => openPlanModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Plan
                    </Button>
                </div>

                {plansApi.isLoading && <LoadingState message="Loading gym plans..." />}
                {plansApi.error && !plansApi.isLoading && (
                    <ErrorState message={plansApi.error || 'Failed to load plans'} onRetry={fetchPlans} />
                )}

                {!plansApi.isLoading && !plansApi.error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Gym Plans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {plans.length === 0 ? (
                                    <EmptyState
                                        icon={Dumbbell}
                                        title="No gym plans found"
                                        description="Create your first gym plan to start enrolling members"
                                        action={
                                            <Button onClick={() => openPlanModal()}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Plan
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {plans.map((plan) => (
                                            <Card key={plan.id} variant="gold" className="p-6 relative group">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openPlanModal(plan)}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => setDeleteDialog({ open: true, id: plan.id })}
                                                        >
                                                            <Trash className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <div className="text-center mb-4">
                                                    <Badge variant={plan.name === "VIP" ? "default" : "secondary"} className="mb-2">{plan.name}</Badge>
                                                    <p className="text-3xl font-bold text-primary">₦{plan.price?.toLocaleString()}</p>
                                                    <p className="text-sm text-muted-foreground">{plan.duration} {plan.duration === 1 ? 'day' : 'days'}</p>
                                                </div>
                                                <ul className="space-y-2">
                                                    {plan.features.map((feature, i) => (
                                                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Gym Plan Modal */}
            <FormModal
                open={planModalOpen}
                onOpenChange={setPlanModalOpen}
                title={editingPlan ? "Edit Gym Plan" : "Create Gym Plan"}
                description="Configure membership plan details"
                onSubmit={handlePlanSubmit}
                submitLabel={editingPlan ? "Update Plan" : "Create Plan"}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Plan Name" required>
                        <Input
                            value={planForm.name}
                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                            placeholder="e.g., Premium, VIP"
                        />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Duration" required>
                            <Select value={planForm.duration} onValueChange={(v) => setPlanForm({ ...planForm, duration: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">1 Week</SelectItem>
                                    <SelectItem value="30">1 Month</SelectItem>
                                    <SelectItem value="90">3 Months</SelectItem>
                                    <SelectItem value="180">6 Months</SelectItem>
                                    <SelectItem value="365">1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Price" required>
                            <Input
                                type="number"
                                value={planForm.price}
                                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                                placeholder="0.00"
                            />
                        </FormField>
                    </div>
                    <FormField label="Features" hint="Comma-separated list">
                        <Input
                            value={planForm.features}
                            onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                            placeholder="Gym access, Personal trainer, Group classes"
                        />
                    </FormField>
                </div>
            </FormModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Delete Gym Plan"
                description="Are you sure you want to delete this gym plan? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
