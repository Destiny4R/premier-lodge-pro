import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Waves, Users, DollarSign, Clock, Trash, Eye, Calendar, UserPlus } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getPoolMembers,
    getPoolPlans,
    createPoolAccess,
    createPoolGuestAccess,
    deletePoolAccess,
    renewPoolAccess,
    PoolPlan,
    PoolMember
} from "@/services/poolService";
import { PaginatedResponse } from "@/types/api";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";

export default function PoolAccessPage() {
    const navigate = useNavigate();
    const membersApi = useApi<PaginatedResponse<PoolMember>>();
    const plansApi = useApi<PaginatedResponse<PoolPlan>>();
    const mutationApi = useApi<PoolMember | null>({ showSuccessToast: true });

    const [members, setMembers] = useState<PoolMember[]>([]);
    const [plans, setPlans] = useState<PoolPlan[]>([]);

    // Modal states
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [guestModalOpen, setGuestModalOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

    // Member registration form
    const [memberForm, setMemberForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyPhone: "",
        emergencyAddress: "",
        planId: "",
        startDate: "",
    });

    // Guest registration form
    const [guestForm, setGuestForm] = useState({
        bookingReference: "",
        planId: "",
        startDate: "",
    });

    // Flatpickr refs
    const memberStartDateRef = useRef<HTMLInputElement>(null);
    const memberStartPickerRef = useRef<flatpickr.Instance | null>(null);
    const guestStartDateRef = useRef<HTMLInputElement>(null);
    const guestStartPickerRef = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    // Flatpickr for member modal
    useEffect(() => {
        if (memberModalOpen) {
            requestAnimationFrame(() => {
                if (memberStartDateRef.current) {
                    memberStartPickerRef.current = flatpickr(memberStartDateRef.current, {
                        dateFormat: "Y-m-d",
                        minDate: "today",
                        allowInput: false,
                        static: true,
                        clickOpens: true,
                        onChange: (_selectedDates, dateStr) => {
                            setMemberForm(prev => ({ ...prev, startDate: dateStr }));
                        },
                    });
                }
            });
        }
        return () => {
            memberStartPickerRef.current?.destroy();
            memberStartPickerRef.current = null;
        };
    }, [memberModalOpen]);

    // Flatpickr for guest modal
    useEffect(() => {
        if (guestModalOpen) {
            requestAnimationFrame(() => {
                if (guestStartDateRef.current) {
                    guestStartPickerRef.current = flatpickr(guestStartDateRef.current, {
                        dateFormat: "Y-m-d",
                        minDate: "today",
                        allowInput: false,
                        static: true,
                        clickOpens: true,
                        onChange: (_selectedDates, dateStr) => {
                            setGuestForm(prev => ({ ...prev, startDate: dateStr }));
                        },
                    });
                }
            });
        }
        return () => {
            guestStartPickerRef.current?.destroy();
            guestStartPickerRef.current = null;
        };
    }, [guestModalOpen]);

    const fetchMembers = async () => {
        const response = await membersApi.execute(() => getPoolMembers());
        if (response.success && response.data) {
            setMembers(response.data.items);
        }
    };

    const fetchPlans = async () => {
        const response = await plansApi.execute(() => getPoolPlans());
        if (response.success && response.data) {
            setPlans(response.data.items);
        }
    };

    const resetMemberForm = () => {
        setMemberForm({
            name: "",
            email: "",
            phone: "",
            address: "",
            emergencyContactName: "",
            emergencyPhone: "",
            emergencyAddress: "",
            planId: "",
            startDate: "",
        });
    };

    const resetGuestForm = () => {
        setGuestForm({
            bookingReference: "",
            planId: "",
            startDate: "",
        });
    };

    const handleMemberSubmit = async () => {
        const response = await mutationApi.execute(() => createPoolAccess(memberForm));
        if (response.success) {
            fetchMembers();
            setMemberModalOpen(false);
            resetMemberForm();
        }
    };

    const handleGuestSubmit = async () => {
        const response = await mutationApi.execute(() => createPoolGuestAccess(guestForm));
        if (response.success) {
            fetchMembers();
            setGuestModalOpen(false);
            resetGuestForm();
        }
    };

    const handleRenew = async (memberId: string) => {
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        const response = await mutationApi.execute(() => renewPoolAccess(memberId, newEndDate.toISOString().split('T')[0]));
        if (response.success) {
            fetchMembers();
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deletePoolAccess(deleteDialog.id));
        if (response.success) {
            fetchMembers();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    const isLoading = membersApi.isLoading;
    const hasError = membersApi.error;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Pool Access" subtitle="Manage pool access and memberships" />
            <div className="p-6 space-y-6">
                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Current Visitors", value: members.filter(m => m.status === 'active').length, icon: Users },
                        { label: "Guest Access", value: members.filter(m => m.isGuest).length, icon: Waves },
                        { label: "Today's Revenue", value: "₦--", icon: DollarSign },
                        { label: "Avg. Duration", value: "--", icon: Clock },
                    ].map((stat) => (
                        <Card key={stat.label} variant="glass">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
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

                {/* Action Buttons - always visible */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setGuestModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Guest Access
                    </Button>
                    <Button variant="hero" onClick={() => setMemberModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Grant Access
                    </Button>
                </div>

                {isLoading && <LoadingState message="Loading pool access..." />}
                {hasError && !isLoading && (
                    <ErrorState message={membersApi.error || 'Failed to load data'} onRetry={fetchMembers} />
                )}

                {!isLoading && !hasError && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Access</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {members.length === 0 ? (
                                    <EmptyState
                                        icon={Users}
                                        title="No pool access records"
                                        description="Grant pool access to guests or members"
                                        action={
                                            <Button onClick={() => setMemberModalOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Grant Access
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {members.map((member) => {
                                            const plan = plans.find(p => p.id === member.planId);
                                            return (
                                                <Card key={member.id} variant="elevated" className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                                                            <Waves className="w-6 h-6 text-info" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">{member.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-sm text-muted-foreground">Plan</p>
                                                            <p className="font-medium">{plan?.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-sm text-muted-foreground">Expires</p>
                                                            <p className="font-medium">{member.endDate}</p>
                                                        </div>
                                                        <Badge variant={member.isGuest ? "default" : "secondary"}>
                                                            {member.isGuest ? "Guest" : "External"}
                                                        </Badge>
                                                        <Badge variant={member.status === "active" ? "success" : "destructive"}>
                                                            {member.status}
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">Manage</Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => navigate(`/dashboard/pool/access/${member.id}`)}>
                                                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRenew(member.id)}>
                                                                    <Calendar className="w-4 h-4 mr-2" /> Renew
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setDeleteDialog({ open: true, id: member.id })}
                                                                >
                                                                    <Trash className="w-4 h-4 mr-2" /> Revoke Access
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* ===== Member Registration Modal ===== */}
            <FormModal
                open={memberModalOpen}
                onOpenChange={setMemberModalOpen}
                title="Register Pool Access"
                description="Grant swimming pool access to an external member"
                onSubmit={handleMemberSubmit}
                submitLabel="Register Access"
                size="lg"
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Full Name" required>
                        <Input
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            placeholder="Full name"
                        />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Email" required>
                            <Input
                                type="email"
                                value={memberForm.email}
                                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </FormField>
                        <FormField label="Phone" required>
                            <Input
                                value={memberForm.phone}
                                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                                placeholder="+234 800 000 0000"
                            />
                        </FormField>
                    </div>
                    <FormField label="Contact Address" required>
                        <Input
                            value={memberForm.address}
                            onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                            placeholder="Home or office address"
                        />
                    </FormField>

                    {/* Emergency Contact Section */}
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Emergency Contact</h4>
                        <div className="space-y-4">
                            <FormField label="Emergency Contact Name" required>
                                <Input
                                    value={memberForm.emergencyContactName}
                                    onChange={(e) => setMemberForm({ ...memberForm, emergencyContactName: e.target.value })}
                                    placeholder="Contact person name"
                                />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Emergency Phone" required>
                                    <Input
                                        value={memberForm.emergencyPhone}
                                        onChange={(e) => setMemberForm({ ...memberForm, emergencyPhone: e.target.value })}
                                        placeholder="+234 800 000 0000"
                                    />
                                </FormField>
                                <FormField label="Emergency Address" required>
                                    <Input
                                        value={memberForm.emergencyAddress}
                                        onChange={(e) => setMemberForm({ ...memberForm, emergencyAddress: e.target.value })}
                                        placeholder="Emergency contact address"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Plan & Date */}
                    <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Access Plan" required>
                                <Select value={memberForm.planId} onValueChange={(v) => setMemberForm({ ...memberForm, planId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} - ₦{p.price?.toLocaleString()}/{p.duration} {p.duration === 1 ? 'day' : 'days'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Start Date" required>
                                <Input
                                    ref={memberStartDateRef}
                                    value={memberForm.startDate}
                                    readOnly
                                    placeholder="Select start date"
                                    className="cursor-pointer"
                                />
                            </FormField>
                        </div>
                    </div>
                </div>
            </FormModal>

            {/* ===== Guest Registration Modal ===== */}
            <FormModal
                open={guestModalOpen}
                onOpenChange={setGuestModalOpen}
                title="Register Guest Pool Access"
                description="Grant pool access to a hotel guest"
                onSubmit={handleGuestSubmit}
                submitLabel="Register Guest"
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Current Booking Reference Number" required>
                        <Input
                            value={guestForm.bookingReference}
                            onChange={(e) => setGuestForm({ ...guestForm, bookingReference: e.target.value })}
                            placeholder="e.g., BK-20260213-001"
                        />
                    </FormField>
                    <FormField label="Access Plan" required>
                        <Select value={guestForm.planId} onValueChange={(v) => setGuestForm({ ...guestForm, planId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} - ₦{p.price?.toLocaleString()}/{p.duration} {p.duration === 1 ? 'day' : 'days'}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label="Start Date" required>
                        <Input
                            ref={guestStartDateRef}
                            value={guestForm.startDate}
                            readOnly
                            placeholder="Select start date"
                            className="cursor-pointer"
                        />
                    </FormField>
                </div>
            </FormModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Revoke Access"
                description="Are you sure you want to revoke this pool access? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
