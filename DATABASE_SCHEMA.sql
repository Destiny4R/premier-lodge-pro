-- =====================================================
-- LuxeStay Hotel Management System - Database Schema
-- =====================================================
-- This schema supports all UI features and API endpoints
-- Database: PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- User Roles Enum
-- =====================================================
CREATE TYPE user_role AS ENUM ('SuperAdmin', 'SubAdmin', 'Manager', 'Receptionist');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE booking_status AS ENUM ('confirmed', 'checked-in', 'checked-out', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE laundry_status AS ENUM ('received', 'processing', 'ready', 'delivered');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'room-charge');
CREATE TYPE charge_type AS ENUM ('hourly', 'daily');
CREATE TYPE menu_category AS ENUM ('food', 'drink');
CREATE TYPE membership_type AS ENUM ('basic', 'premium', 'vip');
CREATE TYPE employee_status AS ENUM ('active', 'on-leave', 'terminated');
CREATE TYPE department_status AS ENUM ('active', 'inactive');

-- =====================================================
-- Hotels Table
-- =====================================================
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    image VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0.0,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Users Table (Authentication)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    status user_status DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- User Roles Table (Many-to-Many: Users can have multiple roles)
-- CRITICAL: Roles stored separately to prevent privilege escalation
-- =====================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL, -- NULL for SuperAdmin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role, hotel_id)
);

-- =====================================================
-- User Permissions Table
-- =====================================================
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL, -- 'Full Control', 'Can Edit', 'Can Delete', 'Can View', 'Can Create'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission)
);

-- =====================================================
-- Room Categories Table
-- =====================================================
CREATE TABLE room_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_occupancy INTEGER DEFAULT 2,
    amenities JSONB DEFAULT '[]'::jsonb, -- Array of amenity strings
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Rooms Table
-- =====================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES room_categories(id) ON DELETE RESTRICT,
    room_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    status room_status DEFAULT 'available',
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    is_promoted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hotel_id, room_number)
);

-- =====================================================
-- Guests Table
-- =====================================================
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    id_type VARCHAR(50) NOT NULL, -- 'Passport', 'Driver License', 'National ID'
    id_number VARCHAR(100) NOT NULL,
    address TEXT,
    avatar VARCHAR(500),
    total_stays INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Bookings Table
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status booking_status DEFAULT 'confirmed',
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- =====================================================
-- Departments Table
-- =====================================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_id UUID, -- References employees.id (added later via ALTER)
    status department_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Employees Table
-- =====================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to auth user if applicable
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2),
    start_date DATE NOT NULL,
    status employee_status DEFAULT 'active',
    avatar VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for department head
ALTER TABLE departments ADD CONSTRAINT fk_department_head 
    FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =====================================================
-- Menu Items Table (Restaurant)
-- =====================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category menu_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Restaurant Orders Table
-- =====================================================
CREATE TABLE restaurant_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    items JSONB NOT NULL, -- Array of {menuItemId, name, quantity, price}
    status order_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Laundry Items Table
-- =====================================================
CREATE TABLE laundry_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Laundry Orders Table
-- =====================================================
CREATE TABLE laundry_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    items JSONB NOT NULL, -- Array of {laundryItemId, name, quantity, price}
    status laundry_status DEFAULT 'received',
    payment_method payment_method NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Event Halls Table
-- =====================================================
CREATE TABLE event_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Events Table
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    hall_id UUID NOT NULL REFERENCES event_halls(id) ON DELETE RESTRICT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    charge_type charge_type NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status event_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_event_dates CHECK (end_date > start_date)
);

-- =====================================================
-- Gym Members Table
-- =====================================================
CREATE TABLE gym_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    membership_type membership_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status membership_status DEFAULT 'active',
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_membership_dates CHECK (end_date >= start_date)
);

-- =====================================================
-- Pool Access Table
-- =====================================================
CREATE TABLE pool_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    access_type VARCHAR(20) NOT NULL, -- 'included', 'paid'
    access_date DATE NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_hotel_id ON user_roles(hotel_id);

-- Rooms
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_category_id ON rooms(category_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_promoted ON rooms(is_promoted) WHERE is_promoted = TRUE;

-- Bookings
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);

-- Guests
CREATE INDEX idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX idx_guests_email ON guests(email);

-- Employees
CREATE INDEX idx_employees_hotel_id ON employees(hotel_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);

-- Orders
CREATE INDEX idx_restaurant_orders_hotel_id ON restaurant_orders(hotel_id);
CREATE INDEX idx_restaurant_orders_status ON restaurant_orders(status);
CREATE INDEX idx_laundry_orders_hotel_id ON laundry_orders(hotel_id);
CREATE INDEX idx_laundry_orders_status ON laundry_orders(status);

-- Events
CREATE INDEX idx_events_hotel_id ON events(hotel_id);
CREATE INDEX idx_events_hall_id ON events(hall_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

-- =====================================================
-- Trigger for updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_categories_updated_at BEFORE UPDATE ON room_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_orders_updated_at BEFORE UPDATE ON restaurant_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laundry_items_updated_at BEFORE UPDATE ON laundry_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laundry_orders_updated_at BEFORE UPDATE ON laundry_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_halls_updated_at BEFORE UPDATE ON event_halls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_members_updated_at BEFORE UPDATE ON gym_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pool_access_updated_at BEFORE UPDATE ON pool_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Security Function: Check User Role
-- SECURITY DEFINER to bypass RLS and prevent recursive issues
-- =====================================================
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =====================================================
-- Security Function: Get User Hotel
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_hotel(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hotel_id
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE user_roles IS 'User role assignments - separated for security';
COMMENT ON TABLE hotels IS 'Hotel properties managed in the system';
COMMENT ON TABLE rooms IS 'Hotel rooms with status and pricing';
COMMENT ON TABLE bookings IS 'Guest room bookings with check-in/out dates';
COMMENT ON TABLE guests IS 'Guest information and history';
COMMENT ON TABLE departments IS 'Hotel departments (Front Office, Housekeeping, etc.)';
COMMENT ON TABLE employees IS 'Hotel staff members';
COMMENT ON TABLE restaurant_orders IS 'Food and beverage orders';
COMMENT ON TABLE laundry_orders IS 'Laundry service orders';
COMMENT ON TABLE events IS 'Event hall bookings';
COMMENT ON TABLE gym_members IS 'Gym membership records';
COMMENT ON TABLE pool_access IS 'Pool usage records';
