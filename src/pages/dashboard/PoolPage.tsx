import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Waves, Users, DollarSign, Clock, Edit, Trash, MoreVertical, Eye, Calendar } from "lucide-react";
import { guests } from "@/data/mockData";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PoolPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
}

interface PoolMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
  isGuest: boolean;
}

const defaultPlans: PoolPlan[] = [
  { id: "pp1", name: "Day Pass", duration: "1 day", price: 25, features: ["Pool access", "Towel service", "Locker"] },
  { id: "pp2", name: "Weekly", duration: "1 week", price: 80, features: ["Pool access", "Towel service", "Locker", "Pool bar discount"] },
  { id: "pp3", name: "Monthly", duration: "1 month", price: 200, features: ["Unlimited pool access", "Towel service", "Private cabana (weekdays)", "Pool bar discount", "Guest pass (2)"] },
];

const defaultMembers: PoolMember[] = [
  { id: "pm1", name: "Alex Thompson", email: "alex@email.com", phone: "+1 555-0301", planId: "pp3", startDate: "2024-01-01", endDate: "2024-01-31", status: "active", isGuest: false },
  { id: "pm2", name: "James Wilson", email: "james@email.com", phone: "+1 555-0101", planId: "pp1", startDate: "2024-01-15", endDate: "2024-01-15", status: "active", isGuest: true },
];

export default function PoolPage() {
  const [plans] = useState<PoolPlan[]>(defaultPlans);
  const [members] = useState<PoolMember[]>(defaultMembers);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PoolPlan | null>(null);
  const [viewMember, setViewMember] = useState<PoolMember | null>(null);
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
    planId: "",
    startDate: "",
    endDate: "",
  });

  const openPlanModal = (plan?: PoolPlan) => {
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

  const handlePlanSubmit = () => {
    toast.success(editingPlan ? "Pool plan updated successfully" : "Pool plan created successfully");
    setPlanModalOpen(false);
  };

  const handleMemberSubmit = () => {
    toast.success("Pool access registered successfully");
    setMemberModalOpen(false);
    setMemberForm({
      isGuest: false,
      guestId: "",
      name: "",
      email: "",
      phone: "",
      planId: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDelete = () => {
    toast.success(deleteDialog.type === "plan" ? "Plan deleted" : "Access revoked");
    setDeleteDialog({ open: false, type: "plan", id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Swimming Pool" subtitle="Manage pool access and memberships" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Current Visitors", value: 24, icon: Users },
            { label: "Guest Access", value: 8, icon: Waves },
            { label: "Today's Revenue", value: "$320", icon: DollarSign },
            { label: "Avg. Duration", value: "1.5h", icon: Clock },
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

        {/* Pool Plans */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pool Access Plans</CardTitle>
              <Button variant="outline" onClick={() => openPlanModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </CardHeader>
            <CardContent>
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
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                        <Waves className="w-6 h-6 text-info" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.duration}</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-primary mb-4">${plan.price}</p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-info" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => setMemberModalOpen(true)}>
                      Purchase Access
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pool Members */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Access</CardTitle>
              <Button variant="hero" onClick={() => setMemberModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Grant Access
              </Button>
            </CardHeader>
            <CardContent>
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
                          <p className="font-medium">{plan?.name}</p>
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
                            <DropdownMenuItem onClick={() => setViewMember(member)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Access renewed")}>
                              <Calendar className="w-4 h-4 mr-2" /> Renew
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteDialog({ open: true, type: "member", id: member.id })}
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
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pool Plan Modal */}
      <FormModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        title={editingPlan ? "Edit Pool Plan" : "Create Pool Plan"}
        description="Configure pool access plan details"
        onSubmit={handlePlanSubmit}
        submitLabel={editingPlan ? "Update Plan" : "Create Plan"}
      >
        <div className="space-y-4">
          <FormField label="Plan Name" required>
            <Input
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g., Day Pass, Weekly, Monthly"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration" required>
              <Select value={planForm.duration} onValueChange={(v) => setPlanForm({ ...planForm, duration: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 Day</SelectItem>
                  <SelectItem value="3 days">3 Days</SelectItem>
                  <SelectItem value="1 week">1 Week</SelectItem>
                  <SelectItem value="2 weeks">2 Weeks</SelectItem>
                  <SelectItem value="1 month">1 Month</SelectItem>
                  <SelectItem value="3 months">3 Months</SelectItem>
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
              placeholder="Pool access, Towel service, Locker"
            />
          </FormField>
        </div>
      </FormModal>

      {/* Member Registration Modal */}
      <FormModal
        open={memberModalOpen}
        onOpenChange={setMemberModalOpen}
        title="Register Pool Access"
        description="Grant swimming pool access"
        onSubmit={handleMemberSubmit}
        submitLabel="Register Access"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Is Hotel Guest?">
            <div className="flex items-center gap-2">
              <Switch
                checked={memberForm.isGuest}
                onCheckedChange={(checked) => setMemberForm({ ...memberForm, isGuest: checked })}
              />
              <span className="text-sm text-muted-foreground">
                {memberForm.isGuest ? "Yes, hotel guest" : "No, external visitor"}
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

          <FormField label="Access Plan" required>
            <Select value={memberForm.planId} onValueChange={(v) => setMemberForm({ ...memberForm, planId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}/{p.duration}</SelectItem>
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

          {memberForm.isGuest && (
            <Card variant="glass" className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Pool access may be included in the guest's room booking. Please verify before creating a paid access.
              </p>
            </Card>
          )}
        </div>
      </FormModal>

      {/* View Member Modal */}
      <ViewModal
        open={!!viewMember}
        onOpenChange={() => setViewMember(null)}
        title="Access Details"
      >
        {viewMember && (() => {
          const plan = plans.find(p => p.id === viewMember.planId);
          return (
            <div className="space-y-4">
              <DetailRow label="Name" value={viewMember.name} />
              <DetailRow label="Email" value={viewMember.email} />
              <DetailRow label="Phone" value={viewMember.phone} />
              <DetailRow label="Plan" value={plan?.name} />
              <DetailRow label="Start Date" value={viewMember.startDate} />
              <DetailRow label="End Date" value={viewMember.endDate} />
              <DetailRow label="Status" value={<Badge variant={viewMember.status === "active" ? "success" : "destructive"}>{viewMember.status}</Badge>} />
              <DetailRow label="Type" value={viewMember.isGuest ? "Hotel Guest" : "External Visitor"} />
            </div>
          );
        })()}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={deleteDialog.type === "plan" ? "Delete Plan" : "Revoke Access"}
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
