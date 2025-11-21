import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import ScanHistory from "./pages/ScanHistory";
import Search from "./pages/Search";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import IngredientDetail from "./pages/IngredientDetail";
import Diagnostic from "./pages/Diagnostic";
import SkinDiagnostic from "./pages/SkinDiagnostic";
import SkinDiagnosticResults from "./pages/SkinDiagnosticResults";
import Routine from "./pages/Routine";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminIngredients from "./pages/AdminIngredients";
import AdminRoutines from "./pages/AdminRoutines";
import AdminProducts from "./pages/AdminProducts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/scan/history" element={<ScanHistory />} />
          <Route path="/search" element={<Search />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ingredient/:id" element={<IngredientDetail />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/diagnostic/peau" element={<SkinDiagnostic />} />
          <Route path="/diagnostic/peau/resultats" element={<SkinDiagnosticResults />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/ingredients" element={<AdminIngredients />} />
          <Route path="/admin/routines" element={<AdminRoutines />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
