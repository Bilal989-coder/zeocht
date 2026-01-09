import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { RoleProvider } from "./contexts/RoleContext";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import ExperienceDetail from "./pages/ExperienceDetail";
import ExplorerDashboard from "./pages/ExplorerDashboard";
import ExplorerRequests from "./pages/ExplorerRequests";
import ExplorerProfile from "./pages/ExplorerProfile";
import ExplorerBookings from "./pages/ExplorerBookings";
import GuideDashboard from "./pages/GuideDashboard";
import GuideOnboarding from "./pages/GuideOnboarding";
import GuideProfile from "./pages/GuideProfile";
import GuideBookings from "./pages/GuideBookings";
import CreateService from "./pages/CreateService";
import Messages from "./pages/Messages";
import GuideDetailView from "./pages/GuideDetailView";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import LivestreamRoom from "./pages/LivestreamRoom";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RoleProvider>
        <LocaleProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* Shared Routes - Both Roles */}
            <Route path="/explore" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><Explore /></RoleBasedRoute>} />
            <Route path="/experience/:id" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><ExperienceDetail /></RoleBasedRoute>} />
            <Route path="/explore/guides/:guideId" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><GuideDetailView /></RoleBasedRoute>} />
            <Route path="/messages" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><Messages /></RoleBasedRoute>} />
            <Route path="/settings" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><Settings /></RoleBasedRoute>} />
            
            {/* Explorer Only Routes */}
            <Route path="/explorer/dashboard" element={<RoleBasedRoute allowedRoles={['explorer']}><ExplorerDashboard /></RoleBasedRoute>} />
            <Route path="/explorer/requests" element={<RoleBasedRoute allowedRoles={['explorer']}><ExplorerRequests /></RoleBasedRoute>} />
            <Route path="/explorer/bookings" element={<RoleBasedRoute allowedRoles={['explorer']}><ExplorerBookings /></RoleBasedRoute>} />
            <Route path="/explorer/profile" element={<RoleBasedRoute allowedRoles={['explorer']}><ExplorerProfile /></RoleBasedRoute>} />
            <Route path="/explorer/settings" element={<RoleBasedRoute allowedRoles={['explorer']}><Settings /></RoleBasedRoute>} />
            <Route path="/payment" element={<RoleBasedRoute allowedRoles={['explorer']}><Payment /></RoleBasedRoute>} />
            <Route path="/payment-success" element={<RoleBasedRoute allowedRoles={['explorer']}><PaymentSuccess /></RoleBasedRoute>} />
            <Route path="/payment-cancelled" element={<RoleBasedRoute allowedRoles={['explorer']}><PaymentCancelled /></RoleBasedRoute>} />
            <Route path="/livestream/:bookingId" element={<RoleBasedRoute allowedRoles={['explorer', 'host']}><LivestreamRoom /></RoleBasedRoute>} />
            
            {/* Host Only Routes */}
            <Route path="/guide/onboarding" element={<RoleBasedRoute allowedRoles={['host']}><GuideOnboarding /></RoleBasedRoute>} />
            <Route path="/guide/dashboard" element={<RoleBasedRoute allowedRoles={['host']}><GuideDashboard /></RoleBasedRoute>} />
            <Route path="/guide/bookings" element={<RoleBasedRoute allowedRoles={['host']}><GuideBookings /></RoleBasedRoute>} />
            <Route path="/guide/profile" element={<RoleBasedRoute allowedRoles={['host']}><GuideProfile /></RoleBasedRoute>} />
            <Route path="/guide/settings" element={<RoleBasedRoute allowedRoles={['host']}><Settings /></RoleBasedRoute>} />
            <Route path="/guide/service/new" element={<RoleBasedRoute allowedRoles={['host']}><CreateService /></RoleBasedRoute>} />
            <Route path="/guide/service/:id/edit" element={<RoleBasedRoute allowedRoles={['host']}><CreateService /></RoleBasedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </LocaleProvider>
      </RoleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
