import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormModal, FormField, ViewModal, DetailRow, ConfirmDialog } from "@/components/forms";
import { DataTable, Column } from "@/components/ui/data-table";
import { 
  Plus, Edit, Trash, Eye, UserCog, Building2, Mail, Phone, Shield,
  MoreVertical
} from "lucide-react";
import { hotels } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  hotelId: string;
  hotelName: string;
  status: "active" | "inactive" | "suspended";
  avatar: string;
  createdAt: string;
  lastLogin: string;
}

const initialSubAdmins: SubAdmin[] = [
  {
    id: "sa1",
    name: "Hotel Admin",
    email: "admin@luxestay.com",
    phone: "+1 555-0102",
    hotelId: "h1",
    hotelName: "LuxeStay Grand Palace",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
  },
  {
    id: "sa2",
    name: "Marina Bay Admin",
    email: "marina@luxestay.com",
    phone: "+1 555-0103",
    hotelId: "h2",
    hotelName: "LuxeStay Marina Bay",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-19",
  },
  {
    id: "sa3",
    name: "Mountain Admin",
    email: "mountain@luxestay.com",
    phone: "+1 555-0104",
    hotelId: "h3",
    hotelName: "LuxeStay Mountain Retreat",
    status: "inactive",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    createdAt: "2024-01-10",
    lastLogin: "2024-01-15",
  },
];

export default function HotelAdminsPage() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>(initialSubAdmins);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hotelId: "",
    password: "",
  });

  const columns: Column<SubAdmin>[] = [
    {
      key: "name",
      header: "Admin",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.avatar} alt={row.name} />
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
          <span>{value}</span>
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
      key: "lastLogin",
      header: "Last Login",
    },
  ];

  const handleAdd = () => {
    // API Placeholder: POST /api/sub-admins
    const newAdmin: SubAdmin = {
      id: `sa${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      hotelId: formData.hotelId,
      hotelName: hotels.find(h => h.id === formData.hotelId)?.name || "",
      status: "active",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "-",
    };
    setSubAdmins([...subAdmins, newAdmin]);
    setShowAddModal(false);
    resetForm();
    toast.success("Sub-Admin created successfully");
  };

  const handleEdit = () => {
    if (!selectedAdmin) return;
    // API Placeholder: PUT /api/sub-admins/:id
    setSubAdmins(subAdmins.map(admin => 
      admin.id === selectedAdmin.id 
        ? { 
            ...admin, 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            hotelId: formData.hotelId,
            hotelName: hotels.find(h => h.id === formData.hotelId)?.name || admin.hotelName,
          }
        : admin
    ));
    setShowEditModal(false);
    resetForm();
    toast.success("Sub-Admin updated successfully");
  };

  const handleDelete = () => {
    if (!selectedAdmin) return;
    // API Placeholder: DELETE /api/sub-admins/:id
    setSubAdmins(subAdmins.filter(admin => admin.id !== selectedAdmin.id));
    setShowDeleteDialog(false);
    toast.success("Sub-Admin deleted successfully");
  };

  const openEdit = (admin: SubAdmin) => {
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

  const openView = (admin: SubAdmin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const openDelete = (admin: SubAdmin) => {
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

  const toggleStatus = (admin: SubAdmin) => {
    // API Placeholder: PATCH /api/sub-admins/:id/status
    const newStatus = admin.status === "active" ? "suspended" : "active";
    setSubAdmins(subAdmins.map(a => 
      a.id === admin.id ? { ...a, status: newStatus } : a
    ));
    toast.success(`Admin ${newStatus === "active" ? "activated" : "suspended"}`);
  };

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
            { label: "Total Admins", value: subAdmins.length, icon: UserCog },
            { label: "Active", value: subAdmins.filter(a => a.status === "active").length, icon: Shield },
            { label: "Hotels Managed", value: new Set(subAdmins.map(a => a.hotelId)).size, icon: Building2 },
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

        {/* Data Table */}
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
              <DataTable
                data={subAdmins}
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
            </CardContent>
          </Card>
        </motion.div>
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
                <AvatarImage src={selectedAdmin.avatar} alt={selectedAdmin.name} />
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
              <DetailRow label="Assigned Hotel" value={selectedAdmin.hotelName} />
              <DetailRow label="Created At" value={selectedAdmin.createdAt} />
              <DetailRow label="Last Login" value={selectedAdmin.lastLogin} />
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
      />
    </div>
  );
}
