import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EquipmentAdd from "./pages/EquipmentAdd";
import EquipmentList from "./pages/EquipmentList";
import DepartmentList from "./pages/DepartmentList";
import DepartmentAdd from "./pages/DepartmentAdd";
import DepartmentEdit from "./pages/DepartmentEdit";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/equipment/add" element={<EquipmentAdd />} />
          <Route path="/equipment/list" element={<EquipmentList />} />
          <Route path="/equipment/edit/:id" element={<EquipmentEdit />} />
          <Route path="/equipment/detail/:id" element={<EquipmentDetail />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/departments/add" element={<DepartmentAdd />} />
          <Route path="/departments/edit/:id" element={<DepartmentEdit />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<UserAdd />} />
          <Route path="/users/detail/:id" element={<UserDetail />} />
          <Route path="/users/edit/:id" element={<UserEdit />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/add" element={<CategoryAdd />} />
          <Route path="/categories/edit/:id" element={<CategoryEdit />} />
          <Route path="/history" element={<History />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
