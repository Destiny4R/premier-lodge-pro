import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, Column } from "@/components/ui/data-table";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Plus, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Building2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import {
    getEventHalls,
    createEventHall,
    updateEventHall,
    deleteEventHall,
    toggleEventHallAvailability,
} from "@/services/eventService";
import { EventHall, PaginatedResponse } from "@/types/api";

export default function EventHallsPage() {
    const hallsApi = useApi<PaginatedResponse<EventHall>>();
    const mutationApi = useApi<EventHall | null>({ showSuccessToast: true });

    const [halls, setHalls] = useState<EventHall[]>([]);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState<EventHall | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        hourlyRate: "",
        dailyRate: "",
        amenities: "",
    });

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        const response = await hallsApi.execute(() => getEventHalls());
        if (response.success && response.data) {
            setHalls(response.data.items);
        }
    };

    const handleAdd = () => {
        setFormData({ name: "", capacity: "", hourlyRate: "", dailyRate: "", amenities: "" });
        setSelectedHall(null);
        setIsEditing(false);
        setFormModalOpen(true);
    };

    const handleEdit = (hall: EventHall) => {
        setFormData({
            name: hall.name,
            capacity: hall.capacity.toString(),
            hourlyRate: hall.hourlyRate.toString(),
            dailyRate: hall.dailyRate.toString(),
            amenities: Array.isArray(hall.amenities) ? hall.amenities.join(", ") : "",
        });
        setSelectedHall(hall);
        setIsEditing(true);
        setFormModalOpen(true);
    };

    const handleView = (hall: EventHall) => {
        setSelectedHall(hall);
        setViewModalOpen(true);
    };

    const handleDeleteClick = (hall: EventHall) => {
        setSelectedHall(hall);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const hallData = {
                name: formData.name,
                capacity: parseInt(formData.capacity) || 0,
                hourlyRate: parseFloat(formData.hourlyRate) || 0,
                dailyRate: parseFloat(formData.dailyRate) || 0,
                amenities: formData.amenities
                    .split(",")
                    .map(a => a.trim())
                    .filter(a => a.length > 0),
            };

            let response;
            if (isEditing && selectedHall) {
                response = await mutationApi.execute(() => updateEventHall(selectedHall.id, hallData));
            } else {
                response = await mutationApi.execute(() => createEventHall(hallData));
            }

            if (response.success) {
                fetchHalls();
                setFormModalOpen(false);
            } else {
                console.error("Error:", response.message);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };

    const handleDelete = async () => {
        if (!selectedHall) return;
        const response = await mutationApi.execute(() => deleteEventHall(selectedHall.id));
        if (response.success) {
            fetchHalls();
        }
        setDeleteDialogOpen(false);
    };

    const handleToggleAvailability = async (hall: EventHall) => {
        const response = await mutationApi.execute(() =>
            toggleEventHallAvailability(hall.id, !hall.isAvailable)
        );
        if (response.success) {
            fetchHalls();
        }
    };

    const columns: Column<EventHall>[] = [
        {
            key: "name",
            header: "Hall Name",
            sortable: true,
            render: (_, hall) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{hall.name}</span>
                </div>
            ),
        },
        {
            key: "capacity",
            header: "Capacity",
            sortable: true,
            render: (_, hall) => (
                <span className="text-foreground">{hall.capacity} guests</span>
            ),
        },
        {
            key: "hourlyRate",
            header: "Hourly Rate",
            sortable: true,
            render: (_, hall) => (
                <span className="text-primary font-semibold">₦{hall.hourlyRate?.toLocaleString()}</span>
            ),
        },
        {
            key: "dailyRate",
            header: "Daily Rate",
            sortable: true,
            render: (_, hall) => (
                <span className="text-primary font-semibold">₦{hall.dailyRate?.toLocaleString()}</span>
            ),
        },
        {
            key: "amenities",
            header: "Amenities",
            render: (_, hall) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {(Array.isArray(hall.amenities) ? hall.amenities : []).slice(0, 3).map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                    ))}
                    {Array.isArray(hall.amenities) && hall.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{hall.amenities.length - 3}</Badge>
                    )}
                </div>
            ),
        },
        {
            key: "isAvailable",
            header: "Status",
            render: (_, hall) => (
                <Badge variant={hall.isAvailable ? "success" : "destructive"}>
                    {hall.isAvailable ? "Available" : "Unavailable"}
                </Badge>
            ),
        },
    ];

    const renderActions = (hall: EventHall) => (
        <>
            <Button variant="ghost" size="icon" onClick={() => handleView(hall)} title="View">
                <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(hall)} title="Edit">
                <Pencil className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleAvailability(hall)}
                title={hall.isAvailable ? "Mark Unavailable" : "Mark Available"}
            >
                {hall.isAvailable ? (
                    <ToggleRight className="w-4 h-4 text-green-500" />
                ) : (
                    <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                )}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteClick(hall)}
                title="Delete"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </>
    );

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                title="Event Halls / Centers"
                subtitle="Manage event spaces, pricing, and availability"
            />

            <div className="p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleAdd}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Hall / Center
                                </Button>
                            </div>
                            <DataTable
                                data={halls}
                                columns={columns}
                                searchPlaceholder="Search event halls..."
                                loading={hallsApi.isLoading}
                                actions={renderActions}
                            />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Add/Edit Modal */}
            <FormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                title={isEditing ? "Edit Event Hall" : "Add Event Hall"}
                description="Configure event space details and pricing"
                onSubmit={handleSubmit}
                submitLabel={isEditing ? "Update Hall" : "Add Hall"}
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Hall Name" required>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Grand Ballroom"
                        />
                    </FormField>
                    <FormField label="Capacity" required>
                        <Input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            placeholder="Maximum guests"
                        />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Hourly Rate" required>
                            <Input
                                type="number"
                                value={formData.hourlyRate}
                                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                placeholder="0.00"
                            />
                        </FormField>
                        <FormField label="Daily Rate" required>
                            <Input
                                type="number"
                                value={formData.dailyRate}
                                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                                placeholder="0.00"
                            />
                        </FormField>
                    </div>
                    <FormField label="Amenities">
                        <Textarea
                            value={formData.amenities}
                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            placeholder="e.g., Projector, Sound System, Air Conditioning, WiFi"
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Separate amenities with commas</p>
                    </FormField>
                </div>
            </FormModal>

            {/* View Modal */}
            <ViewModal
                open={viewModalOpen}
                onOpenChange={setViewModalOpen}
                title="Event Hall Details"
            >
                {selectedHall && (
                    <div className="space-y-4">
                        <DetailRow label="Hall Name" value={selectedHall.name} />
                        <DetailRow label="Capacity" value={`${selectedHall.capacity} guests`} />
                        <DetailRow label="Hourly Rate" value={<span className="text-primary font-bold">₦{selectedHall.hourlyRate?.toLocaleString()}</span>} />
                        <DetailRow label="Daily Rate" value={<span className="text-primary font-bold">₦{selectedHall.dailyRate?.toLocaleString()}</span>} />
                        <DetailRow
                            label="Amenities"
                            value={
                                <div className="flex flex-wrap gap-1">
                                    {(Array.isArray(selectedHall.amenities) ? selectedHall.amenities : []).map((a, i) => (
                                        <Badge key={i} variant="secondary">{a}</Badge>
                                    ))}
                                    {(!selectedHall.amenities || selectedHall.amenities.length === 0) && (
                                        <span className="text-muted-foreground">None</span>
                                    )}
                                </div>
                            }
                        />
                        <DetailRow
                            label="Status"
                            value={
                                <Badge variant={selectedHall.isAvailable ? "success" : "destructive"}>
                                    {selectedHall.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                            }
                        />
                    </div>
                )}
            </ViewModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Event Hall"
                description={`Are you sure you want to delete "${selectedHall?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
