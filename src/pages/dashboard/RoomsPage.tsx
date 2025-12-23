import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, BedDouble, MoreVertical, Edit, Trash, Eye } from "lucide-react";
import { rooms, roomCategories as initialCategories, hotels, RoomCategory, Room } from "@/data/mockData";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow, ImageUpload, ExistingImage } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusVariants: Record<string, "available" | "occupied" | "reserved" | "maintenance"> = {
  available: "available",
  occupied: "occupied",
  reserved: "reserved",
  maintenance: "maintenance",
};

// Extended RoomCategory with images
interface RoomCategoryWithImages extends RoomCategory {
  images: ExistingImage[];
}

// Initialize categories with mock images
const roomCategories: RoomCategoryWithImages[] = initialCategories.map((cat) => ({
  ...cat,
  images: [
    { id: `${cat.id}-img1`, url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", name: "room-view-1.jpg" },
    { id: `${cat.id}-img2`, url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400", name: "room-view-2.jpg" },
  ],
}));

export default function RoomsPage() {
  // Categories state for managing updates
  const [categories, setCategories] = useState<RoomCategoryWithImages[]>(roomCategories);
  
  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategoryWithImages | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    amenities: "",
  });
  
  // Image upload state for categories
  const [categoryImages, setCategoryImages] = useState<File[]>([]);
  const [existingCategoryImages, setExistingCategoryImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // Room Modal State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    hotelId: "",
    categoryId: "",
    roomNumber: "",
    floor: "",
    price: "",
    status: "available",
    isPromoted: false,
  });

  // View Modal State
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [viewCategory, setViewCategory] = useState<RoomCategory | null>(null);

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "room" | "category"; id: string }>({
    open: false,
    type: "room",
    id: "",
  });

  // Category handlers
  const openCategoryModal = (category?: RoomCategoryWithImages) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
        basePrice: category.basePrice.toString(),
        maxOccupancy: category.maxOccupancy.toString(),
        amenities: category.amenities.join(", "),
      });
      setExistingCategoryImages(category.images || []);
      setCategoryImages([]);
      setRemovedImageIds([]);
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", basePrice: "", maxOccupancy: "", amenities: "" });
      setExistingCategoryImages([]);
      setCategoryImages([]);
      setRemovedImageIds([]);
    }
    setCategoryModalOpen(true);
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingCategoryImages(prev => prev.filter(img => img.id !== imageId));
    setRemovedImageIds(prev => [...prev, imageId]);
  };

  const handleCategorySubmit = () => {
    // =============================================
    // API INTEGRATION PLACEHOLDER
    // For creating/updating category with images:
    // 
    // const formData = new FormData();
    // formData.append('name', categoryForm.name);
    // formData.append('description', categoryForm.description);
    // formData.append('basePrice', categoryForm.basePrice);
    // formData.append('maxOccupancy', categoryForm.maxOccupancy);
    // formData.append('amenities', categoryForm.amenities);
    // categoryImages.forEach(file => formData.append('images', file));
    // formData.append('removedImageIds', JSON.stringify(removedImageIds));
    // 
    // if (editingCategory) {
    //   await api.put(`/api/room-categories/${editingCategory.id}`, formData);
    // } else {
    //   await api.post('/api/room-categories', formData);
    // }
    // =============================================
    
    if (editingCategory) {
      // Update category locally for demo
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? {
              ...cat,
              name: categoryForm.name,
              description: categoryForm.description,
              basePrice: parseFloat(categoryForm.basePrice),
              maxOccupancy: parseInt(categoryForm.maxOccupancy),
              amenities: categoryForm.amenities.split(",").map(a => a.trim()),
              images: existingCategoryImages,
            }
          : cat
      ));
    }
    
    toast.success(editingCategory ? "Room category updated successfully" : "Room category created successfully");
    setCategoryModalOpen(false);
  };

  // Room handlers
  const openRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        hotelId: room.hotelId,
        categoryId: room.categoryId,
        roomNumber: room.roomNumber,
        floor: room.floor.toString(),
        price: room.price.toString(),
        status: room.status,
        isPromoted: room.isPromoted,
      });
    } else {
      setEditingRoom(null);
      setRoomForm({ hotelId: "", categoryId: "", roomNumber: "", floor: "", price: "", status: "available", isPromoted: false });
    }
    setRoomModalOpen(true);
  };

  const handleRoomSubmit = () => {
    toast.success(editingRoom ? "Room updated successfully" : "Room created successfully");
    setRoomModalOpen(false);
  };

  const handleDelete = () => {
    toast.success(deleteDialog.type === "room" ? "Room deleted successfully" : "Category deleted successfully");
    setDeleteDialog({ open: false, type: "room", id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Room Management" subtitle="Manage all rooms and categories" />

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
              <Input placeholder="Search rooms..." className="pl-10 bg-secondary border-border" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => openCategoryModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button variant="hero" onClick={() => openRoomModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </motion.div>

        {/* Room Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} variant="glass" className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BedDouble className="w-5 h-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewCategory(category)}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCategoryModal(category)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteDialog({ open: true, type: "category", id: category.id })}
                          >
                            <Trash className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${category.basePrice}</span>
                      <span className="text-sm text-muted-foreground">
                        Max {category.maxOccupancy} guests
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rooms Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Rooms</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="available">
                  Available: {rooms.filter((r) => r.status === "available").length}
                </Badge>
                <Badge variant="occupied">
                  Occupied: {rooms.filter((r) => r.status === "occupied").length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hotel</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Floor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => {
                      const category = roomCategories.find((c) => c.id === room.categoryId);
                      const hotel = hotels.find((h) => h.id === room.hotelId);
                      return (
                        <tr key={room.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={room.image}
                                alt={`Room ${room.roomNumber}`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-foreground">Room {room.roomNumber}</p>
                                {room.isPromoted && (
                                  <Badge variant="default" className="text-xs mt-1">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{hotel?.name}</td>
                          <td className="py-4 px-4 text-sm text-foreground">{category?.name}</td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">Floor {room.floor}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-foreground">${room.price}</td>
                          <td className="py-4 px-4">
                            <Badge variant={statusVariants[room.status]}>{room.status}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewRoom(room)}>
                                  <Eye className="w-4 h-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openRoomModal(room)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setDeleteDialog({ open: true, type: "room", id: room.id })}
                                >
                                  <Trash className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Modal */}
      <FormModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        title={editingCategory ? "Edit Room Category" : "Create Room Category"}
        description="Define room category details and pricing"
        onSubmit={handleCategorySubmit}
        submitLabel={editingCategory ? "Update Category" : "Create Category"}
      >
        <div className="space-y-4">
          <FormField label="Category Name" required>
            <Input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g., Deluxe Suite"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Room category description..."
              rows={3}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Base Price" required>
              <Input
                type="number"
                value={categoryForm.basePrice}
                onChange={(e) => setCategoryForm({ ...categoryForm, basePrice: e.target.value })}
                placeholder="150"
              />
            </FormField>
            <FormField label="Max Occupancy" required>
              <Input
                type="number"
                value={categoryForm.maxOccupancy}
                onChange={(e) => setCategoryForm({ ...categoryForm, maxOccupancy: e.target.value })}
                placeholder="2"
              />
            </FormField>
          </div>
          <FormField label="Amenities" hint="Comma-separated list">
            <Input
              value={categoryForm.amenities}
              onChange={(e) => setCategoryForm({ ...categoryForm, amenities: e.target.value })}
              placeholder="WiFi, TV, Mini Bar, Air Conditioning"
            />
          </FormField>
          <ImageUpload
            label="Category Images"
            accept=".jpg,.jpeg,.png"
            multiple
            value={categoryImages}
            existingImages={existingCategoryImages}
            onFilesChange={setCategoryImages}
            onRemoveExisting={handleRemoveExistingImage}
            hint="Upload images showcasing this room category"
          />
        </div>
      </FormModal>

      {/* Room Modal */}
      <FormModal
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        title={editingRoom ? "Edit Room" : "Create Room"}
        description="Configure room details and availability"
        onSubmit={handleRoomSubmit}
        submitLabel={editingRoom ? "Update Room" : "Create Room"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hotel" required>
              <Select value={roomForm.hotelId} onValueChange={(v) => setRoomForm({ ...roomForm, hotelId: v })}>
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
            <FormField label="Category" required>
              <Select value={roomForm.categoryId} onValueChange={(v) => setRoomForm({ ...roomForm, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {roomCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Room Number" required>
              <Input
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                placeholder="101"
              />
            </FormField>
            <FormField label="Floor" required>
              <Input
                type="number"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                placeholder="1"
              />
            </FormField>
            <FormField label="Price" required>
              <Input
                type="number"
                value={roomForm.price}
                onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                placeholder="150"
              />
            </FormField>
          </div>
          <FormField label="Status" required>
            <Select value={roomForm.status} onValueChange={(v) => setRoomForm({ ...roomForm, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormModal>

      {/* View Room Modal */}
      <ViewModal
        open={!!viewRoom}
        onOpenChange={() => setViewRoom(null)}
        title={`Room ${viewRoom?.roomNumber}`}
      >
        {viewRoom && (
          <div className="space-y-4">
            <img src={viewRoom.image} alt={`Room ${viewRoom.roomNumber}`} className="w-full h-48 object-cover rounded-lg" />
            <DetailRow label="Hotel" value={hotels.find(h => h.id === viewRoom.hotelId)?.name} />
            <DetailRow label="Category" value={roomCategories.find(c => c.id === viewRoom.categoryId)?.name} />
            <DetailRow label="Floor" value={`Floor ${viewRoom.floor}`} />
            <DetailRow label="Price" value={`$${viewRoom.price}/night`} />
            <DetailRow label="Status" value={<Badge variant={statusVariants[viewRoom.status]}>{viewRoom.status}</Badge>} />
            <DetailRow label="Featured" value={viewRoom.isPromoted ? "Yes" : "No"} />
          </div>
        )}
      </ViewModal>

      {/* View Category Modal */}
      <ViewModal
        open={!!viewCategory}
        onOpenChange={() => setViewCategory(null)}
        title={viewCategory?.name || ""}
      >
        {viewCategory && (
          <div className="space-y-4">
            <DetailRow label="Description" value={viewCategory.description} />
            <DetailRow label="Base Price" value={`$${viewCategory.basePrice}/night`} />
            <DetailRow label="Max Occupancy" value={`${viewCategory.maxOccupancy} guests`} />
            <DetailRow label="Amenities" value={viewCategory.amenities.join(", ")} />
          </div>
        )}
      </ViewModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={`Delete ${deleteDialog.type === "room" ? "Room" : "Category"}`}
        description={`Are you sure you want to delete this ${deleteDialog.type}? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
