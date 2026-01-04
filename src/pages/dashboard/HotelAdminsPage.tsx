import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormModal, FormField, ViewModal, DetailRow, ConfirmDialog } from "@/components/forms";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Plus, Edit, Trash, Eye, UserCog, Building2, Shield,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import {
  getHotelAdmins,
  createHotelAdmin,
  updateHotelAdmin,
  deleteHotelAdmin,
  updateHotelAdminStatus,
  getHotels,
} from "@/services/hotelService";
import { HotelAdmin, Hotel } from "@/types/api";

export default function HotelAdminsPage() {
  // API States
  const adminsApi = useApi<{ items: HotelAdmin[]; totalItems: number }>();
  const hotelsApi = useApi<{ items: Hotel[]; totalItems: number }>();
  const mutationApi = useApi<HotelAdmin | null>({ showSuccessToast: true });

  // Local state
  const [admins, setAdmins] = useState<HotelAdmin[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<HotelAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hotelId: "",
    password: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAdmins();
    fetchHotels();
  }, []);

  const fetchAdmins = async () => {
    /**
     * GET /api/hotel-admins
     * Returns: { success: boolean, data: { items: HotelAdmin[], totalItems: number, ... }, message: string }
     */
    const response = await adminsApi.execute(() => getHotelAdmins());
    if (response.success && response.data) {
      setAdmins(response.data.items);
    }
  };

  const fetchHotels = async () => {
    /**
     * GET /api/hotels
     * Returns: { success: boolean, data: { items: Hotel[], totalItems: number, ... }, message: string }
     */
    const response = await hotelsApi.execute(() => getHotels());
    if (response.success && response.data) {
      setHotels(response.data.items);
    }
  };

  const columns: Column<HotelAdmin>[] = [
    {
      key: "name",
      header: "Admin",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`} alt={row.name} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "hotelName",
      header: "Assigned Hotel",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span>{value || '-'}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <Badge variant={
          value === "active" ? "success" :
          value === "suspended" ? "destructive" : "secondary"
        }>
          {value}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
    },
  ];

  const handleAdd = async () => {
    /**
     * POST /api/hotel-admins
     * Request: { hotelId, name, email, phone, password }
     */
    const response = await mutationApi.execute(() =>
      createHotelAdmin({
        hotelId: formData.hotelId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
    );
    if (response.success) {
      fetchAdmins();
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleEdit = async () => {
    if (!selectedAdmin) return;

    /**
     * PUT /api/hotel-admins/:id
     * Request: { hotelId?, name?, email?, phone? }
     */
    const response = await mutationApi.execute(() =>
      updateHotelAdmin(selectedAdmin.id, {
        hotelId: formData.hotelId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      })
    );
    if (response.success) {
      fetchAdmins();
      setShowEditModal(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    /**
     * DELETE /api/hotel-admins/:id
     */
    const response = await mutationApi.execute(() => deleteHotelAdmin(selectedAdmin.id));
    if (response.success) {
      fetchAdmins();
      setShowDeleteDialog(false);
    }
  };

  const openEdit = (admin: HotelAdmin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      hotelId: admin.hotelId,
      password: "",
    });
    setShowEditModal(true);
  };

  const openView = (admin: HotelAdmin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const openDelete = (admin: HotelAdmin) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      hotelId: "",
      password: "",
    });
    setSelectedAdmin(null);
  };

  const toggleStatus = async (admin: HotelAdmin) => {
    const newStatus = admin.status === "active" ? "suspended" : "active";

    /**
     * PUT /api/hotel-admins/:id/status
     * Request: { status: 'active' | 'inactive' | 'suspended' }
     */
    const response = await mutationApi.execute(() =>
      updateHotelAdminStatus(admin.id, newStatus)
    );
    if (response.success) {
      fetchAdmins();
    }
  };

  const isLoading = adminsApi.isLoading || hotelsApi.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Hotel Administrators"
        subtitle="Manage sub-admin accounts for all hotels"
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: "Total Admins", value: admins.length, icon: UserCog },
            { label: "Active", value: admins.filter(a => a.status === "active").length, icon: Shield },
            { label: "Hotels Managed", value: new Set(admins.map(a => a.hotelId)).size, icon: Building2 },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading administrators..." />}

        {/* Error State */}
        {adminsApi.error && !isLoading && (
          <ErrorState message={adminsApi.error} onRetry={fetchAdmins} />
        )}

        {/* Data Table */}
        {!isLoading && !adminsApi.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Sub-Admin Accounts</CardTitle>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sub-Admin
                </Button>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <EmptyState
                    icon={UserCog}
                    title="No administrators found"
                    description="Create your first hotel administrator to get started"
                    action={
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sub-Admin
                      </Button>
                    }
                  />
                ) : (
                  <DataTable
                    data={admins}
                    columns={columns}
                    searchPlaceholder="Search administrators..."
                    actions={(row) => (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openView(row)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(row)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(row)}>
                            <Shield className="w-4 h-4 mr-2" />
                            {row.status === "active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDelete(row)}
                            className="text-destructive"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Add Modal */}
      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add Sub-Admin"
        description="Create a new hotel administrator account"
        onSubmit={handleAdd}
        submitLabel="Create Admin"
        size="lg"
        isLoading={mutationApi.isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            required
          />
          <FormField
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />
          <FormField
            type="tel"
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            required
          />
          <FormField
            type="select"
            name="hotelId"
            label="Assign to Hotel"
            value={formData.hotelId}
            onChange={(v) => setFormData({ ...formData, hotelId: v })}
            options={hotels.map(h => ({ value: h.id, label: h.name }))}
            required
          />
          <div className="md:col-span-2">
            <FormField
              type="password"
              name="password"
              label="Temporary Password"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              placeholder="User will be asked to change on first login"
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Sub-Admin"
        description="Update administrator details"
        onSubmit={handleEdit}
        submitLabel="Save Changes"
        size="lg"
        isLoading={mutationApi.isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            required
          />
          <FormField
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />
          <FormField
            type="tel"
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            required
          />
          <FormField
            type="select"
            name="hotelId"
            label="Assign to Hotel"
            value={formData.hotelId}
            onChange={(v) => setFormData({ ...formData, hotelId: v })}
            options={hotels.map(h => ({ value: h.id, label: h.name }))}
            required
          />
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Administrator Details"
        size="lg"
      >
        {selectedAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAdmin.name)}&background=random`} alt={selectedAdmin.name} />
                <AvatarFallback className="text-lg">{selectedAdmin.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{selectedAdmin.name}</h3>
                <Badge variant={selectedAdmin.status === "active" ? "success" : "secondary"}>
                  {selectedAdmin.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <DetailRow label="Email" value={selectedAdmin.email} />
              <DetailRow label="Phone" value={selectedAdmin.phone} />
              <DetailRow label="Assigned Hotel" value={selectedAdmin.hotelName || '-'} />
              <DetailRow label="Created At" value={selectedAdmin.createdAt} />
            </div>
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Sub-Admin"
        description={`Are you sure you want to delete ${selectedAdmin?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
