import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from '@/components/Pagination';
import { Plus, Search, Filter, BedDouble, MoreVertical, Edit, Trash, Eye } from "lucide-react";
import { FormModal, FormField, ConfirmDialog, ViewModal, DetailRow, ImageUpload, ExistingImage } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { 
  getRooms, 
  getRoomCategories, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
  getRoomItems,
  RoomCategorySelectItem,
  getCategoryById,
  deleteCategoryImage,
  getRoomById,
} from "@/services/roomService";
import { Room, RoomCategory } from "@/types/api";

const statusVariants: Record<string, "available" | "occupied" | "reserved" | "maintenance"> = {
  available: "available",
  occupied: "occupied",
  reserved: "reserved",
  maintenance: "maintenance",
};

// Extended RoomCategory with images for UI
interface RoomCategoryWithImages extends RoomCategory {
  uiImages?: ExistingImage[];
}

export default function RoomsPage() {
  // API States
  const roomsApi = useApi<{ items: Room[]; totalItems: number }>();
  const categoriesApi = useApi<{ items: RoomCategory[]; totalItems: number }>();
  const roomItemsApi = useApi<RoomCategorySelectItem[]>();
  const mutationApi = useApi<Room | RoomCategory | null>({ showSuccessToast: true });

  // Local state for categories with images
  const [categories, setCategories] = useState<RoomCategoryWithImages[]>([]);
  // Room category items for dropdown selection
  const [roomCategoryItems, setRoomCategoryItems] = useState<RoomCategorySelectItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategoryWithImages | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    amenities: "",
    amenity: "",
  });

  // Image upload state for categories
  const [categoryImages, setCategoryImages] = useState<File[]>([]);
  const [existingCategoryImages, setExistingCategoryImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  // Room Modal State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    categoryId: "",
    roomNumber: "",
    floor: "",
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

  // Fetch data on mount
  useEffect(() => {
    fetchRooms();
    fetchCategories();
    fetchRoomItems();
  }, []);

  /**
   * GET /api/v3/rooms/getroomsitems
   * Fetch room category items for dropdown selection
   * Response: {
   *   success: boolean,
   *   data: [{ disabled: boolean, group: string|null, selected: boolean, text: string, value: string }],
   *   message: string,
   *   status: number
   * }
   */
  const fetchRoomItems = async () => {
    const response = await roomItemsApi.execute(() => getRoomItems());
    if (response.success && response.data) {
      setRoomCategoryItems(response.data);
    }
  };

  const fetchRooms = async () => {
    /**
     * GET /api/rooms
     * Returns: { success: boolean, data: { items: Room[], totalItems: number, ... }, message: string }
     */
    const response = await roomsApi.execute(() => getRooms());
    console.log('Fetched rooms:', response);
    if (response.success && response.data) {
      const normalized = response.data.items.map(r => ({
        ...r,
        doorNumber: r.doorNumber ?? (r as any).roomNumber ?? (r as any).number ?? '',
      }));
      setRooms(normalized);
    }
  };

  const fetchCategories = async () => {
    /**
     * GET /api/room-categories
     * Returns: { success: boolean, data: { items: RoomCategory[], totalItems: number, ... }, message: string }
     */
    const response = await categoriesApi.execute(() => getRoomCategories());
    if (response.success && response.data) {
      // Transform API response to include UI-specific image format
      console.log('Fetched categories:', response.data.items);
      const categoriesWithImages: RoomCategoryWithImages[] = response.data.items.map(cat => ({
        ...cat,
        uiImages: cat.images?.map((img, idx) => ({ 
          id: `${cat.id}-img${idx}`, 
          url: typeof img === 'string' ? img : '', 
          name: `image-${idx}.jpg` 
        })) || [],
      }));
      setCategories(categoriesWithImages);
    }
  };

  // Category handlers
  const openCategoryModal = async (category?: RoomCategoryWithImages) => {
    if (category) {
      // Edit existing category - fetch full data
      try {
        const response = await getCategoryById(category.id);
        console.log('Fetched category details:', response);
        if (response.success && response.data) {
          const data = response.data;
          setEditingCategory(category);
          setCategoryForm({
            name: data.name,
            description: data.description,
            basePrice: data.basePrice.toString(),
            maxOccupancy: data.maxOccupancy.toString(),
            amenities: data.amenities,
            amenity: data.amenity,
          });
          //const baseUrl = import.meta.env.BASE_URL || 'https://localhost:44353';
          const existingImages: ExistingImage[] = data.images.map(img => ({
            id: img.id.toString(),
            url: img.path,
            name: img.path.split('/').pop() || 'image',
          }));
          console.log('Existing images:', existingImages);
          setExistingCategoryImages(existingImages);
          setCategoryImages([]);
          setRemovedImageIds([]);
        }
      } catch (error) {
        console.error('Failed to fetch category details:', error);
        // Fallback to basic data
        setEditingCategory(category);
        setCategoryForm({
          name: category.name,
          description: category.description,
          basePrice: category.basePrice.toString(),
          maxOccupancy: category.maxOccupancy.toString(),
          amenities: category.amenities,
          amenity: category.amenity,
        });
        setExistingCategoryImages(category.uiImages || []);
        setCategoryImages([]);
        setRemovedImageIds([]);
      }
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", basePrice: "", maxOccupancy: "", amenities: "", amenity: "" });
      setExistingCategoryImages([]);
      setCategoryImages([]);
      setRemovedImageIds([]);
    }
    setCategoryModalOpen(true);
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    setExistingCategoryImages(prev => prev.filter(img => img.id !== imageId));
    setRemovedImageIds(prev => [...prev, imageId]);
    try {
      await deleteCategoryImage(imageId);
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Optionally revert the UI change
    }
  };

  const handleCategorySubmit = async () => {
    const categoryData = {
      name: categoryForm.name,
      description: categoryForm.description,
      basePrice: parseFloat(categoryForm.basePrice),
      maxOccupancy: parseInt(categoryForm.maxOccupancy),
      amenities: categoryForm.amenities,
      amenity: categoryForm.amenity,
      files: categoryImages,
    };

    if (editingCategory) {
      /**
       * PUT /api/room-categories/:id
       * Request: { name, description, basePrice, maxOccupancy, amenities, images?, removedImageIds? }
       */
      const response = await mutationApi.execute(() => 
        updateRoomCategory(editingCategory.id, { ...categoryData, removedImageIds })
      );
      if (response.success) {
        fetchCategories();
        setCategoryModalOpen(false);
      }
    } else {
      /**
       * POST /api/room-categories
       * Request: { name, description, basePrice, maxOccupancy, amenities, images? }
       */
      const response = await mutationApi.execute(() => createRoomCategory(categoryData));
      if (response.success) {
        fetchCategories();
        setCategoryModalOpen(false);
      }
    }
  };

  // Room handlers
  const openRoomModal = async (room?: Room) => {
    if (room) {
      const response = await getRoomById(room.id);

      console.log('Fetched room details:', response);
      if (response.success && response.data) {
        setEditingRoom(room);
        setRoomForm({
          categoryId: response.data.categoryId.toString(),
          roomNumber: response.data.doorNumber,
          floor: response.data.floor.toString(),
          status: response.data.status,
          isPromoted: response.data.isPromoted,

          // categoryId: room.categoryId.toString(),
          // roomNumber: room.doorNumber,
          // floor: room.floor.toString(),
          // status: room.status,
          // isPromoted: room.isPromoted,
        });
      }
    } else {
      setEditingRoom(null);
      setRoomForm({ categoryId: "", roomNumber: "", floor: "", status: "available", isPromoted: false });
    }
    setRoomModalOpen(true);
  };

  const handleRoomSubmit = async () => {
    const roomData = {
      doorNumber: roomForm.roomNumber,
      floor: parseInt(roomForm.floor),
      status: roomForm.status,
      categoryId: parseInt(roomForm.categoryId),
      isPromoted: roomForm.isPromoted,
    };

    if (editingRoom) {
      /**
       * PUT /api/rooms/:id
       * Request: { doorNumber, floor, status, categoryId, isPromoted }
       * Note: hotelId is derived from authenticated user's hotel context
       */
      const response = await mutationApi.execute(() => updateRoom(editingRoom.id, roomData));
      console.log('Update room response:', response);
      if (response.success) {
        fetchRooms();
        setRoomModalOpen(false);
      }
    } else {
      /**
       * POST /api/rooms
       * Request: { doorNumber, floor, status, categoryId, isPromoted }
       * Note: hotelId is derived from authenticated user's hotel context
       */
      console.log('Creating room with data:', roomData);
      const response = await mutationApi.execute(() => createRoom(roomData));
      if (response.success) {
        fetchRooms();
        setRoomModalOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.type === "room") {
      /**
       * DELETE /api/rooms/:id
       */
      const response = await mutationApi.execute(() => deleteRoom(deleteDialog.id));
      if (response.success) {
        fetchRooms();
      }
    } else {
      /**
       * DELETE /api/room-categories/:id
       */
      const response = await mutationApi.execute(() => deleteRoomCategory(deleteDialog.id));
      if (response.success) {
        fetchCategories();
      }
    }
    setDeleteDialog({ open: false, type: "room", id: "" });
  };

  const isLoading = roomsApi.isLoading || categoriesApi.isLoading;
  const hasError = roomsApi.error || categoriesApi.error;

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

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading rooms and categories..." />}

        {/* Error State */}
        {hasError && !isLoading && (
          <ErrorState 
            message={roomsApi.error || categoriesApi.error || 'Failed to load data'} 
            onRetry={() => { fetchRooms(); fetchCategories(); }} 
          />
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <>
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
                  {categories.length === 0 ? (
                    <EmptyState
                      icon={BedDouble}
                      title="No categories found"
                      description="Create your first room category to get started"
                      action={
                        <Button onClick={() => openCategoryModal()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      }
                    />
                  ) : (
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
                  )}
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
                      Available: {rooms.filter((r) => r.status === "Available").length}
                    </Badge>
                    <Badge variant="occupied">
                      Occupied: {rooms.filter((r) => r.status === "Occupied").length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {rooms.length === 0 ? (
                    <EmptyState
                      icon={BedDouble}
                      title="No rooms found"
                      description="Create your first room to get started"
                      action={
                        <Button onClick={() => openRoomModal()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Room
                        </Button>
                      }
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Door Number</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Floor</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rooms.map((room) => {
                            const category = categories.find((c) => c.id === room.categoryId);
                            return (
                              <tr key={room.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'}
                                      alt={`Room ${room.doorNumber}`}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div>
                                      <p className="font-medium text-foreground">Room {room.doorNumber}</p>
                                      {room.isPromoted && (
                                        <Badge variant="default" className="text-xs mt-1">Featured</Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                  {room.doorNumber ?? (room as any).roomNumber ?? '-'}
                                </td>
                                <td className="py-4 px-4 text-sm text-foreground">{category?.name || room.categoryName || '-'}</td>
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
            {/* Pagination */}
            <Pagination totalPages={Math.ceil(roomsApi.data?.totalItems / 10) || 1} currentPage={1} onPageChange={(page) => {

            }}
              />
          </>
        )}
      </div>

      {/* Category Modal */}
      <FormModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        title={editingCategory ? "Edit Room Category" : "Create Room Category"}
        description="Define room category details and pricing"
        onSubmit={handleCategorySubmit}
        submitLabel={editingCategory ? "Update Category" : "Create Category"}
        isLoading={mutationApi.isLoading}
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
              value={categoryForm.amenity}
              onChange={(e) => setCategoryForm({ ...categoryForm, amenity: e.target.value })}
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
        isLoading={mutationApi.isLoading}
      >
        <div className="space-y-4">
          <FormField label="Category" required>
            <Select value={roomForm.categoryId} onValueChange={(v) => setRoomForm({ ...roomForm, categoryId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {/* Use getRoomItems API response for dropdown */}
                {roomCategoryItems.length > 0 ? (
                  roomCategoryItems.map((item) => (
                    <SelectItem 
                      key={item.value} 
                      value={item.value}
                      disabled={item.disabled}
                    >
                      {item.text}
                    </SelectItem>
                  ))
                ) : (
                  /* Fallback to categories if roomItems not available */
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
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
        title={`Room ${viewRoom?.doorNumber}`}
      >
        {viewRoom && (
          <div className="space-y-4">
            <img src={viewRoom.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'} alt={`Room ${viewRoom.doorNumber}`} className="w-full h-48 object-cover rounded-lg" />
            <DetailRow label="Hotel" value={viewRoom.hotelName || '-'} />
            <DetailRow label="Category" value={categories.find(c => c.id === viewRoom.categoryId)?.name || viewRoom.categoryName || '-'} />
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
            <DetailRow label="Amenities" value={viewCategory.amenities.split(", ")} />
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
        isLoading={mutationApi.isLoading}
      />
    </div>
  );
}
