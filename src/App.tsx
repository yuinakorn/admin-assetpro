import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EquipmentAdd from "./pages/EquipmentAdd";
import EquipmentList from "./pages/EquipmentList";
import DepartmentList from "./pages/DepartmentList";
import DepartmentAdd from "./pages/DepartmentAdd";
import DepartmentEdit from "./pages/DepartmentEdit";
import DepartmentEquipment from "./pages/DepartmentEquipment";
import UserList from "./pages/UserList";
import UserAdd from "./pages/UserAdd";
import UserDetail from "./pages/UserDetail";
import UserEdit from "./pages/UserEdit";
import EquipmentEdit from "./pages/EquipmentEdit";
import EquipmentDetail from "./pages/EquipmentDetail";
import History from "./pages/History";
import CategoryList from "./pages/CategoryList";
import CategoryAdd from "./pages/CategoryAdd";
import CategoryEdit from "./pages/CategoryEdit";
import NotFound from "./pages/NotFound";
import CPUList from "./pages/CPUList";
import CPUAdd from "./pages/CPUAdd";
import CPUEdit from "./pages/CPUEdit";
import HarddiskList from "./pages/HarddiskList";
import HarddiskAdd from "./pages/HarddiskAdd";
import HarddiskEdit from "./pages/HarddiskEdit";
import OSList from "./pages/OSList";
import OSAdd from "./pages/OSAdd";
import OSEdit from "./pages/OSEdit";
import OfficeList from "./pages/OfficeList";
import OfficeAdd from "./pages/OfficeAdd";
import OfficeEdit from "./pages/OfficeEdit";
import QRScanner from "./pages/QRScanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SidebarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/equipment/add" element={
                <ProtectedRoute>
                  <EquipmentAdd />
                </ProtectedRoute>
              } />
              
              <Route path="/equipment/list" element={
                <ProtectedRoute>
                  <EquipmentList />
                </ProtectedRoute>
              } />
              
              <Route path="/equipment/:id" element={
                <ProtectedRoute>
                  <EquipmentDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/equipment/edit/:id" element={
                <ProtectedRoute>
                  <EquipmentEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/equipment/detail/:id" element={
                <ProtectedRoute>
                  <EquipmentDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/departments" element={
                <ProtectedRoute>
                  <DepartmentList />
                </ProtectedRoute>
              } />
              
              <Route path="/departments/add" element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentAdd />
                </ProtectedRoute>
              } />
              
              <Route path="/departments/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/departments/:departmentId/equipment" element={
                <ProtectedRoute>
                  <DepartmentEquipment />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute requiredRole="admin">
                  <UserList />
                </ProtectedRoute>
              } />
              
              <Route path="/users/add" element={
                <ProtectedRoute requiredRole="admin">
                  <UserAdd />
                </ProtectedRoute>
              } />
              
              <Route path="/users/detail/:id" element={
                <ProtectedRoute>
                  <UserDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/users/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <UserEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/categories" element={
                <ProtectedRoute>
                  <CategoryList />
                </ProtectedRoute>
              } />
              
              <Route path="/categories/add" element={
                <ProtectedRoute requiredRole="manager">
                  <CategoryAdd />
                </ProtectedRoute>
              } />
              
              <Route path="/categories/edit/:id" element={
                <ProtectedRoute requiredRole="manager">
                  <CategoryEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />

              <Route path="/properties/cpu" element={
                <ProtectedRoute>
                  <CPUList />
                </ProtectedRoute>
              } />

              <Route path="/properties/cpu/add" element={
                <ProtectedRoute requiredRole="admin">
                  <CPUAdd />
                </ProtectedRoute>
              } />

              <Route path="/properties/cpu/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <CPUEdit />
                </ProtectedRoute>
              } />

              <Route path="/properties/harddisk" element={
                <ProtectedRoute>
                  <HarddiskList />
                </ProtectedRoute>
              } />

              <Route path="/properties/harddisk/add" element={
                <ProtectedRoute requiredRole="admin">
                  <HarddiskAdd />
                </ProtectedRoute>
              } />

              <Route path="/properties/harddisk/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <HarddiskEdit />
                </ProtectedRoute>
              } />

              <Route path="/properties/os" element={
                <ProtectedRoute>
                  <OSList />
                </ProtectedRoute>
              } />

              <Route path="/properties/os/add" element={
                <ProtectedRoute requiredRole="admin">
                  <OSAdd />
                </ProtectedRoute>
              } />

              <Route path="/properties/os/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <OSEdit />
                </ProtectedRoute>
              } />

              <Route path="/properties/office" element={
                <ProtectedRoute>
                  <OfficeList />
                </ProtectedRoute>
              } />

              <Route path="/properties/office/add" element={
                <ProtectedRoute requiredRole="admin">
                  <OfficeAdd />
                </ProtectedRoute>
              } />

              <Route path="/properties/office/edit/:id" element={
                <ProtectedRoute requiredRole="admin">
                  <OfficeEdit />
                </ProtectedRoute>
              } />
              
              <Route path="/qr-scanner" element={
                <ProtectedRoute>
                  <QRScanner />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
