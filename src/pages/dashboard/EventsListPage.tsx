import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, Column } from "@/components/ui/data-table";
import { FormModal, FormField, ViewModal, DetailRow, ConfirmDialog } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Plus, Calendar as CalendarIcon, Table2, Eye, Trash2, CheckCircle, XCircle,
    Loader2, ShieldCheck, MoreHorizontal, Edit, Printer, RefreshCw,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import {
    getEvents,
    getEventHalls,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    checkEventAvailability,
} from "@/services/eventService";
import { Event, EventHall, PaginatedResponse } from "@/types/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";

const statusColors: Record<string, "info" | "success" | "secondary" | "destructive"> = {
    upcoming: "info",
    ongoing: "success",
    completed: "secondary",
    cancelled: "destructive",
};

export default function EventsListPage() {
    const eventsApi = useApi<PaginatedResponse<Event>>();
    const hallsApi = useApi<PaginatedResponse<EventHall>>();
    const mutationApi = useApi<Event | null>({ showSuccessToast: true });

    const [events, setEvents] = useState<Event[]>([]);
    const [halls, setHalls] = useState<EventHall[]>([]);
    const [activeTab, setActiveTab] = useState<"table" | "calendar">("table");

    // Booking modal
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [viewEvent, setViewEvent] = useState<Event | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Status update modal
    const [statusDialog, setStatusDialog] = useState<{ open: boolean; id: string; currentStatus: Event['status'] }>({ open: false, id: "", currentStatus: "upcoming" });
    const [selectedStatus, setSelectedStatus] = useState<Event['status']>("upcoming");

    // Availability check
    const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'conflict'>('idle');
    const [availabilityMessage, setAvailabilityMessage] = useState('');

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

    // Calendar state
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [dayEventsModalOpen, setDayEventsModalOpen] = useState(false);
    const [dayEvents, setDayEvents] = useState<Event[]>([]);

    // Flatpickr refs
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const startPickerRef = useRef<flatpickr.Instance | null>(null);
    const endPickerRef = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
        fetchEvents();
        fetchHalls();
    }, []);

    // Initialize flatpickr when booking modal opens
    useEffect(() => {
        if (bookingModalOpen) {
            requestAnimationFrame(() => {
                if (startDateRef.current) {
                    startPickerRef.current = flatpickr(startDateRef.current, {
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                        minDate: "today",
                        time_24hr: true,
                        allowInput: false,
                        static: true,
                        clickOpens: true,
                        onChange: (_selectedDates, dateStr) => {
                            setBookingForm(prev => ({ ...prev, startDate: dateStr }));
                            setAvailabilityStatus('idle');
                            setAvailabilityMessage('');
                        },
                    });
                }
                if (endDateRef.current) {
                    endPickerRef.current = flatpickr(endDateRef.current, {
                        enableTime: true,
                        dateFormat: "Y-m-d H:i",
                        minDate: "today",
                        static: true,
                        time_24hr: true,
                        allowInput: false,
                        clickOpens: true,
                        onChange: (_selectedDates, dateStr) => {
                            setBookingForm(prev => ({ ...prev, endDate: dateStr }));
                            setAvailabilityStatus('idle');
                            setAvailabilityMessage('');
                        },
                    });
                }
            });
        }

        return () => {
            startPickerRef.current?.destroy();
            endPickerRef.current?.destroy();
            startPickerRef.current = null;
            endPickerRef.current = null;
        };
    }, [bookingModalOpen]);

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

    const resetBookingForm = () => {
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
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
    };

    const handleHallChange = (hallId: string) => {
        setBookingForm(prev => ({ ...prev, hallId }));
        setAvailabilityStatus('idle');
        setAvailabilityMessage('');
    };

    const handleCheckAvailability = async () => {
        if (!bookingForm.hallId || !bookingForm.startDate || !bookingForm.endDate) return;

        setAvailabilityStatus('checking');
        setAvailabilityMessage('');

        try {
            const response = await checkEventAvailability({
                hallId: bookingForm.hallId,
                startDate: bookingForm.startDate,
                endDate: bookingForm.endDate,
                chargeType: bookingForm.chargeType,
            });

            if (response.success) {
                setAvailabilityStatus('available');
                setAvailabilityMessage(response.message || 'The hall is available for the selected dates!');
            } else {
                setAvailabilityStatus('conflict');
                setAvailabilityMessage(response.message || 'This hall is already booked for the selected dates.');
            }
        } catch {
            setAvailabilityStatus('conflict');
            setAvailabilityMessage('An error occurred while checking availability.');
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEventId(event.id);
        setBookingForm({
            hallId: event.hallId,
            clientName: event.clientName,
            clientEmail: event.clientEmail,
            clientPhone: event.clientPhone,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            chargeType: event.chargeType,
            notes: "", // Notes are not currently in Event type, so empty
        });
        setAvailabilityStatus('idle'); // Or 'available' if we assume current booking is valid
        setBookingModalOpen(true);
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

        let response;
        if (editingEventId) {
            response = await mutationApi.execute(() => updateEvent(editingEventId, eventData));
        } else {
            response = await mutationApi.execute(() => createEvent(eventData));
        }

        if (response.success) {
            fetchEvents();
            setBookingModalOpen(false);
            resetBookingForm();
        }
    };

    const handleDelete = async () => {
        const response = await mutationApi.execute(() => deleteEvent(deleteDialog.id));
        if (response.success) {
            fetchEvents();
        }
        setDeleteDialog({ open: false, id: "" });
    };

    const handleStatusUpdate = async () => {
        if (!statusDialog.id || !selectedStatus) return;
        console.log(statusDialog.id, selectedStatus);
        const response = await mutationApi.execute(() => updateEventStatus(statusDialog.id, selectedStatus));
        if (response.success) {
            fetchEvents();
        }
        setStatusDialog({ open: false, id: "", currentStatus: "upcoming" });
    };

    const calculateEstimate = () => {
        const hall = halls.find(h => h.id === bookingForm.hallId);
        if (!hall || !bookingForm.startDate || !bookingForm.endDate) return 0;

        const start = new Date(bookingForm.startDate);
        const end = new Date(bookingForm.endDate);
        const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
        const days = Math.max(1, Math.ceil(hours / 24));

        return bookingForm.chargeType === "daily" ? hall.dailyRate * days : hall.hourlyRate * hours;
    };

    const canCheckAvailability = bookingForm.hallId && bookingForm.startDate && bookingForm.endDate;

    // Calendar helpers
    const getEventDates = (): Date[] => {
        const dates: Date[] = [];
        events.forEach(event => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            // Add all dates from start to end
            const current = new Date(start);
            current.setHours(0, 0, 0, 0);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
        });
        return dates;
    };

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        const dayStr = day.toISOString().split('T')[0];
        const eventsOnDay = events.filter(event => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return day >= start && day <= end;
        });
        if (eventsOnDay.length > 0) {
            setDayEvents(eventsOnDay);
            setDayEventsModalOpen(true);
        }
    };

    // Mark dates with events
    const eventDates = getEventDates();
    const modifiers = {
        hasEvent: eventDates,
    };
    const modifiersStyles = {
        hasEvent: {
            backgroundColor: 'hsl(var(--primary) / 0.15)',
            borderRadius: '50%',
            fontWeight: 700,
            color: 'hsl(var(--primary))',
        },
    };

    const columns: Column<Event>[] = [
        {
            key: "eventNumber",
            header: "Event #",
            sortable: true,
            searchable: true,
            render: (_, event) => (
                <span className="font-medium text-foreground">{event.eventNumber || "N/A"}</span>
            ),
        },
        {
            key: "eventType",
            header: "Event Type",
            sortable: true,
            render: (_, event) => (
                <span className="font-medium text-foreground">{event.eventType}</span>
            ),
        },
        {
            key: "clientName",
            header: "Client",
            sortable: true,
            searchable: true,
        },
        {
            key: "hallName",
            header: "Hall",
            render: (_, event) => (
                <span>{event.hallName || halls.find(h => h.id === event.hallId)?.name || "N/A"}</span>
            ),
        },
        {
            key: "startDate",
            header: "Start Date",
            sortable: true,
            render: (_, event) => (
                <span className="text-sm">{new Date(event.startDate).toLocaleString()}</span>
            ),
        },
        {
            key: "endDate",
            header: "End Date",
            sortable: true,
            render: (_, event) => (
                <span className="text-sm">{new Date(event.endDate).toLocaleString()}</span>
            ),
        },
        {
            key: "chargeType",
            header: "Charge",
            render: (_, event) => (
                <Badge variant="secondary" className="capitalize">{event.chargeType}</Badge>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, event) => (
                <Badge variant={statusColors[event.status]}>{event.status}</Badge>
            ),
        },
        {
            key: "totalAmount",
            header: "Amount",
            sortable: true,
            render: (_, event) => (
                <span className="text-primary font-semibold">₦{event.totalAmount?.toLocaleString()}</span>
            ),
        },
    ];

    const renderActions = (event: Event) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewEvent(event)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(event)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    setStatusDialog({ open: true, id: event.id, currentStatus: event.status });
                    setSelectedStatus(event.status);
                }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialog({ open: true, id: event.id })}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel Event
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="min-h-screen bg-background print:bg-white">
            <style type="text/css" media="print">
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #view-event-modal-content, #view-event-modal-content * {
                        visibility: visible;
                    }
                    #view-event-modal-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
                `}
            </style>
            <DashboardHeader
                title="Events List"
                subtitle="View and manage booked events"
            />

            <div className="p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Event Bookings</CardTitle>
                            <div className="flex items-center gap-2">
                                {/* Tab Switcher */}
                                <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                                    <Button
                                        variant={activeTab === "table" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setActiveTab("table")}
                                        className="gap-2"
                                    >
                                        <Table2 className="w-4 h-4" />
                                        Table
                                    </Button>
                                    <Button
                                        variant={activeTab === "calendar" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setActiveTab("calendar")}
                                        className="gap-2"
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                        Calendar
                                    </Button>
                                </div>
                                <Button onClick={() => setBookingModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Book Event
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activeTab === "table" ? (
                                <DataTable
                                    data={events}
                                    columns={columns}
                                    searchPlaceholder="Search events..."
                                    loading={eventsApi.isLoading}
                                    actions={renderActions}
                                />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(day) => day && handleDayClick(day)}
                                        modifiers={modifiers}
                                        modifiersStyles={modifiersStyles}
                                        className="rounded-md border shadow-sm p-4"
                                        classNames={{
                                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                            month: "space-y-4",
                                            table: "w-full border-collapse space-y-1",
                                            head_row: "flex",
                                            head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
                                            row: "flex w-full mt-2",
                                            cell: "h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                            day: "h-12 w-12 p-0 font-normal text-base",
                                            caption_label: "text-lg font-semibold",
                                        }}
                                    />
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Click on a highlighted date to view events
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Event Booking Modal */}
            <FormModal
                open={bookingModalOpen}
                onOpenChange={(open) => {
                    setBookingModalOpen(open);
                    if (!open) resetBookingForm();
                }}
                title={editingEventId ? "Edit Event" : "Book Event"}
                description={editingEventId ? "Update event details" : "Schedule a new event"}
                onSubmit={handleBookingSubmit}
                submitLabel={editingEventId ? "Update Event" : "Book Event"}
                size="lg"
                isLoading={mutationApi.isLoading}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setBookingModalOpen(false);
                                resetBookingForm();
                            }}
                            disabled={mutationApi.isLoading}
                        >
                            Cancel
                        </Button>

                        {availabilityStatus !== 'available' ? (
                            <Button
                                type="button"
                                variant="hero"
                                onClick={handleCheckAvailability}
                                disabled={!canCheckAvailability || availabilityStatus === 'checking'}
                            >
                                {availabilityStatus === 'checking' ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                                ) : (
                                    <><ShieldCheck className="w-4 h-4 mr-2" /> Check Availability</>
                                )}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="hero"
                                disabled={mutationApi.isLoading}
                            >
                                {mutationApi.isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4 mr-2" /> {editingEventId ? "Update Event" : "Book Event"}</>
                                )}
                            </Button>
                        )}
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label="Event Hall" required>
                        <Select value={bookingForm.hallId} onValueChange={handleHallChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select hall" />
                            </SelectTrigger>
                            <SelectContent>
                                {halls.map((h) => (
                                    <SelectItem key={h.id} value={h.id.toString()}>
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
                        <FormField label="Start Date & Time" required>
                            <Input
                                ref={startDateRef}
                                placeholder="Pick start date & time"
                                readOnly
                                className="cursor-pointer bg-background"
                            />
                        </FormField>
                        <FormField label="End Date & Time" required>
                            <Input
                                ref={endDateRef}
                                placeholder="Pick end date & time"
                                readOnly
                                className="cursor-pointer bg-background"
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

                    {/* Availability Status Banner */}
                    {availabilityStatus === 'available' && (
                        <Card className="border-green-500/50 bg-green-500/10 p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">Available!</p>
                                    <p className="text-xs text-green-600/80 dark:text-green-400/80">{availabilityMessage}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {availabilityStatus === 'conflict' && (
                        <Card className="border-destructive/50 bg-destructive/10 p-4">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-destructive">Not Available</p>
                                    <p className="text-xs text-destructive/80">{availabilityMessage}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Estimated Total - Readonly */}
                    <FormField label="Estimated Total">
                        <Input
                            readOnly
                            value={`₦${calculateEstimate()?.toLocaleString()}`}
                            className="bg-secondary/50 text-primary font-bold text-lg cursor-default"
                        />
                    </FormField>
                </div>
            </FormModal>

            {/* View Event Modal */}
            <ViewModal
                open={!!viewEvent}
                onOpenChange={() => setViewEvent(null)}
                title="Event Details"
            >
                <div id="view-event-modal-content">
                    {viewEvent && (
                        <div className="space-y-4">
                            <DetailRow label="Event Number" value={viewEvent.eventNumber || 'N/A'} />
                            <DetailRow label="Event Type" value={viewEvent.eventType} />
                            <DetailRow label="Client" value={viewEvent.clientName} />
                            <DetailRow label="Email" value={viewEvent.clientEmail} />
                            <DetailRow label="Phone" value={viewEvent.clientPhone} />
                            <DetailRow label="Hall" value={viewEvent.hallName || halls.find(h => h.id === viewEvent.hallId)?.name || 'N/A'} />
                            <DetailRow label="Start Date" value={new Date(viewEvent.startDate).toLocaleString()} />
                            <DetailRow label="End Date" value={new Date(viewEvent.endDate).toLocaleString()} />
                            <DetailRow label="Charge Type" value={<Badge variant="secondary" className="capitalize">{viewEvent.chargeType}</Badge>} />
                            <DetailRow label="Status" value={<Badge variant={statusColors[viewEvent.status]}>{viewEvent.status}</Badge>} />
                            <DetailRow label="Total Amount" value={<span className="text-primary font-bold text-lg">₦{viewEvent.totalAmount?.toLocaleString()}</span>} />
                        </div>
                    )}
                    {viewEvent && (
                        <div className="mt-6 flex justify-end print:hidden">
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Details
                            </Button>
                        </div>
                    )}
                </div>
            </ViewModal>

            {/* Day Events Modal (Calendar Click) */}
            <ViewModal
                open={dayEventsModalOpen}
                onOpenChange={setDayEventsModalOpen}
                title={`Events on ${selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            >
                <div className="space-y-3">
                    {dayEvents.map(event => (
                        <Card key={event.id} className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => { setDayEventsModalOpen(false); setViewEvent(event); }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground">{event.eventType} <span className="text-xs text-muted-foreground">({event.eventNumber || 'N/A'})</span></span>
                                <Badge variant={statusColors[event.status]}>{event.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Client: {event.clientName}</p>
                                <p>Hall: {event.hallName || halls.find(h => h.id === event.hallId)?.name || 'N/A'}</p>
                                <p>Time: {new Date(event.startDate).toLocaleTimeString()} – {new Date(event.endDate).toLocaleTimeString()}</p>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                                <span className="text-primary font-bold">₦{event.totalAmount?.toLocaleString()}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </ViewModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                title="Cancel Event"
                description="Are you sure you want to cancel this event booking? This action cannot be undone."
                onConfirm={handleDelete}
                variant="destructive"
                isLoading={mutationApi.isLoading}
            />

            {/* Update Status Modal */}
            <FormModal
                open={statusDialog.open}
                onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}
                title="Update Event Status"
                description="Change the status of this event"
                onSubmit={handleStatusUpdate}
                submitLabel="Update Status"
                isLoading={mutationApi.isLoading}
            >
                <div className="space-y-4">
                    <FormField label="Event Status" required>
                        <Select value={selectedStatus} onValueChange={(v: Event['status']) => setSelectedStatus(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            </FormModal>
        </div>
    );
}
