import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Dumbbell, Users, Calendar, DollarSign, Crown, Edit, Trash, MoreVertical, Eye } from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { 
  getGymMembers, 
  getGymPlans,
  createGymMember, 
  updateGymMember, 
  deleteGymMember,
  createGymPlan,
  updateGymPlan,
  deleteGymPlan,
  renewGymMembership,
  upgradeGymMembership,
  GymPlan
} from "@/services/gymService";
import { getGuests } from "@/services/guestService";
import { GymMember, Guest, PaginatedResponse } from "@/types/api";

export default function GymPage() {
  // API States
  const membersApi = useApi<PaginatedResponse<GymMember>>();
  const plansApi = useApi<PaginatedResponse<GymPlan>>();
  const guestsApi = useApi<PaginatedResponse<Guest>>();
  const mutationApi = useApi<GymMember | GymPlan | null>({ showSuccessToast: true });

  // Local state
  const [members, setMembers] = useState<GymMember[]>([]);
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymPlan | null>(null);
  const [viewMember, setViewMember] = useState<GymMember | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "plan" | "member"; id: string }>({ open: false, type: "plan", id: "" });

  const [planForm, setPlanForm] = useState({
    name: "",
    duration: "",
    price: "",
    features: "",
  });

  const [memberForm, setMemberForm] = useState({
    isGuest: false,
    guestId: "",
    name: "",
    email: "",
    phone: "",
    membershipType: "basic" as "basic" | "premium" | "vip",
    startDate: "",
    endDate: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchMembers();
    fetchPlans();
    fetchGuests();
  }, []);

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

  const fetchGuests = async () => {
    const response = await guestsApi.execute(() => getGuests());
    if (response.success && response.data) {
      setGuests(response.data.items);
    }
  };

  const openPlanModal = (plan?: GymPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        duration: plan.duration,
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
      duration: planForm.duration,
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

  const handleMemberSubmit = async () => {
    const memberData = {
      guestId: memberForm.isGuest ? memberForm.guestId : undefined,
      name: memberForm.name,
      email: memberForm.email,
      phone: memberForm.phone,
      membershipType: memberForm.membershipType,
      startDate: memberForm.startDate,
      endDate: memberForm.endDate,
    };

    const response = await mutationApi.execute(() => createGymMember(memberData));
    if (response.success) {
      fetchMembers();
      setMemberModalOpen(false);
      setMemberForm({
        isGuest: false,
        guestId: "",
        name: "",
        email: "",
        phone: "",
        membershipType: "basic",
        startDate: "",
        endDate: "",
      });
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
    if (deleteDialog.type === "plan") {
      const response = await mutationApi.execute(() => deleteGymPlan(deleteDialog.id));
      if (response.success) {
        fetchPlans();
      }
    } else {
      const response = await mutationApi.execute(() => deleteGymMember(deleteDialog.id));
      if (response.success) {
        fetchMembers();
      }
    }
    setDeleteDialog({ open: false, type: "plan", id: "" });
  };

  const isLoading = membersApi.isLoading || plansApi.isLoading;
  const hasError = membersApi.error || plansApi.error;

  // Stats calculation
  const activeMembers = members.filter(m => m.status === 'active').length;
  const vipMembers = members.filter(m => m.membershipType === 'vip').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Gym Management" subtitle="Manage memberships and access" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Active Members", value: activeMembers, icon: Users },
              { label: "Guest Access", value: members.filter(m => m.isGuest).length, icon: Dumbbell },
              { label: "Monthly Revenue", value: "$--", icon: DollarSign },
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

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading gym data..." />}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorState 
            message={membersApi.error || plansApi.error || 'Failed to load data'} 
            onRetry={() => { fetchMembers(); fetchPlans(); }} 
          />
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <>
            {/* Gym Plans */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gym Plans</CardTitle>
                  <Button variant="outline" onClick={() => openPlanModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plan
                  </Button>
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
                                onClick={() => setDeleteDialog({ open: true, type: "plan", id: plan.id })}
                              >
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <div className="text-center mb-4">
                            <Badge variant={plan.name === "VIP" ? "default" : "secondary"} className="mb-2">{plan.name}</Badge>
                            <p className="text-3xl font-bold text-primary">${plan.price}</p>
                            <p className="text-sm text-muted-foreground">{plan.duration}</p>
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button variant="outline" className="w-full mt-4" onClick={() => setMemberModalOpen(true)}>
                            Subscribe
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Members */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Gym Members</CardTitle>
                  <Button variant="hero" onClick={() => setMemberModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
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
                            <Badge variant={member.membershipType === "vip" ? "default" : "secondary"}>{member.membershipType}</Badge>
                            <Badge variant={member.status === "active" ? "success" : "destructive"}>{member.status}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Manage</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewMember(member)}>
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
                                  onClick={() => setDeleteDialog({ open: true, type: "member", id: member.id })}
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
          </>
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
                  <SelectItem value="1 week">1 Week</SelectItem>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="1 year">1 Year</SelectItem>
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

      {/* Member Registration Modal */}
      <FormModal
        open={memberModalOpen}
        onOpenChange={setMemberModalOpen}
        title="Register Gym Member"
        description="Add a new gym membership"
        onSubmit={handleMemberSubmit}
        submitLabel="Register Member"
        size="lg"
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Is Hotel Guest?">
            <div className="flex items-center gap-2">
              <Switch
                checked={memberForm.isGuest}
                onCheckedChange={(checked) => setMemberForm({ ...memberForm, isGuest: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {memberForm.isGuest ? "Yes, hotel guest" : "No, external member"}
              </span>
            </div>
          </FormField>

          {memberForm.isGuest ? (
            <FormField label="Select Guest" required>
              <Select value={memberForm.guestId} onValueChange={(v) => setMemberForm({ ...memberForm, guestId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name} - {g.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : (
            <>
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
                    placeholder="+1 555-0100"
                  />
                </FormField>
              </div>
            </>
          )}

          <FormField label="Membership Plan" required>
            <Select 
              value={memberForm.membershipType} 
              onValueChange={(v: "basic" | "premium" | "vip") => setMemberForm({ ...memberForm, membershipType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.name.toLowerCase()}>{p.name} - ${p.price}/{p.duration}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={memberForm.startDate}
                onChange={(e) => setMemberForm({ ...memberForm, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="End Date" required>
              <Input
                type="date"
                value={memberForm.endDate}
                onChange={(e) => setMemberForm({ ...memberForm, endDate: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </FormModal>

      {/* View Member Modal */}
      <ViewModal
        open={!!viewMember}
        onOpenChange={() => setViewMember(null)}
        title="Member Details"
      >
        {viewMember && (
          <div className="space-y-4">
            <DetailRow label="Name" value={viewMember.name} />
            <DetailRow label="Email" value={viewMember.email} />
            <DetailRow label="Phone" value={viewMember.phone} />
            <DetailRow label="Membership" value={<Badge variant={viewMember.membershipType === "vip" ? "default" : "secondary"}>{viewMember.membershipType}</Badge>} />
            <DetailRow label="Start Date" value={viewMember.startDate} />
            <DetailRow label="End Date" value={viewMember.endDate} />
            <DetailRow label="Status" value={<Badge variant={viewMember.status === "active" ? "success" : "destructive"}>{viewMember.status}</Badge>} />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={deleteDialog.type === "plan" ? "Delete Gym Plan" : "Cancel Membership"}
        description={deleteDialog.type === "plan" 
          ? "Are you sure you want to delete this gym plan? This action cannot be undone."
          : "Are you sure you want to cancel this membership? This action cannot be undone."
        }
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
