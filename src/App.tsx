import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import RoomsPage from "./pages/dashboard/RoomsPage";
import GuestsPage from "./pages/dashboard/GuestsPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import RestaurantPage from "./pages/dashboard/RestaurantPage";
import RestaurantOrderPage from "./pages/dashboard/RestaurantOrderPage";
import LaundryPage from "./pages/dashboard/LaundryPage";
import EventsPage from "./pages/dashboard/EventsPage";
import GymPage from "./pages/dashboard/GymPage";
import PoolPage from "./pages/dashboard/PoolPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import CheckoutReportPage from "./pages/dashboard/CheckoutReportPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import EmployeesPage from "./pages/dashboard/EmployeesPage";
import DepartmentsPage from "./pages/dashboard/DepartmentsPage";
import SuperAdminPage from "./pages/dashboard/SuperAdminPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ChangePasswordPage from "./pages/dashboard/ChangePasswordPage";
import HotelAdminsPage from "./pages/dashboard/HotelAdminsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="guests" element={<GuestsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="checkout/:bookingId" element={<CheckoutReportPage />} />
                <Route path="restaurant" element={<RestaurantPage />} />
                <Route path="restaurant/orders" element={<RestaurantOrderPage />} />
                <Route path="laundry" element={<LaundryPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="gym" element={<GymPage />} />
                <Route path="pool" element={<PoolPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/:reportType" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="super-admin" element={<ProtectedRoute allowedRoles={["super-admin"]}><SuperAdminPage /></ProtectedRoute>} />
                <Route path="hotel-admins" element={<ProtectedRoute allowedRoles={["super-admin"]}><HotelAdminsPage /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute allowedRoles={["sub-admin", "manager", "receptionist", "gym-head", "laundry-staff", "event-manager", "restaurant-staff"]}><ProfilePage /></ProtectedRoute>} />
                <Route path="change-password" element={<ChangePasswordPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;