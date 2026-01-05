import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, PartyPopper, Calendar, Clock, Users, DollarSign, MapPin, Edit, Trash, MoreVertical, Eye } from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { 
  getEvents, 
  getEventHalls, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  createEventHall,
  updateEventHall,
  deleteEventHall
} from "@/services/eventService";
import { Event, EventHall, PaginatedResponse } from "@/types/api";

const statusColors: Record<string, "info" | "success" | "secondary" | "destructive"> = {
  upcoming: "info",
  ongoing: "success",
  completed: "secondary",
  cancelled: "destructive",
};

export default function EventsPage() {
  // API States
  const eventsApi = useApi<PaginatedResponse<Event>>();
  const hallsApi = useApi<PaginatedResponse<EventHall>>();
  const mutationApi = useApi<Event | EventHall | null>({ showSuccessToast: true });

  // Local state
  const [events, setEvents] = useState<Event[]>([]);
  const [halls, setHalls] = useState<EventHall[]>([]);
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventHall | null>(null);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "category" | "booking"; id: string }>({ open: false, type: "category", id: "" });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    capacity: "",
    hourlyRate: "",
    dailyRate: "",
  });

  const [bookingForm, setBookingForm] = useState({
    hallId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    eventType: "",
    startDate: "",
    endDate: "",
    chargeType: "daily" as "hourly" | "daily",
    notes: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchEvents();
    fetchHalls();
  }, []);

  const fetchEvents = async () => {
    const response = await eventsApi.execute(() => getEvents());
    if (response.success && response.data) {
      setEvents(response.data.items);
    }
  };

  const fetchHalls = async () => {
    const response = await hallsApi.execute(() => getEventHalls());
    if (response.success && response.data) {
      setHalls(response.data.items);
    }
  };

  const openCategoryModal = (category?: EventHall) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        capacity: category.capacity.toString(),
        hourlyRate: category.hourlyRate.toString(),
        dailyRate: category.dailyRate.toString(),
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", capacity: "", hourlyRate: "", dailyRate: "" });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async () => {
    const hallData = {
      name: categoryForm.name,
      capacity: parseInt(categoryForm.capacity),
      hourlyRate: parseFloat(categoryForm.hourlyRate),
      dailyRate: parseFloat(categoryForm.dailyRate),
      amenities: [],
      image: '',
    };

    if (editingCategory) {
      const response = await mutationApi.execute(() => updateEventHall(editingCategory.id, hallData));
      if (response.success) {
        fetchHalls();
        setCategoryModalOpen(false);
      }
    } else {
      const response = await mutationApi.execute(() => createEventHall(hallData));
      if (response.success) {
        fetchHalls();
        setCategoryModalOpen(false);
      }
    }
  };

  const handleBookingSubmit = async () => {
    const eventData = {
      hallId: bookingForm.hallId,
      clientName: bookingForm.clientName,
      clientEmail: bookingForm.clientEmail,
      clientPhone: bookingForm.clientPhone,
      eventType: bookingForm.eventType,
      startDate: bookingForm.startDate,
      endDate: bookingForm.endDate,
      chargeType: bookingForm.chargeType,
    };

    const response = await mutationApi.execute(() => createEvent(eventData));
    if (response.success) {
      fetchEvents();
      setBookingModalOpen(false);
      setBookingForm({
        hallId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        eventType: "",
        startDate: "",
        endDate: "",
        chargeType: "daily",
        notes: "",
      });
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.type === "category") {
      const response = await mutationApi.execute(() => deleteEventHall(deleteDialog.id));
      if (response.success) {
        fetchHalls();
      }
    } else {
      const response = await mutationApi.execute(() => deleteEvent(deleteDialog.id));
      if (response.success) {
        fetchEvents();
      }
    }
    setDeleteDialog({ open: false, type: "category", id: "" });
  };

  const calculateEstimate = () => {
    const hall = halls.find(h => h.id === bookingForm.hallId);
    if (!hall || !bookingForm.startDate || !bookingForm.endDate) return 0;
    
    const start = new Date(bookingForm.startDate);
    const end = new Date(bookingForm.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    
    return bookingForm.chargeType === "daily" ? hall.dailyRate * days : hall.hourlyRate * 8 * days;
  };

  const isLoading = eventsApi.isLoading || hallsApi.isLoading;
  const hasError = eventsApi.error || hallsApi.error;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Event Center" subtitle="Manage event halls and bookings" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-10 bg-secondary border-border" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => openCategoryModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event Hall
            </Button>
            <Button variant="hero" onClick={() => setBookingModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Book Event
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading events..." />}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorState 
            message={eventsApi.error || hallsApi.error || 'Failed to load data'} 
            onRetry={() => { fetchEvents(); fetchHalls(); }} 
          />
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <>
            {/* Event Halls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Halls</CardTitle>
                </CardHeader>
                <CardContent>
                  {halls.length === 0 ? (
                    <EmptyState
                      icon={PartyPopper}
                      title="No event halls found"
                      description="Create your first event hall to start booking events"
                      action={
                        <Button onClick={() => openCategoryModal()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Event Hall
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {halls.map((hall) => (
                        <Card key={hall.id} variant="gold" className="p-6 hover-lift relative group">
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
                              <DropdownMenuItem onClick={() => openCategoryModal(hall)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteDialog({ open: true, type: "category", id: hall.id })}
                              >
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <PartyPopper className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{hall.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-3 h-3" />
                                Up to {hall.capacity} guests
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground">Hourly</p>
                              <p className="text-lg font-bold text-primary">${hall.hourlyRate}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground">Daily</p>
                              <p className="text-lg font-bold text-primary">${hall.dailyRate}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4" onClick={() => setBookingModalOpen(true)}>
                            Check Availability
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Event Bookings</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">All</Button>
                    <Button variant="ghost" size="sm">Upcoming</Button>
                    <Button variant="ghost" size="sm">Past</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {events.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No events booked"
                      description="Book your first event to get started"
                      action={
                        <Button onClick={() => setBookingModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Book Event
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => {
                        const hall = halls.find((h) => h.id === event.hallId);
                        return (
                          <Card key={event.id} variant="elevated" className="p-4 hover-lift">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl gold-gradient flex flex-col items-center justify-center text-primary-foreground">
                                  <span className="text-lg font-bold">
                                    {new Date(event.startDate).getDate()}
                                  </span>
                                  <span className="text-xs">
                                    {new Date(event.startDate).toLocaleString("default", { month: "short" })}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-foreground">{event.eventType}</h3>
                                    <Badge variant={statusColors[event.status]}>{event.status}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{event.clientName}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {hall?.name || event.hallName}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {event.startDate} - {event.endDate}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {event.chargeType}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Total Amount</p>
                                  <p className="text-xl font-bold text-primary">${event.totalAmount.toLocaleString()}</p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Actions</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setViewEvent(event)}>
                                      <Eye className="w-4 h-4 mr-2" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => setDeleteDialog({ open: true, type: "booking", id: event.id })}
                                    >
                                      <Trash className="w-4 h-4 mr-2" /> Cancel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Event Hall Modal */}
      <FormModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        title={editingCategory ? "Edit Event Hall" : "Add Event Hall"}
        description="Configure event space details and pricing"
        onSubmit={handleCategorySubmit}
        submitLabel={editingCategory ? "Update Hall" : "Add Hall"}
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Hall Name" required>
            <Input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g., Grand Ballroom"
            />
          </FormField>
          <FormField label="Capacity" required>
            <Input
              type="number"
              value={categoryForm.capacity}
              onChange={(e) => setCategoryForm({ ...categoryForm, capacity: e.target.value })}
              placeholder="Maximum guests"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hourly Rate" required>
              <Input
                type="number"
                value={categoryForm.hourlyRate}
                onChange={(e) => setCategoryForm({ ...categoryForm, hourlyRate: e.target.value })}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Daily Rate" required>
              <Input
                type="number"
                value={categoryForm.dailyRate}
                onChange={(e) => setCategoryForm({ ...categoryForm, dailyRate: e.target.value })}
                placeholder="0.00"
              />
            </FormField>
          </div>
        </div>
      </FormModal>

      {/* Event Booking Modal */}
      <FormModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        title="Book Event"
        description="Schedule a new event"
        onSubmit={handleBookingSubmit}
        submitLabel="Book Event"
        size="lg"
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Event Hall" required>
            <Select value={bookingForm.hallId} onValueChange={(v) => setBookingForm({ ...bookingForm, hallId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select hall" />
              </SelectTrigger>
              <SelectContent>
                {halls.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name} - Capacity: {h.capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required>
              <Input
                value={bookingForm.clientName}
                onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                placeholder="Client or company name"
              />
            </FormField>
            <FormField label="Event Type" required>
              <Input
                value={bookingForm.eventType}
                onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })}
                placeholder="e.g., Wedding, Conference"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client Email" required>
              <Input
                type="email"
                value={bookingForm.clientEmail}
                onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </FormField>
            <FormField label="Client Phone" required>
              <Input
                value={bookingForm.clientPhone}
                onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                placeholder="+1 555-0100"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input
                type="date"
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="End Date" required>
              <Input
                type="date"
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Charge Type" required>
            <Select 
              value={bookingForm.chargeType} 
              onValueChange={(v: "hourly" | "daily") => setBookingForm({ ...bookingForm, chargeType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Per Hour</SelectItem>
                <SelectItem value="daily">Per Day</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Notes">
            <Textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              placeholder="Special requirements..."
              rows={2}
            />
          </FormField>
          <Card variant="glass" className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Estimated Total</span>
              <span className="text-xl font-bold text-primary">${calculateEstimate()}</span>
            </div>
          </Card>
        </div>
      </FormModal>

      {/* View Event Modal */}
      <ViewModal
        open={!!viewEvent}
        onOpenChange={() => setViewEvent(null)}
        title="Event Details"
      >
        {viewEvent && (
          <div className="space-y-4">
            <DetailRow label="Event Type" value={viewEvent.eventType} />
            <DetailRow label="Client" value={viewEvent.clientName} />
            <DetailRow label="Email" value={viewEvent.clientEmail} />
            <DetailRow label="Phone" value={viewEvent.clientPhone} />
            <DetailRow label="Hall" value={viewEvent.hallName || halls.find(h => h.id === viewEvent.hallId)?.name || 'N/A'} />
            <DetailRow label="Start Date" value={viewEvent.startDate} />
            <DetailRow label="End Date" value={viewEvent.endDate} />
            <DetailRow label="Charge Type" value={viewEvent.chargeType} />
            <DetailRow label="Status" value={<Badge variant={statusColors[viewEvent.status]}>{viewEvent.status}</Badge>} />
            <DetailRow label="Total Amount" value={<span className="text-primary font-bold">${viewEvent.totalAmount.toLocaleString()}</span>} />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={deleteDialog.type === "category" ? "Delete Event Hall" : "Cancel Event"}
        description={deleteDialog.type === "category" 
          ? "Are you sure you want to delete this event hall? This action cannot be undone."
          : "Are you sure you want to cancel this event booking? This action cannot be undone."
        }
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
