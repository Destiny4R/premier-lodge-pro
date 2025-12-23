import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Building2, MoreVertical, Edit, Trash, Eye, Users } from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { hotels } from "@/data/mockData";

// =============================================
// API INTEGRATION PLACEHOLDER
// Replace mock data operations with actual API calls
// =============================================
// GET all departments:     GET /api/departments
// GET single department:   GET /api/departments/:id
// CREATE department:       POST /api/departments
// UPDATE department:       PUT /api/departments/:id
// DELETE department:       DELETE /api/departments/:id
// =============================================

export interface Department {
  id: string;
  name: string;
  description: string;
  hotelId: string;
  headOfDepartment?: string;
  employeeCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

// Mock Departments Data
const mockDepartments: Department[] = [
  { id: "dept1", name: "Front Office", description: "Guest check-in/out and reservations management", hotelId: "h1", headOfDepartment: "John Smith", employeeCount: 8, status: "active", createdAt: "2023-01-01" },
  { id: "dept2", name: "Housekeeping", description: "Room cleaning and laundry services", hotelId: "h1", headOfDepartment: "Mary Johnson", employeeCount: 15, status: "active", createdAt: "2023-01-01" },
  { id: "dept3", name: "Food & Beverage", description: "Restaurant and bar operations", hotelId: "h1", headOfDepartment: "Chef Michael", employeeCount: 12, status: "active", createdAt: "2023-01-01" },
  { id: "dept4", name: "Maintenance", description: "Building and equipment maintenance", hotelId: "h1", headOfDepartment: "Tom Wilson", employeeCount: 6, status: "active", createdAt: "2023-01-01" },
  { id: "dept5", name: "Security", description: "Guest and property security", hotelId: "h1", headOfDepartment: "James Brown", employeeCount: 10, status: "active", createdAt: "2023-01-01" },
  { id: "dept6", name: "Spa & Wellness", description: "Spa treatments and wellness programs", hotelId: "h2", headOfDepartment: "Sarah Lee", employeeCount: 5, status: "active", createdAt: "2023-02-15" },
  { id: "dept7", name: "Events & Banquets", description: "Event planning and management", hotelId: "h1", employeeCount: 4, status: "inactive", createdAt: "2023-03-01" },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    hotelId: "",
    headOfDepartment: "",
    status: "active",
  });

  // View Modal State
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  // Filter departments by search query
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for create/edit
  const openModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setDepartmentForm({
        name: department.name,
        description: department.description,
        hotelId: department.hotelId,
        headOfDepartment: department.headOfDepartment || "",
        status: department.status,
      });
    } else {
      setEditingDepartment(null);
      setDepartmentForm({ name: "", description: "", hotelId: "", headOfDepartment: "", status: "active" });
    }
    setModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = () => {
    // =============================================
    // API INTEGRATION PLACEHOLDER
    // Replace with: 
    // if (editingDepartment) {
    //   await api.put(`/api/departments/${editingDepartment.id}`, departmentForm);
    // } else {
    //   await api.post('/api/departments', departmentForm);
    // }
    // =============================================
    
    if (editingDepartment) {
      setDepartments(prev => 
        prev.map(d => d.id === editingDepartment.id 
          ? { ...d, ...departmentForm, status: departmentForm.status as "active" | "inactive" }
          : d
        )
      );
      toast.success("Department updated successfully");
    } else {
      const newDepartment: Department = {
        id: `dept${Date.now()}`,
        name: departmentForm.name,
        description: departmentForm.description,
        hotelId: departmentForm.hotelId,
        headOfDepartment: departmentForm.headOfDepartment || undefined,
        employeeCount: 0,
        status: departmentForm.status as "active" | "inactive",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setDepartments(prev => [...prev, newDepartment]);
      toast.success("Department created successfully");
    }
    setModalOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    // =============================================
    // API INTEGRATION PLACEHOLDER
    // Replace with: await api.delete(`/api/departments/${deleteDialog.id}`);
    // =============================================
    
    setDepartments(prev => prev.filter(d => d.id !== deleteDialog.id));
    toast.success("Department deleted successfully");
    setDeleteDialog({ open: false, id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Department Management" subtitle="Manage hotel departments and structure" />

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
                placeholder="Search departments..." 
                className="pl-10 bg-secondary border-border" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="hero" onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{departments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {departments.filter(d => d.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {departments.filter(d => d.status === "inactive").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Departments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Head of Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => {
                    const hotel = hotels.find((h) => h.id === department.hotelId);
                    return (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{department.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {department.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {hotel?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {department.headOfDepartment || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{department.employeeCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={department.status === "active" ? "available" : "maintenance"}>
                            {department.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {department.createdAt}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewDepartment(department)}>
                                <Eye className="w-4 h-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openModal(department)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteDialog({ open: true, id: department.id })}
                              >
                                <Trash className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDepartments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No departments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Department Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDepartment ? "Edit Department" : "Create Department"}
        description="Define department details and assignment"
        onSubmit={handleSubmit}
        submitLabel={editingDepartment ? "Update Department" : "Create Department"}
      >
        <div className="space-y-4">
          <FormField label="Department Name" required>
            <Input
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
              placeholder="e.g., Front Office"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
              placeholder="Department description..."
              rows={3}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hotel" required>
              <Select 
                value={departmentForm.hotelId} 
                onValueChange={(v) => setDepartmentForm({ ...departmentForm, hotelId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status" required>
              <Select 
                value={departmentForm.status} 
                onValueChange={(v) => setDepartmentForm({ ...departmentForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Head of Department">
            <Input
              value={departmentForm.headOfDepartment}
              onChange={(e) => setDepartmentForm({ ...departmentForm, headOfDepartment: e.target.value })}
              placeholder="e.g., John Smith"
            />
          </FormField>
        </div>
      </FormModal>

      {/* View Department Modal */}
      <ViewModal
        open={!!viewDepartment}
        onOpenChange={() => setViewDepartment(null)}
        title={viewDepartment?.name || ""}
      >
        {viewDepartment && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <DetailRow label="Description" value={viewDepartment.description} />
            <DetailRow label="Hotel" value={hotels.find(h => h.id === viewDepartment.hotelId)?.name || "N/A"} />
            <DetailRow label="Head of Department" value={viewDepartment.headOfDepartment || "Not assigned"} />
            <DetailRow label="Employee Count" value={viewDepartment.employeeCount.toString()} />
            <DetailRow 
              label="Status" 
              value={
                <Badge variant={viewDepartment.status === "active" ? "available" : "maintenance"}>
                  {viewDepartment.status}
                </Badge>
              } 
            />
            <DetailRow label="Created" value={viewDepartment.createdAt} />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
