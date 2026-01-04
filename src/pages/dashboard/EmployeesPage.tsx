import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState, EmptyState, StatsSkeleton } from "@/components/ui/loading-state";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import {
  Plus, Search, Filter, Users, MoreVertical,
  Edit, Trash, Eye, Shield, UserCog, Check
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeePermissions,
  getEmployeeStats,
  Employee,
  Permission,
  CreateEmployeeRequest,
} from "@/services/employeeService";
import { getHotels } from "@/services/hotelService";
import { Hotel } from "@/types/api";

// Role options
const roleOptions = [
  { value: "manager", label: "Manager" },
  { value: "receptionist", label: "Receptionist" },
  { value: "housekeeper", label: "Housekeeper" },
  { value: "maintenance", label: "Maintenance" },
  { value: "chef", label: "Chef" },
  { value: "waiter", label: "Waiter" },
  { value: "security", label: "Security" },
];

const roleLabels: Record<string, string> = {
  manager: "Manager",
  receptionist: "Receptionist",
  housekeeper: "Housekeeper",
  maintenance: "Maintenance",
  chef: "Chef",
  waiter: "Waiter",
  security: "Security",
};

const defaultPermissions: Permission[] = [
  { module: "Dashboard", canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: "Bookings", canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: "Guests", canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: "Rooms", canView: true, canCreate: false, canEdit: false, canDelete: false },
  { module: "Reports", canView: false, canCreate: false, canEdit: false, canDelete: false },
];

export default function EmployeesPage() {
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; managers: number; departments: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    hotelId: "",
    password: "",
  });
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [empRes, hotelsRes, statsRes] = await Promise.all([
        getEmployees({ page: 1, limit: 100, search: searchQuery }),
        getHotels({ page: 1, limit: 100 }),
        getEmployeeStats(),
      ]);

      if (empRes.success) {
        setEmployees(empRes.data.items);
      } else {
        setError(empRes.message);
      }

      if (hotelsRes.success) {
        setHotels(hotelsRes.data.items);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = async () => {
    setIsSubmitting(true);
    
    try {
      const data: CreateEmployeeRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        hotelId: formData.hotelId,
        password: formData.password,
      };

      const response = await createEmployee(data);

      if (response.success) {
        toast.success("Employee added successfully");
        setShowAddModal(false);
        resetForm();
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

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    
    try {
      const response = await updateEmployee(selectedEmployee.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        hotelId: formData.hotelId,
      });

      if (response.success) {
        toast.success("Employee updated successfully");
        setShowEditModal(false);
        resetForm();
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

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    
    try {
      const response = await deleteEmployee(selectedEmployee.id);

      if (response.success) {
        toast.success("Employee removed successfully");
        setShowDeleteDialog(false);
        setSelectedEmployee(null);
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

  const handleSavePermissions = async () => {
    if (!selectedEmployee) return;
    setIsSubmitting(true);
    
    try {
      const response = await updateEmployeePermissions(selectedEmployee.id, permissions);

      if (response.success) {
        toast.success("Permissions updated successfully");
        setShowPermissionsModal(false);
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

  const togglePermission = (moduleIndex: number, permType: keyof Omit<Permission, "module">) => {
    setPermissions(
      permissions.map((perm, idx) =>
        idx === moduleIndex ? { ...perm, [permType]: !perm[permType] } : perm
      )
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      hotelId: "",
      password: "",
    });
    setSelectedEmployee(null);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      hotelId: employee.hotelId || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPermissions(employee.permissions?.length > 0 ? [...employee.permissions] : [...defaultPermissions]);
    setShowPermissionsModal(true);
  };

  const statusColors = {
    active: "success",
    inactive: "secondary",
    suspended: "destructive",
  } as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Employee Management" subtitle="Manage staff, roles, and permissions" />
        <div className="p-6 space-y-6">
          <StatsSkeleton count={4} />
          <Card>
            <CardContent className="py-12">
              <LoadingState message="Loading employees..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title="Employee Management"
        subtitle="Manage staff, roles, and permissions"
      />

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
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="hero" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
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
            { label: "Total Employees", value: stats?.total ?? employees.length, icon: Users },
            { label: "Active", value: stats?.active ?? employees.filter((e) => e.status === "active").length, icon: Check },
            { label: "Managers", value: stats?.managers ?? employees.filter((e) => e.role === "manager").length, icon: UserCog },
            { label: "Departments", value: stats?.departments ?? new Set(employees.map((e) => e.department)).size, icon: Shield },
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

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Employees</CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <EmptyState
                  title="Error loading employees"
                  description={error}
                  action={<Button variant="outline" onClick={fetchData}>Retry</Button>}
                />
              ) : filteredEmployees.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No employees found"
                  description={searchQuery ? "Try adjusting your search" : "Add your first employee to get started"}
                  action={!searchQuery ? <Button variant="outline" onClick={() => setShowAddModal(true)}>Add Employee</Button> : undefined}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {employee.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">{employee.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary">{roleLabels[employee.role] || employee.role}</Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground">{employee.department}</td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{employee.phone}</td>
                          <td className="py-4 px-4">
                            <Badge variant={statusColors[employee.status]}>{employee.status}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setShowViewModal(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(employee)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openPermissionsModal(employee)}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Employee Modal */}
      <FormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Employee"
        description="Fill in the employee details"
        onSubmit={handleAddEmployee}
        submitLabel="Add Employee"
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="text"
            name="name"
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            required
          />
          <FormField
            type="email"
            name="email"
            label="Email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />
          <FormField
            type="tel"
            name="phone"
            label="Phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            required
          />
          <FormField
            type="select"
            name="role"
            label="Role"
            options={roleOptions}
            placeholder="Select role"
            value={formData.role}
            onChange={(v) => setFormData({ ...formData, role: v })}
            required
          />
          <FormField
            type="text"
            name="department"
            label="Department"
            placeholder="Enter department"
            value={formData.department}
            onChange={(v) => setFormData({ ...formData, department: v })}
            required
          />
          <FormField
            type="select"
            name="hotel"
            label="Assigned Hotel"
            options={hotels.map((h) => ({ value: h.id, label: h.name }))}
            placeholder="Select hotel"
            value={formData.hotelId}
            onChange={(v) => setFormData({ ...formData, hotelId: v })}
            required
          />
          <div className="md:col-span-2">
            <FormField
              type="password"
              name="password"
              label="Initial Password"
              placeholder="Enter initial password"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              required
            />
          </div>
        </div>
      </FormModal>

      {/* Edit Employee Modal */}
      <FormModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Employee"
        description="Update employee details"
        onSubmit={handleEditEmployee}
        submitLabel="Save Changes"
        isLoading={isSubmitting}
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
            label="Email"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />
          <FormField
            type="tel"
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={(v) => setFormData({ ...formData, phone: v })}
            required
          />
          <FormField
            type="select"
            name="role"
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(v) => setFormData({ ...formData, role: v })}
            required
          />
          <FormField
            type="text"
            name="department"
            label="Department"
            value={formData.department}
            onChange={(v) => setFormData({ ...formData, department: v })}
            required
          />
        </div>
      </FormModal>

      {/* View Employee Modal */}
      <ViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        title="Employee Details"
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {selectedEmployee.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedEmployee.name}</h3>
                <Badge variant="secondary">{roleLabels[selectedEmployee.role] || selectedEmployee.role}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Email" value={selectedEmployee.email} />
              <DetailRow label="Phone" value={selectedEmployee.phone} />
              <DetailRow label="Department" value={selectedEmployee.department} />
              <DetailRow label="Status" value={selectedEmployee.status} />
              <DetailRow label="Join Date" value={selectedEmployee.joinDate} />
            </div>
          </div>
        )}
      </ViewModal>

      {/* Permissions Modal */}
      <FormModal
        open={showPermissionsModal}
        onOpenChange={setShowPermissionsModal}
        title="Manage Permissions"
        description={`Configure access permissions for ${selectedEmployee?.name}`}
        onSubmit={handleSavePermissions}
        submitLabel="Save Permissions"
        isLoading={isSubmitting}
        size="lg"
      >
        <div className="space-y-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Module</th>
                <th className="text-center py-2 text-sm font-medium text-muted-foreground">View</th>
                <th className="text-center py-2 text-sm font-medium text-muted-foreground">Create</th>
                <th className="text-center py-2 text-sm font-medium text-muted-foreground">Edit</th>
                <th className="text-center py-2 text-sm font-medium text-muted-foreground">Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={perm.module} className="border-b border-border/50">
                  <td className="py-3 text-foreground">{perm.module}</td>
                  <td className="py-3 text-center">
                    <Checkbox
                      checked={perm.canView}
                      onCheckedChange={() => togglePermission(idx, "canView")}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Checkbox
                      checked={perm.canCreate}
                      onCheckedChange={() => togglePermission(idx, "canCreate")}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Checkbox
                      checked={perm.canEdit}
                      onCheckedChange={() => togglePermission(idx, "canEdit")}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Checkbox
                      checked={perm.canDelete}
                      onCheckedChange={() => togglePermission(idx, "canDelete")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedEmployee(null);
        }}
        title="Remove Employee"
        description={`Are you sure you want to remove ${selectedEmployee?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteEmployee}
        variant="destructive"
      />
    </div>
  );
}
