import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Waves,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    CreditCard,
    AlertTriangle,
    RefreshCw,
    Trash,
} from "lucide-react";
import { ConfirmDialog } from "@/components/forms";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
    getPoolMemberById,
    getPoolPlans,
    deletePoolAccess,
    renewPoolAccess,
    PoolPlan,
    PoolMember,
} from "@/services/poolService";
import { PaginatedResponse } from "@/types/api";

export default function PoolMemberDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const memberApi = useApi<PoolMember>();
    const plansApi = useApi<PaginatedResponse<PoolPlan>>();
    const mutationApi = useApi<PoolMember | null>({ showSuccessToast: true });

    const [member, setMember] = useState<PoolMember | null>(null);
    const [plans, setPlans] = useState<PoolPlan[]>([]);
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMember();
            fetchPlans();
        }
    }, [id]);

    const fetchMember = async () => {
        if (!id) return;
        const response = await memberApi.execute(() => getPoolMemberById(id));
        if (response.success && response.data) {
            setMember(response.data);
        }
    };

    const fetchPlans = async () => {
        const response = await plansApi.execute(() => getPoolPlans());
        if (response.success && response.data) {
            setPlans(response.data.items);
        }
    };

    const handleRenew = async () => {
        if (!member) return;
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        const response = await mutationApi.execute(() =>
            renewPoolAccess(member.id, newEndDate.toISOString().split("T")[0])
        );
        if (response.success) {
            fetchMember();
        }
    };

    const handleDelete = async () => {
        if (!member) return;
        const response = await mutationApi.execute(() => deletePoolAccess(member.id));
        if (response.success) {
            navigate("/dashboard/pool/access");
        }
        setDeleteDialog(false);
    };

    const memberPlan = member
        ? plans.find((p) => p.id === member.planId)
        : null;

    if (memberApi.isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="Pool Member Details" subtitle="Loading..." />
                <div className="p-6">
                    <LoadingState message="Loading member details..." />
                </div>
            </div>
        );
    }

    if (memberApi.error || !member) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader title="Pool Member Details" subtitle="Error" />
                <div className="p-6">
                    <ErrorState
                        message={memberApi.error || "Member not found"}
                        onRetry={fetchMember}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                title="Pool Member Details"
                subtitle={`Viewing ${member.name}'s pool access`}
            />
            <div className="p-6 space-y-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard/pool/access")}
                    className="mb-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Pool Access
                </Button>

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center">
                                        <Waves className="w-8 h-8 text-info" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {member.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={member.isGuest ? "default" : "secondary"}>
                                                {member.isGuest ? "Hotel Guest" : "External"}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    member.status === "active"
                                                        ? "success"
                                                        : "destructive"
                                                }
                                            >
                                                {member.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleRenew}
                                        disabled={mutationApi.isLoading}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Renew
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeleteDialog(true)}
                                        disabled={mutationApi.isLoading}
                                    >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Revoke Access
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Member Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Member Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoRow icon={User} label="Full Name" value={member.name} />
                                <InfoRow icon={Mail} label="Email" value={member.email} />
                                <InfoRow icon={Phone} label="Phone" value={member.phone} />
                                <InfoRow icon={MapPin} label="Address" value={member.address || "N/A"} />
                                <InfoRow icon={Calendar} label="Start Date" value={member.startDate} />
                                <InfoRow icon={Calendar} label="End Date" value={member.endDate} />
                                {member.bookingReference && (
                                    <InfoRow icon={Shield} label="Booking Reference" value={member.bookingReference} />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Emergency Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <InfoRow icon={User} label="Contact Name" value={member.emergencyContactName || "N/A"} />
                                <InfoRow icon={Phone} label="Contact Phone" value={member.emergencyPhone || "N/A"} />
                                <InfoRow icon={MapPin} label="Contact Address" value={member.emergencyAddress || "N/A"} />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payment & Plan Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment & Plan Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                                        <p className="text-sm text-muted-foreground">Current Plan</p>
                                        <p className="text-xl font-bold text-foreground">
                                            {memberPlan?.name || "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {memberPlan?.duration ? `${memberPlan.duration} days` : "N/A"}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                                        <p className="text-sm text-muted-foreground">Plan Price</p>
                                        <p className="text-xl font-bold text-primary">
                                            {memberPlan ? `₦${memberPlan.price?.toLocaleString()}` : "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Per cycle</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                                        <p className="text-sm text-muted-foreground">Payment Status</p>
                                        <Badge
                                            variant={member.status === "active" ? "success" : "destructive"}
                                            className="text-sm"
                                        >
                                            {member.status === "active" ? "Paid" : "Unpaid"}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            Member since {new Date(member.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Features */}
                                {memberPlan && memberPlan.features.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-foreground mb-3">
                                            Plan Features
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {memberPlan.features.map((feature, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog}
                onOpenChange={setDeleteDialog}
                title="Revoke Access"
                description="Are you sure you want to revoke this pool access? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />
        </div>
    );
}

// Helper component for info rows
function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}
