import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 44353; // Changed to match .env

// Middleware
app.use(cors());
app.use(express.json());

const mockRoomCategories = [
  { id: 'rc1', hotelId: 'h1', name: 'Standard Room', description: 'Comfortable room with essential amenities', basePrice: 150, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'rc2', hotelId: 'h1', name: 'Deluxe Room', description: 'Spacious room with premium amenities and city view', basePrice: 280, maxOccupancy: 3, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'City View', 'Work Desk'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'rc3', hotelId: 'h1', name: 'Executive Suite', description: 'Luxury suite with separate living area', basePrice: 450, maxOccupancy: 4, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'City View', 'Living Room', 'Jacuzzi'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'rc4', hotelId: 'h1', name: 'Presidential Suite', description: 'Ultimate luxury with panoramic views and butler service', basePrice: 850, maxOccupancy: 6, amenities: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Panoramic View', 'Living Room', 'Jacuzzi', 'Butler Service', 'Private Dining'], images: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const mockRooms = [
  { id: 'r1', hotelId: 'h1', categoryId: 'rc1', roomNumber: '101', floor: 1, status: 'available', price: 150, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Grand Palace' },
  { id: 'r2', hotelId: 'h1', categoryId: 'rc1', roomNumber: '102', floor: 1, status: 'occupied', price: 150, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Standard Room', hotelName: 'LuxeStay Grand Palace' },
  { id: 'r3', hotelId: 'h1', categoryId: 'rc2', roomNumber: '201', floor: 2, status: 'available', price: 280, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Grand Palace' },
  { id: 'r4', hotelId: 'h1', categoryId: 'rc2', roomNumber: '202', floor: 2, status: 'reserved', price: 280, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600', isPromoted: false, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Deluxe Room', hotelName: 'LuxeStay Grand Palace' },
  { id: 'r5', hotelId: 'h1', categoryId: 'rc3', roomNumber: '301', floor: 3, status: 'available', price: 450, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Executive Suite', hotelName: 'LuxeStay Grand Palace' },
  { id: 'r6', hotelId: 'h1', categoryId: 'rc4', roomNumber: '401', floor: 4, status: 'available', price: 850, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600', isPromoted: true, createdAt: '2024-01-01', updatedAt: '2024-01-01', categoryName: 'Presidential Suite', hotelName: 'LuxeStay Grand Palace' },
];

const mockRoomItems = mockRoomCategories.map(cat => ({
  disabled: false,
  group: null,
  selected: false,
  text: cat.name,
  value: cat.id,
}));

// API Routes
app.get('/api/v3/rooms/getrooms', (req, res) => {
  console.log('Mock API: GET /api/v3/rooms/getrooms called');
  res.json({
    success: true,
    data: {
      items: mockRooms,
      totalItems: mockRooms.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
    message: 'Rooms retrieved successfully',
    status: 200,
  });
});

app.get('/api/v3/rooms/getroomscategories', (req, res) => {
  console.log('Mock API: GET /api/v3/rooms/getroomscategories called');
  res.json({
    success: true,
    data: {
      items: mockRoomCategories,
      totalItems: mockRoomCategories.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    },
    message: 'Room categories retrieved successfully',
    status: 200,
  });
});

app.get('/api/v3/rooms/getroomsitems', (req, res) => {
  console.log('Mock API: GET /api/v3/rooms/getroomsitems called');
  res.json({
    success: true,
    data: mockRoomItems,
    message: 'Room items retrieved successfully',
    status: 200,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Mock API Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});