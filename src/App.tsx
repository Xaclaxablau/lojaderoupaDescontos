import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import AboutUsPage from "./pages/AboutUsPage";
import CookieConsent from './components/CookieConsent';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import GarimpoOfertas from "./pages/GarimpoOfertas";
import GarimpoOfertaView from "./pages/GarimpoOfertaView";
import GarimpoOfertaViewImg from "./pages/GarimpoOfertaViewImg";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:category" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              } />
              <Route path="/garimpo" element={
                <PrivateRoute>
                  <GarimpoOfertas />
                </PrivateRoute>
              } />
              <Route path="/garimpo/:id" element={<GarimpoOfertaView />} />
              <Route path="/garimpoim/:id" element={<GarimpoOfertaViewImg />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
