import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingState, EmptyState, StatsSkeleton } from "@/components/ui/loading-state";
import { Plus, Search, Filter, Building2, MoreVertical, Edit, Trash, Eye, Users } from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentStats,
  Department,
  CreateDepartmentRequest,
} from "@/services/departmentService";
import { getHotels } from "@/services/hotelService";
import { Hotel } from "@/types/api";

export default function DepartmentsPage() {
  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; totalEmployees: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Modal State
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [deptRes, hotelsRes, statsRes] = await Promise.all([
        getDepartments({ page: 1, limit: 100, search: searchQuery }),
        getHotels({ page: 1, limit: 100 }),
        getDepartmentStats(),
      ]);

      if (deptRes.success) {
        setDepartments(deptRes.data.items);
      } else {
        setError(deptRes.message);
      }

      if (hotelsRes.success) {
        setHotels(hotelsRes.data.items);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const deptData: CreateDepartmentRequest = {
        name: departmentForm.name,
        description: departmentForm.description,
        hotelId: departmentForm.hotelId,
        headOfDepartment: departmentForm.headOfDepartment || undefined,
        status: departmentForm.status as "active" | "inactive",
      };

      const response = editingDepartment
        ? await updateDepartment(editingDepartment.id, deptData)
        : await createDepartment(deptData);

      if (response.success) {
        toast.success(editingDepartment ? "Department updated successfully" : "Department created successfully");
        setModalOpen(false);
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

  // Handle delete
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await deleteDepartment(deleteDialog.id);
      
      if (response.success) {
        toast.success("Department deleted successfully");
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

  // Get hotel name by ID
  const getHotelName = (hotelId: string) => {
    return hotels.find((h) => h.id === hotelId)?.name || "N/A";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Department Management" subtitle="Manage hotel departments and structure" />
        <div className="p-6 space-y-6">
          <StatsSkeleton count={4} />
          <Card>
            <CardContent className="py-12">
              <LoadingState message="Loading departments..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  <p className="text-2xl font-bold text-foreground">{stats?.total ?? departments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.active ?? departments.filter(d => d.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.inactive ?? departments.filter(d => d.status === "inactive").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalEmployees ?? departments.reduce((sum, d) => sum + d.employeeCount, 0)}
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
              {error ? (
                <EmptyState
                  title="Error loading departments"
                  description={error}
                  action={<Button variant="outline" onClick={fetchData}>Retry</Button>}
                />
              ) : filteredDepartments.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No departments found"
                  description={searchQuery ? "Try adjusting your search" : "Add your first department to get started"}
                  action={!searchQuery ? <Button variant="outline" onClick={() => openModal()}>Add Department</Button> : undefined}
                />
              ) : (
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
                    {filteredDepartments.map((department) => (
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
                          {getHotelName(department.hotelId)}
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
                          <Badge variant={department.status === "active" ? "success" : "secondary"}>
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
                    ))}
                  </TableBody>
                </Table>
              )}
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
        isLoading={isSubmitting}
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
        title="Department Details"
      >
        {viewDepartment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{viewDepartment.name}</h3>
                <Badge variant={viewDepartment.status === "active" ? "success" : "secondary"}>
                  {viewDepartment.status}
                </Badge>
              </div>
            </div>
            <DetailRow label="Description" value={viewDepartment.description} />
            <DetailRow label="Hotel" value={getHotelName(viewDepartment.hotelId)} />
            <DetailRow label="Head of Department" value={viewDepartment.headOfDepartment || "Not assigned"} />
            <DetailRow label="Employee Count" value={viewDepartment.employeeCount} />
            <DetailRow label="Created At" value={viewDepartment.createdAt} />
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
