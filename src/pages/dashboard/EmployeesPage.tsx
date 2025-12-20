import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import {
  Plus, Search, Filter, Users, Mail, Phone, MoreVertical,
  Edit, Trash, Eye, Shield, UserCog, Check, X
} from "lucide-react";
import {
  employees as initialEmployees,
  Employee,
  Permission,
  roleLabels,
  roleOptions,
  rolePermissionDefaults,
  defaultPermissions,
} from "@/data/employeeData";
import { hotels } from "@/data/mockData";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    hotelId: "h1",
  });
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newEmployee: Employee = {
      id: `emp${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role as any,
      hotelId: formData.hotelId,
      department: formData.department,
      status: "active",
      permissions: rolePermissionDefaults[formData.role] || defaultPermissions,
      joinDate: new Date().toISOString().split("T")[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
    };

    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);
    resetForm();
    toast.success("Employee added successfully");
    setIsLoading(false);
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role as any,
              department: formData.department,
            }
          : emp
      )
    );
    setShowEditModal(false);
    resetForm();
    toast.success("Employee updated successfully");
    setIsLoading(false);
  };

  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return;
    setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id));
    setShowDeleteDialog(false);
    setSelectedEmployee(null);
    toast.success("Employee removed successfully");
  };

  const handleSavePermissions = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, permissions } : emp
      )
    );
    setShowPermissionsModal(false);
    toast.success("Permissions updated successfully");
    setIsLoading(false);
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
      hotelId: "h1",
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
      hotelId: employee.hotelId || "h1",
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPermissions([...employee.permissions]);
    setShowPermissionsModal(true);
  };

  const statusColors = {
    active: "success",
    inactive: "secondary",
    suspended: "destructive",
  } as const;

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
            { label: "Total Employees", value: employees.length, icon: Users },
            { label: "Active", value: employees.filter((e) => e.status === "active").length, icon: Check },
            { label: "Managers", value: employees.filter((e) => e.role === "manager").length, icon: UserCog },
            { label: "Departments", value: new Set(employees.map((e) => e.department)).size, icon: Shield },
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
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary">{roleLabels[employee.role]}</Badge>
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
        isLoading={isLoading}
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
            value={formData.hotelId}
            onChange={(v) => setFormData({ ...formData, hotelId: v })}
            required
          />
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
        isLoading={isLoading}
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
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selectedEmployee.name}</h3>
                <Badge variant="secondary">{roleLabels[selectedEmployee.role]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <DetailRow label="Email" value={selectedEmployee.email} />
                <DetailRow label="Phone" value={selectedEmployee.phone} />
                <DetailRow label="Department" value={selectedEmployee.department} />
              </div>
              <div className="space-y-1">
                <DetailRow label="Status" value={<Badge variant={statusColors[selectedEmployee.status]}>{selectedEmployee.status}</Badge>} />
                <DetailRow label="Join Date" value={selectedEmployee.joinDate} />
                <DetailRow label="Hotel" value={hotels.find((h) => h.id === selectedEmployee.hotelId)?.name || "N/A"} />
              </div>
            </div>
          </div>
        )}
      </ViewModal>

      {/* Permissions Modal */}
      <FormModal
        open={showPermissionsModal}
        onOpenChange={setShowPermissionsModal}
        title={`Permissions - ${selectedEmployee?.name}`}
        description="Configure module access permissions"
        onSubmit={handleSavePermissions}
        submitLabel="Save Permissions"
        isLoading={isLoading}
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Module</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Create</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Read</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Update</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={perm.module} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{perm.module}</td>
                  {(["create", "read", "update", "delete"] as const).map((permType) => (
                    <td key={permType} className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePermission(idx, permType)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          perm[permType]
                            ? "bg-success/20 text-success"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {perm[permType] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Remove Employee"
        description={`Are you sure you want to remove ${selectedEmployee?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteEmployee}
        variant="danger"
      />
    </div>
  );
}
