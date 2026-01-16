# Project Structure

```
├── public
    ├── favicon.ico
    ├── placeholder.svg
    └── robots.txt
├── src
    ├── api
    │   └── api.ts
    ├── assets
    │   └── hero-hotel.jpg
    ├── components
    │   ├── auth
    │   │   └── ProtectedRoute.tsx
    │   ├── forms
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── FormField.tsx
    │   │   ├── FormModal.tsx
    │   │   ├── ImageUpload.tsx
    │   │   ├── index.ts
    │   │   └── ViewModal.tsx
    │   ├── layout
    │   │   ├── DashboardHeader.tsx
    │   │   ├── DashboardLayout.tsx
    │   │   ├── DashboardSidebar.tsx
    │   │   ├── PublicFooter.tsx
    │   │   └── PublicNavbar.tsx
    │   ├── ui
    │   │   ├── accordion.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── alert.tsx
    │   │   ├── aspect-ratio.tsx
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── button.tsx
    │   │   ├── calendar.tsx
    │   │   ├── card.tsx
    │   │   ├── carousel.tsx
    │   │   ├── chart.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── collapsible.tsx
    │   │   ├── command.tsx
    │   │   ├── context-menu.tsx
    │   │   ├── data-table.tsx
    │   │   ├── date-picker.tsx
    │   │   ├── DatePicker.tsx
    │   │   ├── dialog.tsx
    │   │   ├── drawer.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── form.tsx
    │   │   ├── hover-card.tsx
    │   │   ├── input-otp.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── loading-state.tsx
    │   │   ├── menubar.tsx
    │   │   ├── navigation-menu.tsx
    │   │   ├── pagination.tsx
    │   │   ├── popover.tsx
    │   │   ├── progress.tsx
    │   │   ├── radio-group.tsx
    │   │   ├── resizable.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── slider.tsx
    │   │   ├── sonner.tsx
    │   │   ├── switch.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   ├── toggle-group.tsx
    │   │   ├── toggle.tsx
    │   │   ├── tooltip.tsx
    │   │   └── use-toast.ts
    │   ├── NavLink.tsx
    │   └── Pagination.tsx
    ├── contexts
    │   ├── AuthContext.tsx
    │   ├── SidebarContext.tsx
    │   └── ThemeContext.tsx
    ├── data
    │   ├── employeeData.ts
    │   └── mockData.ts
    ├── hooks
    │   ├── use-mobile.tsx
    │   ├── use-toast.ts
    │   └── useApi.ts
    ├── lib
    │   ├── api.ts
    │   └── utils.ts
    ├── pages
    │   ├── auth
    │   │   ├── LoginPage.tsx
    │   │   └── ResetPasswordPage.tsx
    │   ├── dashboard
    │   │   ├── BookingsPage.tsx
    │   │   ├── ChangePasswordPage.tsx
    │   │   ├── CheckoutReportPage.tsx
    │   │   ├── DashboardHome.tsx
    │   │   ├── DepartmentsPage.tsx
    │   │   ├── EmployeesPage.tsx
    │   │   ├── EventsPage.tsx
    │   │   ├── GuestDetailsPage.tsx
    │   │   ├── GuestsPage.tsx
    │   │   ├── GymPage.tsx
    │   │   ├── HotelAdminsPage.tsx
    │   │   ├── LaundryPage.tsx
    │   │   ├── PoolPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   ├── ReportsPage.tsx
    │   │   ├── RestaurantOrderPage.tsx
    │   │   ├── RestaurantPage.tsx
    │   │   ├── RoomsPage.tsx
    │   │   ├── SettingsPage.tsx
    │   │   └── SuperAdminPage.tsx
    │   ├── Index.tsx
    │   ├── LandingPage.tsx
    │   └── NotFound.tsx
    ├── services
    │   ├── authService.ts
    │   ├── bookingService.ts
    │   ├── dashboardService.ts
    │   ├── departmentService.ts
    │   ├── employeeService.ts
    │   ├── eventService.ts
    │   ├── guestService.ts
    │   ├── gymService.ts
    │   ├── hotelService.ts
    │   ├── index.ts
    │   ├── laundryService.ts
    │   ├── poolService.ts
    │   ├── publicService.ts
    │   ├── restaurantService.ts
    │   ├── roomService.ts
    │   └── settingsService.ts
    ├── types
    │   └── api.ts
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    └── vite-env.d.ts
├── bun.lockb
├── components.json
├── DATABASE_SCHEMA.sql
├── DOCTREE.md
├── eslint.config.js
├── fs-full.md
├── index.html
├── mock-server.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
