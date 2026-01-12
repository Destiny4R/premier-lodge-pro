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
import { Guest, CreateGuestRequest, Room } from "@/types/api";
import { getRooms } from "@/services/roomService";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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
  const [rooms, setRooms] = useState<Room[]>([]);
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
    firstname: "",
    lastname: "",
    gender: "Male",
    address: "",
    city: "",
    country: "",
    Email: "",
    phone: "",
    identificationnumber: "",
    identificationtype: "National Identification Number (NIN)",
    emergencycontactname: "",
    emergencycontactphone: "",
    accommodation: "",
    checkindate: null as Date | null,
    checkoutdate: null as Date | null,
    roomids: [] as number[],
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    //
    try {
      const [guestsRes, statsRes, roomsRes] = await Promise.all([
        getGuests({ page: 1, limit: 10, search: searchQuery }),
        getGuestStats(),
        getRooms({ page: 1, limit: 200 }),
      ]);
      console.log(guestsRes, statsRes, roomsRes);
      if (guestsRes.success) {
        setGuests(guestsRes.data.items);
      } else {
        setError(guestsRes.message);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (roomsRes.success) {
        setRooms(roomsRes.data.items);
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
        firstname: guest.firstname || guest.name?.split(' ')[0] || '',
        lastname: guest.lastname || guest.name?.split(' ').slice(1).join(' ') || '',
        gender: guest.gender || 'Male',
        address: guest.address || '',
        city: guest.city || '',
        country: guest.country || '',
        Email: guest.Email || guest.email || '',
        phone: guest.phone || '',
        identificationnumber: guest.identificationnumber || guest.idNumber || '',
        identificationtype: guest.identificationtype || guest.idType || 'National Identification Number (NIN)',
        emergencycontactname: guest.emergencycontactname || '',
        emergencycontactphone: guest.emergencycontactphone || '',
        accommodation: guest.accommodation || '',
        checkindate: guest.checkindate ? new Date(guest.checkindate) : null,
        checkoutdate: guest.checkoutdate ? new Date(guest.checkoutdate) : null,
        roomids: guest.roomids || [],
      });
    } else {
      setEditingGuest(null);
      setGuestForm({ firstname: "", lastname: "", gender: "Male", address: "", city: "", country: "", Email: "", phone: "", identificationnumber: "", identificationtype: "National Identification Number (NIN)", emergencycontactname: "", emergencycontactphone: "", accommodation: "", checkindate: null, checkoutdate: null, roomids: [] });
    }
    setGuestModalOpen(true);
  };

  const handleGuestSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const payload: CreateGuestRequest = {
        firstname: guestForm.firstname,
        lastname: guestForm.lastname,
        gender: guestForm.gender,
        address: guestForm.address,
        city: guestForm.city,
        country: guestForm.country,
        Email: guestForm.Email,
        phone: guestForm.phone,
        identificationnumber: guestForm.identificationnumber,
        identificationtype: guestForm.identificationtype,
        emergencycontactname: guestForm.emergencycontactname,
        emergencycontactphone: guestForm.emergencycontactphone,
        accommodation: guestForm.accommodation,
        checkindate: guestForm.checkindate ? guestForm.checkindate.toISOString() : undefined,
        checkoutdate: guestForm.checkoutdate ? guestForm.checkoutdate.toISOString() : undefined,
        roomids: guestForm.roomids,
      };

      const response = editingGuest
        ? await updateGuest(editingGuest.id, payload)
        : await createGuest(payload);

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

  // Ensure check-in / check-out dates are valid relative to each other and today
  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);

    setGuestForm((prev) => {
      let changed = false;
      let next = { ...prev };

      if (next.checkindate && next.checkindate < today) {
        next.checkindate = null;
        changed = true;
      }

      if (next.checkoutdate && next.checkoutdate < today) {
        next.checkoutdate = null;
        changed = true;
      }

      if (next.checkindate && next.checkoutdate && next.checkoutdate < next.checkindate) {
        next.checkoutdate = null;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [guestForm.checkindate, guestForm.checkoutdate]);

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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <Input value={guestForm.firstname} onChange={(e) => setGuestForm({ ...guestForm, firstname: e.target.value })} placeholder="First name" />
            </FormField>
            <FormField label="Last Name" required>
              <Input value={guestForm.lastname} onChange={(e) => setGuestForm({ ...guestForm, lastname: e.target.value })} placeholder="Last name" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender">
              <Select value={guestForm.gender} onValueChange={(v) => setGuestForm({ ...guestForm, gender: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Email" required>
              <Input type="email" value={guestForm.Email} onChange={(e) => setGuestForm({ ...guestForm, Email: e.target.value })} placeholder="guest@example.com" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" required>
              <Input value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })} placeholder="+234..." />
            </FormField>
            <FormField label="Accommodation">
              <Select value={guestForm.accommodation} onValueChange={(e) => setGuestForm({ ...guestForm, accommodation: e })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checked In">Checked In</SelectItem>
                  <SelectItem value="Reservations">Reservations</SelectItem>
                  {/* <SelectItem value="Other">Other</SelectItem> */}
                </SelectContent>
              </Select>
            </FormField>
            {/* <FormField label="Accommodation">
              <Input value={guestForm.accommodation} onChange={(e) => setGuestForm({ ...guestForm, accommodation: e.target.value })} placeholder="Deluxe Suite with River View" />
            </FormField> */}
          </div>

          <FormField label="Identification" hint="Type and number">
            <div className="grid grid-cols-2 gap-4">
              <Select value={guestForm.identificationtype} onValueChange={(v) => setGuestForm({ ...guestForm, identificationtype: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select identification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="National Identification Number (NIN)">National Identification Number (NIN)</SelectItem>
                  <SelectItem value="International Passport">International Passport</SelectItem>
                  <SelectItem value="Driver's License">Driver's License</SelectItem>
                  <SelectItem value="Permanent Voter's Card (PVC)">Permanent Voter's Card (PVC)</SelectItem>
                </SelectContent>
              </Select>
              <Input value={guestForm.identificationnumber} onChange={(e) => setGuestForm({ ...guestForm, identificationnumber: e.target.value })} placeholder="A1298767890NG" />
            </div>
          </FormField>

          <FormField label="Address">
            <Textarea value={guestForm.address} onChange={(e) => setGuestForm({ ...guestForm, address: e.target.value })} placeholder="Full address" rows={2} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="City">
              <Input value={guestForm.city} onChange={(e) => setGuestForm({ ...guestForm, city: e.target.value })} placeholder="Makurdi" />
            </FormField>
            <FormField label="Country">
              <Input value={guestForm.country} onChange={(e) => setGuestForm({ ...guestForm, country: e.target.value })} placeholder="Nigeria" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Emergency Contact Name">
              <Input value={guestForm.emergencycontactname} onChange={(e) => setGuestForm({ ...guestForm, emergencycontactname: e.target.value })} placeholder="Grace Adoga" />
            </FormField>
            <FormField label="Emergency Contact Phone">
              <Input value={guestForm.emergencycontactphone} onChange={(e) => setGuestForm({ ...guestForm, emergencycontactphone: e.target.value })} placeholder="+234..." />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Date">
              <DatePicker value={guestForm.checkindate} onChange={(d) => setGuestForm(prev => ({ ...prev, checkindate: d }))} placeholder="Select check-in" minDate={new Date()} />
            </FormField>
            <FormField label="Check-out Date">
              <DatePicker value={guestForm.checkoutdate} onChange={(d) => setGuestForm(prev => ({ ...prev, checkoutdate: d }))} placeholder="Select check-out" minDate={guestForm.checkindate ? guestForm.checkindate : new Date()} />
            </FormField>
          </div>

          <FormField label="Select Rooms">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
              {rooms.map((r) => {
                const idNum = parseInt(r.id);
                const checked = guestForm.roomids.includes(idNum);
                return (
                  <label key={r.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setGuestForm((prev) => {
                          const roomSet = new Set(prev.roomids);
                          if (e.target.checked) roomSet.add(idNum);
                          else roomSet.delete(idNum);
                          return { ...prev, roomids: Array.from(roomSet) } as any;
                        });
                      }}
                    />
                    <span className="text-sm">Room {r.doorNumber || (r as any).roomNumber || r.id} - {r.categoryName || 'Unknown'} - ${r.price}</span>
                  </label>
                );
              })}
            </div>
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
