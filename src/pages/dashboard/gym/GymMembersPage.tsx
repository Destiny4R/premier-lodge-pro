import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Dumbbell, Users, DollarSign, Crown, Trash, Eye, Calendar, UserPlus } from "lucide-react";
import { FormModal, FormField, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getGymMembers,
    getGymPlans,
    createGymMember,
    createGymGuestMember,
    deleteGymMember,
    renewGymMembership,
    upgradeGymMembership,
    GymPlan
} from "@/services/gymService";
import { GymMember, PaginatedResponse } from "@/types/api";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";

export default function GymMembersPage() {
    const navigate = useNavigate();
    const membersApi = useApi<PaginatedResponse<GymMember>>();
    const plansApi = useApi<PaginatedResponse<GymPlan>>();
    const mutationApi = useApi<GymMember | null>({ showSuccessToast: true });

    const [members, setMembers] = useState<GymMember[]>([]);
    const [plans, setPlans] = useState<GymPlan[]>([]);

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
        gymPlanId: "",
        startDate: "",
    });

    // Guest registration form
    const [guestForm, setGuestForm] = useState({
        bookingReference: "",
        gymPlanId: "",
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
        const response = await membersApi.execute(() => getGymMembers());
        if (response.success && response.data) {
            setMembers(response.data.items);
        }
    };

    const fetchPlans = async () => {
        const response = await plansApi.execute(() => getGymPlans());
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
            gymPlanId: "",
            startDate: "",
        });
    };

    const resetGuestForm = () => {
        setGuestForm({
            bookingReference: "",
            gymPlanId: "",
            startDate: "",
        });
    };

    const handleMemberSubmit = async () => {
        const response = await mutationApi.execute(() => createGymMember(memberForm));
        if (response.success) {
            fetchMembers();
            setMemberModalOpen(false);
            resetMemberForm();
        }
    };

    const handleGuestSubmit = async () => {
        const response = await mutationApi.execute(() => createGymGuestMember(guestForm));
        if (response.success) {
            fetchMembers();
            setGuestModalOpen(false);
            resetGuestForm();
        }
    };

    const handleRenew = async (memberId: string) => {
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        const response = await mutationApi.execute(() => renewGymMembership(memberId, newEndDate.toISOString().split('T')[0]));
        if (response.success) {
            fetchMembers();
        }
    };

    const handleUpgrade = async (memberId: string) => {
        const response = await mutationApi.execute(() => upgradeGymMembership(memberId, 'premium'));
        if (response.success) {
            fetchMembers();
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deleteGymMember(deleteDialog.id));
        if (response.success) {
            fetchMembers();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    const isLoading = membersApi.isLoading;
    const hasError = membersApi.error;

    const activeMembers = members.filter(m => m.status === 'active').length;
    // Count VIP members based on plan name if needed, or just remove if irrelevant
    const vipMembers = members.filter(m => {
        const plan = plans.find(p => p.id === m.gymPlanId);
        return plan?.name.toLowerCase().includes('vip');
    }).length;

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader title="Gym Members" subtitle="Manage gym memberships and access" />
            <div className="p-6 space-y-6">
                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: "Active Members", value: activeMembers, icon: Users },
                            { label: "Guest Access", value: members.filter(m => m.isGuest).length, icon: Dumbbell },
                            { label: "Monthly Revenue", value: "₦--", icon: DollarSign },
                            { label: "VIP Members", value: vipMembers, icon: Crown },
                        ].map((stat) => (
                            <Card key={stat.label} variant="glass">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <stat.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons - always visible */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setGuestModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Guest Member
                    </Button>
                    <Button variant="hero" onClick={() => setMemberModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>

                {isLoading && <LoadingState message="Loading gym members..." />}
                {hasError && !isLoading && (
                    <ErrorState message={membersApi.error || 'Failed to load data'} onRetry={fetchMembers} />
                )}

                {!isLoading && !hasError && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Gym Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {members.length === 0 ? (
                                    <EmptyState
                                        icon={Users}
                                        title="No members found"
                                        description="Register your first gym member"
                                        action={
                                            <Button onClick={() => setMemberModalOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Member
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {members.map((member) => (
                                            <Card key={member.id} variant="elevated" className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Dumbbell className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-sm text-muted-foreground">Expires</p>
                                                        <p className="font-medium">{member.endDate}</p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {plans.find(p => p.id === member.gymPlanId)?.name || 'Unknown Plan'}
                                                    </Badge>
                                                    <Badge variant={member.status === "active" ? "success" : "destructive"}>{member.status}</Badge>
                                                    {member.isGuest && <Badge variant="outline">Guest</Badge>}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">Manage</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => navigate(`/dashboard/gym/members/${member.id}`)}>
                                                                <Eye className="w-4 h-4 mr-2" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRenew(member.id)}>
                                                                <Calendar className="w-4 h-4 mr-2" /> Renew
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpgrade(member.id)}>
                                                                <Crown className="w-4 h-4 mr-2" /> Upgrade
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => setDeleteDialog({ open: true, id: member.id })}
                                                            >
                                                                <Trash className="w-4 h-4 mr-2" /> Cancel
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </Card>
                                        ))}
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
                title="Register Gym Member"
                description="Add a new external gym membership"
                onSubmit={handleMemberSubmit}
                submitLabel="Register Member"
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
                            <FormField label="Membership Plan" required>
                                <Select
                                    value={memberForm.gymPlanId}
                                    onValueChange={(v) => setMemberForm({ ...memberForm, gymPlanId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Plan" />
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
                title="Register Guest Member"
                description="Register a hotel guest for gym access"
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
                    <FormField label="Membership Plan" required>
                        <Select
                            value={guestForm.gymPlanId}
                            onValueChange={(v) => setGuestForm({ ...guestForm, gymPlanId: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Plan" />
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
                title="Cancel Membership"
                description="Are you sure you want to cancel this membership? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}
