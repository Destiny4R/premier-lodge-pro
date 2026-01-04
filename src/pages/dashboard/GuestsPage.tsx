import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState, EmptyState, StatsSkeleton } from "@/components/ui/loading-state";
import { Plus, Search, Filter, Users, Mail, Phone, MoreVertical, Eye, History, Edit, Trash } from "lucide-react";
import { getGuests, createGuest, updateGuest, deleteGuest, getGuestStats } from "@/services/guestService";
import { Guest, CreateGuestRequest } from "@/types/api";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface GuestStats {
  totalGuests: number;
  checkedIn: number;
  vipGuests: number;
  returningRate: string;
}

export default function GuestsPage() {
  // Data state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewGuest, setViewGuest] = useState<Guest | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    address: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [guestsRes, statsRes] = await Promise.all([
        getGuests({ page: 1, limit: 50, search: searchQuery }),
        getGuestStats(),
      ]);

      if (guestsRes.success) {
        setGuests(guestsRes.data.items);
      } else {
        setError(guestsRes.message);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError("Failed to load guests");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter guests locally for immediate feedback
  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openGuestModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setGuestForm({
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        idType: guest.idType,
        idNumber: guest.idNumber,
        address: guest.address,
      });
    } else {
      setEditingGuest(null);
      setGuestForm({ name: "", email: "", phone: "", idType: "", idNumber: "", address: "" });
    }
    setGuestModalOpen(true);
  };

  const handleGuestSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const guestData: CreateGuestRequest = {
        name: guestForm.name,
        email: guestForm.email,
        phone: guestForm.phone,
        idType: guestForm.idType,
        idNumber: guestForm.idNumber,
        address: guestForm.address,
      };

      const response = editingGuest
        ? await updateGuest(editingGuest.id, guestData)
        : await createGuest(guestData);

      if (response.success) {
        toast.success(editingGuest ? "Guest updated successfully" : "Guest added successfully");
        setGuestModalOpen(false);
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await deleteGuest(deleteDialog.id);
      
      if (response.success) {
        toast.success("Guest deleted successfully");
        setDeleteDialog({ open: false, id: "" });
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Guest Management" subtitle="View and manage all guest profiles" />
        <div className="p-6 space-y-6">
          <StatsSkeleton count={4} />
          <Card>
            <CardContent className="py-12">
              <LoadingState message="Loading guests..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Guest Management" subtitle="View and manage all guest profiles" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search guests..." 
                className="pl-10 bg-secondary border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="hero" onClick={() => openGuestModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Guests", value: stats?.totalGuests ?? guests.length, icon: Users },
            { label: "Checked In", value: stats?.checkedIn ?? 0, icon: Users },
            { label: "VIP Guests", value: stats?.vipGuests ?? 0, icon: Users },
            { label: "Returning Guests", value: stats?.returningRate ?? "0%", icon: History },
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
        </motion.div>

        {/* Guests Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Guests</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <EmptyState
                  title="Error loading guests"
                  description={error}
                  action={<Button variant="outline" onClick={fetchData}>Retry</Button>}
                />
              ) : filteredGuests.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No guests found"
                  description={searchQuery ? "Try adjusting your search" : "Add your first guest to get started"}
                  action={!searchQuery ? <Button variant="outline" onClick={() => openGuestModal()}>Add Guest</Button> : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGuests.map((guest) => (
                    <Card key={guest.id} variant="elevated" className="p-4 hover-lift">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {guest.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{guest.name}</h3>
                            <p className="text-sm text-muted-foreground">{guest.idType}: {guest.idNumber}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewGuest(guest)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openGuestModal(guest)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="w-4 h-4 mr-2" /> Stay History
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteDialog({ open: true, id: guest.id })}
                            >
                              <Trash className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {guest.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {guest.phone}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Stays</p>
                          <p className="font-semibold text-foreground">{guest.totalStays || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="font-semibold text-primary">${(guest.totalSpent || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Guest Modal */}
      <FormModal
        open={guestModalOpen}
        onOpenChange={setGuestModalOpen}
        title={editingGuest ? "Edit Guest" : "Add New Guest"}
        description="Enter guest information"
        onSubmit={handleGuestSubmit}
        submitLabel={editingGuest ? "Update Guest" : "Add Guest"}
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={guestForm.name}
              onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
              placeholder="John Doe"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <Input
                type="email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </FormField>
            <FormField label="Phone" required>
              <Input
                value={guestForm.phone}
                onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                placeholder="+1 555-0100"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ID Type" required>
              <Select value={guestForm.idType} onValueChange={(v) => setGuestForm({ ...guestForm, idType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Driver License">Driver License</SelectItem>
                  <SelectItem value="National ID">National ID</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="ID Number" required>
              <Input
                value={guestForm.idNumber}
                onChange={(e) => setGuestForm({ ...guestForm, idNumber: e.target.value })}
                placeholder="AB123456"
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Textarea
              value={guestForm.address}
              onChange={(e) => setGuestForm({ ...guestForm, address: e.target.value })}
              placeholder="Full address"
              rows={2}
            />
          </FormField>
        </div>
      </FormModal>

      {/* View Guest Modal */}
      <ViewModal
        open={!!viewGuest}
        onOpenChange={() => setViewGuest(null)}
        title="Guest Details"
      >
        {viewGuest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {viewGuest.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{viewGuest.name}</h3>
                <p className="text-muted-foreground">{viewGuest.idType}: {viewGuest.idNumber}</p>
              </div>
            </div>
            <DetailRow label="Email" value={viewGuest.email} />
            <DetailRow label="Phone" value={viewGuest.phone} />
            <DetailRow label="Address" value={viewGuest.address} />
            <DetailRow label="Total Stays" value={viewGuest.totalStays || 0} />
            <DetailRow label="Total Spent" value={`$${(viewGuest.totalSpent || 0).toLocaleString()}`} />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Guest"
        description="Are you sure you want to delete this guest? This will remove all their records and history."
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
