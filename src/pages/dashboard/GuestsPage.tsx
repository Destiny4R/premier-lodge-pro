import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, Mail, Phone, MoreVertical, Eye, History, Edit, Trash } from "lucide-react";
import { guests, Guest } from "@/data/mockData";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function GuestsPage() {
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [viewGuest, setViewGuest] = useState<Guest | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    address: "",
  });

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

  const handleGuestSubmit = () => {
    toast.success(editingGuest ? "Guest updated successfully" : "Guest added successfully");
    setGuestModalOpen(false);
  };

  const handleDelete = () => {
    toast.success("Guest deleted successfully");
    setDeleteDialog({ open: false, id: "" });
  };

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
              <Input placeholder="Search guests..." className="pl-10 bg-secondary border-border" />
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
            { label: "Total Guests", value: guests.length, icon: Users },
            { label: "Checked In", value: 89, icon: Users },
            { label: "VIP Guests", value: 12, icon: Users },
            { label: "Returning Guests", value: "68%", icon: History },
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guests.map((guest) => (
                  <Card key={guest.id} variant="elevated" className="p-4 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={guest.avatar}
                          alt={guest.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
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
                        <p className="font-semibold text-foreground">{guest.totalStays}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="font-semibold text-primary">${guest.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
              <img src={viewGuest.avatar} alt={viewGuest.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{viewGuest.name}</h3>
                <p className="text-muted-foreground">{viewGuest.idType}: {viewGuest.idNumber}</p>
              </div>
            </div>
            <DetailRow label="Email" value={viewGuest.email} />
            <DetailRow label="Phone" value={viewGuest.phone} />
            <DetailRow label="Address" value={viewGuest.address} />
            <DetailRow label="Total Stays" value={viewGuest.totalStays} />
            <DetailRow label="Total Spent" value={`$${viewGuest.totalSpent.toLocaleString()}`} />
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
