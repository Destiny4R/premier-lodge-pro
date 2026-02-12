import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, Column } from "@/components/ui/data-table";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { Plus, Pencil, Trash2, Eye, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { FoodCategory, CreateFoodCategoryRequest } from "@/types/restaurant";
import { foodCategoryService } from "@/services/foodCategoryService";

// Mock data for fallback
const mockCategories: FoodCategory[] = [
  { id: "fc1", hotelId: "h1", name: "Appetizers", description: "Starters and small bites", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc2", hotelId: "h1", name: "Main Course", description: "Main dishes and entrees", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc3", hotelId: "h1", name: "Desserts", description: "Sweet treats and desserts", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc4", hotelId: "h1", name: "Beverages", description: "Drinks and refreshments", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "fc5", hotelId: "h1", name: "Soups", description: "Hot and cold soups", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

export default function FoodCategoriesPage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateFoodCategoryRequest>({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await foodCategoryService.getFoodCategories();
      if (response.success && response.data?.items) {
        setCategories(response.data.items);
      } else {
        // Fallback to mock data
        setCategories(mockCategories);
      }
    } catch {
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", description: "" });
    setSelectedCategory(null);
    setIsEditing(false);
    setFormModalOpen(true);
  };

  const handleEdit = (category: FoodCategory) => {
    setFormData({ name: category.name, description: category.description });
    setSelectedCategory(category);
    setIsEditing(true);
    setFormModalOpen(true);
  };

  const handleView = (category: FoodCategory) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (category: FoodCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (isEditing && selectedCategory) {
        const response = await foodCategoryService.updateFoodCategory(selectedCategory.id, formData);
        if (response.success) {
          toast.success("Category updated successfully");
          fetchCategories();
        } else {
          // Mock update for demo
          setCategories(prev => prev.map(c => 
            c.id === selectedCategory.id 
              ? { ...c, ...formData, updatedAt: new Date().toISOString() }
              : c
          ));
          toast.success("Category updated successfully");
        }
      } else {
        const response = await foodCategoryService.createFoodCategory(formData);
        if (response.success) {
          toast.success("Category created successfully");
          fetchCategories();
        } else {
          // Mock create for demo
          const newCategory: FoodCategory = {
            id: `fc${Date.now()}`,
            hotelId: "h1",
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCategories(prev => [...prev, newCategory]);
          toast.success("Category created successfully");
        }
      }
      setFormModalOpen(false);
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await foodCategoryService.deleteFoodCategory(selectedCategory.id);
      if (response.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        // Mock delete for demo
        setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
        toast.success("Category deleted successfully");
      }
      setDeleteDialogOpen(false);
    } catch {
      toast.error("An error occurred");
    }
  };

  const columns: Column<FoodCategory>[] = [
    {
      key: "name",
      header: "Name",
      render: (_, category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (_, category) => (
        <span className="text-muted-foreground line-clamp-2">{category.description}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (_, category) => (
        <span className="text-muted-foreground">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const renderActions = (category: FoodCategory) => (
    <>
      <Button variant="ghost" size="icon" onClick={() => handleView(category)}>
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-destructive hover:text-destructive"
        onClick={() => handleDeleteClick(category)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Food Categories" 
        subtitle="Manage restaurant food categories" 
      />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <DataTable
                data={categories}
                columns={columns}
                searchPlaceholder="Search categories..."
                loading={loading}
                actions={renderActions}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <FormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        title={isEditing ? "Edit Category" : "Add Category"}
        description={isEditing ? "Update the category details" : "Create a new food category"}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <FormField label="Category Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
            />
          </FormField>
          <FormField label="Description" required>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description"
              rows={3}
            />
          </FormField>
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Category Details"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <DetailRow label="Name" value={selectedCategory.name} />
            <DetailRow label="Description" value={selectedCategory.description} />
            <DetailRow 
              label="Created" 
              value={new Date(selectedCategory.createdAt).toLocaleDateString()} 
            />
            <DetailRow 
              label="Last Updated" 
              value={new Date(selectedCategory.updatedAt).toLocaleDateString()} 
            />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
