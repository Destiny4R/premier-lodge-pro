import { UserRole } from "./mockData";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  hotelId?: string;
  department: string;
  status: "active" | "inactive" | "suspended";
  permissions: Permission[];
  joinDate: string;
  avatar: string;
}

export interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export const defaultPermissions: Permission[] = [
  { module: "Rooms", create: false, read: true, update: false, delete: false },
  { module: "Guests", create: false, read: true, update: false, delete: false },
  { module: "Bookings", create: false, read: true, update: false, delete: false },
  { module: "Restaurant", create: false, read: true, update: false, delete: false },
  { module: "Laundry", create: false, read: true, update: false, delete: false },
  { module: "Events", create: false, read: true, update: false, delete: false },
  { module: "Gym", create: false, read: true, update: false, delete: false },
  { module: "Pool", create: false, read: true, update: false, delete: false },
  { module: "Reports", create: false, read: true, update: false, delete: false },
];

export const rolePermissionDefaults: Record<string, Permission[]> = {
  "sub-admin": defaultPermissions.map(p => ({ ...p, create: true, read: true, update: true, delete: true })),
  "manager": defaultPermissions.map(p => ({ ...p, create: true, read: true, update: true, delete: false })),
  "receptionist": [
    { module: "Rooms", create: false, read: true, update: true, delete: false },
    { module: "Guests", create: true, read: true, update: true, delete: false },
    { module: "Bookings", create: true, read: true, update: true, delete: false },
    { module: "Restaurant", create: false, read: true, update: false, delete: false },
    { module: "Laundry", create: false, read: true, update: false, delete: false },
    { module: "Events", create: false, read: true, update: false, delete: false },
    { module: "Gym", create: false, read: true, update: false, delete: false },
    { module: "Pool", create: false, read: true, update: false, delete: false },
    { module: "Reports", create: false, read: false, update: false, delete: false },
  ],
  "gym-head": [
    { module: "Rooms", create: false, read: false, update: false, delete: false },
    { module: "Guests", create: false, read: true, update: false, delete: false },
    { module: "Bookings", create: false, read: false, update: false, delete: false },
    { module: "Restaurant", create: false, read: false, update: false, delete: false },
    { module: "Laundry", create: false, read: false, update: false, delete: false },
    { module: "Events", create: false, read: false, update: false, delete: false },
    { module: "Gym", create: true, read: true, update: true, delete: true },
    { module: "Pool", create: false, read: true, update: false, delete: false },
    { module: "Reports", create: false, read: true, update: false, delete: false },
  ],
  "laundry-staff": [
    { module: "Rooms", create: false, read: true, update: false, delete: false },
    { module: "Guests", create: false, read: true, update: false, delete: false },
    { module: "Bookings", create: false, read: false, update: false, delete: false },
    { module: "Restaurant", create: false, read: false, update: false, delete: false },
    { module: "Laundry", create: true, read: true, update: true, delete: false },
    { module: "Events", create: false, read: false, update: false, delete: false },
    { module: "Gym", create: false, read: false, update: false, delete: false },
    { module: "Pool", create: false, read: false, update: false, delete: false },
    { module: "Reports", create: false, read: false, update: false, delete: false },
  ],
  "event-manager": [
    { module: "Rooms", create: false, read: true, update: false, delete: false },
    { module: "Guests", create: false, read: true, update: false, delete: false },
    { module: "Bookings", create: false, read: true, update: false, delete: false },
    { module: "Restaurant", create: false, read: true, update: false, delete: false },
    { module: "Laundry", create: false, read: false, update: false, delete: false },
    { module: "Events", create: true, read: true, update: true, delete: true },
    { module: "Gym", create: false, read: false, update: false, delete: false },
    { module: "Pool", create: false, read: false, update: false, delete: false },
    { module: "Reports", create: false, read: true, update: false, delete: false },
  ],
  "restaurant-staff": [
    { module: "Rooms", create: false, read: true, update: false, delete: false },
    { module: "Guests", create: false, read: true, update: false, delete: false },
    { module: "Bookings", create: false, read: false, update: false, delete: false },
    { module: "Restaurant", create: true, read: true, update: true, delete: false },
    { module: "Laundry", create: false, read: false, update: false, delete: false },
    { module: "Events", create: false, read: false, update: false, delete: false },
    { module: "Gym", create: false, read: false, update: false, delete: false },
    { module: "Pool", create: false, read: false, update: false, delete: false },
    { module: "Reports", create: false, read: false, update: false, delete: false },
  ],
  "store-keeper": defaultPermissions.map(p => ({ ...p, create: false, read: true, update: false, delete: false })),
};

export const employees: Employee[] = [
  {
    id: "emp1",
    name: "Sarah Johnson",
    email: "sarah@luxestay.com",
    phone: "+1 555-0201",
    role: "manager",
    hotelId: "h1",
    department: "Operations",
    status: "active",
    permissions: rolePermissionDefaults["manager"],
    joinDate: "2023-01-15",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "emp2",
    name: "Michael Chen",
    email: "michael@luxestay.com",
    phone: "+1 555-0202",
    role: "receptionist",
    hotelId: "h1",
    department: "Front Desk",
    status: "active",
    permissions: rolePermissionDefaults["receptionist"],
    joinDate: "2023-03-20",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
  {
    id: "emp3",
    name: "Emily Davis",
    email: "emily@luxestay.com",
    phone: "+1 555-0203",
    role: "restaurant-staff",
    hotelId: "h1",
    department: "F&B",
    status: "active",
    permissions: rolePermissionDefaults["restaurant-staff"],
    joinDate: "2023-05-10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
  },
  {
    id: "emp4",
    name: "James Wilson",
    email: "james.w@luxestay.com",
    phone: "+1 555-0204",
    role: "gym-head",
    hotelId: "h1",
    department: "Fitness Center",
    status: "active",
    permissions: rolePermissionDefaults["gym-head"],
    joinDate: "2023-02-28",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    id: "emp5",
    name: "Lisa Martinez",
    email: "lisa@luxestay.com",
    phone: "+1 555-0205",
    role: "laundry-staff",
    hotelId: "h1",
    department: "Housekeeping",
    status: "inactive",
    permissions: rolePermissionDefaults["laundry-staff"],
    joinDate: "2023-04-05",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  },
  {
    id: "emp6",
    name: "Robert Brown",
    email: "robert@luxestay.com",
    phone: "+1 555-0206",
    role: "event-manager",
    hotelId: "h1",
    department: "Events",
    status: "active",
    permissions: rolePermissionDefaults["event-manager"],
    joinDate: "2023-06-15",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
];

export const roleLabels: Record<UserRole, string> = {
  "super-admin": "Super Admin",
  "sub-admin": "Hotel Admin",
  "manager": "Manager",
  "receptionist": "Receptionist",
  "gym-head": "Gym Head",
  "laundry-staff": "Laundry Staff",
  "event-manager": "Event Manager",
  "restaurant-staff": "Restaurant Staff",
  "store-keeper": "Store Keeper",
};

export const roleOptions = Object.entries(roleLabels)
  .filter(([key]) => key !== "super-admin")
  .map(([value, label]) => ({ value, label }));
