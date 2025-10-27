import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MobileFrame } from "@/components/MobileFrame";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import EmailEntry from "./pages/onboarding/EmailEntry";
import CreateAccount from "./pages/onboarding/CreateAccount";
import Success from "./pages/onboarding/Success";
import AddPetStep1 from "./pages/onboarding/AddPetStep1";
import AddPetStep2 from "./pages/onboarding/AddPetStep2";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MobileFrame>
            <Routes>
              <Route path="/" element={<Navigate to="/splash" replace />} />
              <Route path="/splash" element={<Splash />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/onboarding/email" element={<EmailEntry />} />
              <Route path="/onboarding/create-account" element={<CreateAccount />} />
              <Route path="/onboarding/success" element={<Success />} />
              <Route path="/onboarding/add-pet" element={<AddPetStep1 />} />
              <Route path="/onboarding/add-pet-step2" element={<AddPetStep2 />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MobileFrame>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
