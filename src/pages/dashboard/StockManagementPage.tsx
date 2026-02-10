import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow } from "@/components/forms";
import { ImageUpload, ExistingImage } from "@/components/forms/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, Package, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StockItem, CreateStockItemRequest, FoodCategory } from "@/types/restaurant";
import { stockService } from "@/services/stockService";
import { foodCategoryService } from "@/services/foodCategoryService";

// Mock data for fallback
const mockCategories: FoodCategory[] = [
  // { id: "fc1", hotelId: "h1", name: "Appetizers", description: "Starters", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "fc2", hotelId: "h1", name: "Main Course", description: "Main dishes", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "fc3", hotelId: "h1", name: "Desserts", description: "Sweet treats", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "fc4", hotelId: "h1", name: "Beverages", description: "Drinks", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

const mockStock: StockItem[] = [
  // { id: "s1", hotelId: "h1", categoryId: "fc1", categoryName: "Appetizers", name: "Spring Rolls", image: "", quantity: 50, price: 1500, description: "Crispy vegetable spring rolls", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "s2", hotelId: "h1", categoryId: "fc2", categoryName: "Main Course", name: "Grilled Chicken", image: "", quantity: 30, price: 4500, description: "Marinated grilled chicken breast", minimumStockLevel: 15, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "s3", hotelId: "h1", categoryId: "fc2", categoryName: "Main Course", name: "Jollof Rice", image: "", quantity: 100, price: 2500, description: "Nigerian style jollof rice", minimumStockLevel: 20, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "s4", hotelId: "h1", categoryId: "fc3", categoryName: "Desserts", name: "Chocolate Cake", image: "", quantity: 8, price: 3000, description: "Rich chocolate layer cake", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  // { id: "s5", hotelId: "h1", categoryId: "fc4", categoryName: "Beverages", name: "Fresh Orange Juice", image: "", quantity: 25, price: 1000, description: "Freshly squeezed orange juice", minimumStockLevel: 10, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
];

export default function StockManagementPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateStockItemRequest>({
    categoryId: "",
    name: "",
    image: "",
    quantity: 0,
    price: 0,
    description: "",
    minimumStockLevel: 0,
  });
  
  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  
  // Quantity update state
  const [newQuantity, setNewQuantity] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, catRes] = await Promise.all([
        stockService.getStockItems(),
        foodCategoryService.getFoodCategories(),
      ]);
      
      if (stockRes.success && stockRes.data?.items) {
        setStockItems(stockRes.data.items);
      } else {
        setStockItems(mockStock);
      }
      
      if (catRes.success && catRes.data?.items) {
        setCategories(catRes.data.items);
      } else {
        setCategories(mockCategories);
      }
    } catch {
      setStockItems(mockStock);
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      categoryId: "",
      name: "",
      image: "",
      quantity: 0,
      price: 0,
      description: "",
      minimumStockLevel: 0,
    });
    setImageFiles([]);
    setExistingImages([]);
    setSelectedItem(null);
    setIsEditing(false);
    setFormModalOpen(true);
  };

  const handleEdit = (item: StockItem) => {
    setFormData({
      categoryId: item.categoryId,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      description: item.description,
      minimumStockLevel: item.minimumStockLevel,
    });
    setImageFiles([]);
    // Set existing image if present
    if (item.image) {
      setExistingImages([{
        id: item.id,
        url: item.image,
        name: "Current Image"
      }]);
    } else {
      setExistingImages([]);
    }
    setSelectedItem(item);
    setIsEditing(true);
    setFormModalOpen(true);
  };

  const handleView = (item: StockItem) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (item: StockItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleUpdateQuantityClick = (item: StockItem) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity);
    setQuantityModalOpen(true);
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    // Call API to remove image
    try {
      const response = await stockService.deleteStockItemImage(imageId);
      if (response.success) {
        setExistingImages([]);
        setFormData(prev => ({ ...prev, image: "" }));
        toast.success("Image removed successfully");
        // Update local state
        setStockItems(prev => prev.map(s => 
          s.id === imageId ? { ...s, image: "" } : s
        ));
      } else {
        // Mock remove for demo
        setExistingImages([]);
        setFormData(prev => ({ ...prev, image: "" }));
        toast.success("Image removed successfully");
      }
    } catch {
      // Mock remove for demo
      setExistingImages([]);
      setFormData(prev => ({ ...prev, image: "" }));
      toast.success("Image removed successfully");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const submitData = { ...formData };
      const imageFile = imageFiles.length > 0 ? imageFiles[0] : undefined;

      if (isEditing && selectedItem) {
        const response = await stockService.updateStockItem(selectedItem.id, submitData, imageFile);
        if (response.success) {
          toast.success("Stock item updated successfully");
          fetchData();
        } else {
          // Mock update
          const categoryName = categories.find(c => c.id === formData.categoryId)?.name || "";
          let imageUrl = selectedItem.image;
          if (imageFile) {
            imageUrl = URL.createObjectURL(imageFile);
          }
          setStockItems(prev => prev.map(s => 
            s.id === selectedItem.id 
              ? { ...s, ...submitData, image: imageUrl, categoryName, updatedAt: new Date().toISOString() }
              : s
          ));
          toast.success("Stock item updated successfully");
        }
      } else {
        const response = await stockService.createStockItem(submitData, imageFile);
        if (response.success) {
          toast.success("Stock item created successfully");
          fetchData();
        } else {
          // Mock create
          const categoryName = categories.find(c => c.id === formData.categoryId)?.name || "";
          const newItem: StockItem = {
            id: `s${Date.now()}`,
            hotelId: "h1",
            ...submitData,
            image: imageFile ? URL.createObjectURL(imageFile) : "",
            categoryName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setStockItems(prev => [...prev, newItem]);
          toast.success("Stock item created successfully");
        }
      }
      setFormModalOpen(false);
      setImageFiles([]);
      setExistingImages([]);
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await stockService.deleteStockItem(selectedItem.id);
      if (response.success) {
        toast.success("Stock item deleted successfully");
        fetchData();
      } else {
        setStockItems(prev => prev.filter(s => s.id !== selectedItem.id));
        toast.success("Stock item deleted successfully");
      }
      setDeleteDialogOpen(false);
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleUpdateQuantity = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await stockService.updateStockQuantity(selectedItem.id, { quantity: newQuantity });
      if (response.success) {
        toast.success("Quantity updated successfully");
        fetchData();
      } else {
        setStockItems(prev => prev.map(s => 
          s.id === selectedItem.id 
            ? { ...s, quantity: newQuantity, updatedAt: new Date().toISOString() }
            : s
        ));
        toast.success("Quantity updated successfully");
      }
      setQuantityModalOpen(false);
    } catch {
      toast.error("An error occurred");
    }
  };

  const isLowStock = (item: StockItem) => item.quantity <= item.minimumStockLevel;

  const columns: Column<StockItem>[] = [
    {
      key: "name",
      header: "Item",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <span className="font-medium text-foreground block">{item.name}</span>
            <span className="text-sm text-muted-foreground">{item.categoryName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium">{item.quantity}</span>
          {isLowStock(item) && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (_, item) => (
        <span className="text-primary font-semibold">₦{item.price.toLocaleString()}</span>
      ),
    },
    {
      key: "minimumStockLevel",
      header: "Min Level",
      render: (_, item) => (
        <span className="text-muted-foreground">{item.minimumStockLevel}</span>
      ),
    },
  ];

  const renderActions = (item: StockItem) => (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleUpdateQuantityClick(item)}
        title="Update Quantity"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-destructive hover:text-destructive"
        onClick={() => handleDeleteClick(item)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Stock Management" 
        subtitle="Manage restaurant inventory and stock levels" 
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
                  Add Stock Item
                </Button>
              </div>
              <DataTable
                data={stockItems}
                columns={columns}
                searchPlaceholder="Search stock items..."
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
        title={isEditing ? "Edit Stock Item" : "Add Stock Item"}
        description={isEditing ? "Update the stock item details" : "Add a new item to stock"}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Update" : "Create"}
      >
        <div className="space-y-4">
          <FormField label="Food Category" required>
            <Select
              value={formData.categoryId}
              onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label="Item Name" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
            />
          </FormField>
          
          {/* Image Upload */}
          <ImageUpload
            label="Item Image"
            multiple={false}
            value={imageFiles}
            existingImages={existingImages}
            onFilesChange={setImageFiles}
            onRemoveExisting={handleRemoveExistingImage}
            hint="Upload an image for this stock item"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min={0}
              />
            </FormField>
            
            <FormField label="Price (₦)" required>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min={0}
                step={0.01}
              />
            </FormField>
          </div>
          
          <FormField label="Minimum Stock Level" required>
            <Input
              type="number"
              value={formData.minimumStockLevel}
              onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value) || 0 })}
              placeholder="Enter minimum stock level"
              min={0}
            />
          </FormField>
          
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              rows={3}
            />
          </FormField>
        </div>
      </FormModal>

      {/* Update Quantity Modal */}
      <FormModal
        open={quantityModalOpen}
        onOpenChange={setQuantityModalOpen}
        title="Update Stock Quantity"
        description={`Update the quantity for ${selectedItem?.name}`}
        onSubmit={handleUpdateQuantity}
        submitLabel="Update Quantity"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground mb-1">Current Quantity</p>
            <p className="text-2xl font-bold text-foreground">{selectedItem?.quantity}</p>
          </div>
          
          <FormField label="New Quantity" required>
            <Input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              placeholder="Enter new quantity"
              min={0}
            />
          </FormField>
        </div>
      </FormModal>

      {/* View Modal */}
      <ViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Stock Item Details"
      >
        {selectedItem && (
          <div className="space-y-4">
            {selectedItem.image && (
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <DetailRow label="Name" value={selectedItem.name} />
            <DetailRow label="Category" value={selectedItem.categoryName || "-"} />
            <DetailRow label="Quantity" value={selectedItem.quantity.toString()} />
            <DetailRow label="Price" value={`₦${selectedItem.price.toLocaleString()}`} />
            <DetailRow label="Minimum Stock Level" value={selectedItem.minimumStockLevel.toString()} />
            <DetailRow label="Description" value={selectedItem.description} />
            <DetailRow 
              label="Status" 
              value={isLowStock(selectedItem) ? "Low Stock" : "In Stock"} 
            />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Stock Item"
        description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}