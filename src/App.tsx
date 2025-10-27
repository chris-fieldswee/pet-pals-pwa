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
import SignIn from "./pages/onboarding/SignIn";
import VerifyCode from "./pages/onboarding/VerifyCode";
import ForgotPassword from "./pages/onboarding/ForgotPassword";
import ResetPassword from "./pages/onboarding/ResetPassword";
import CreateAccount from "./pages/onboarding/CreateAccount";
import Success from "./pages/onboarding/Success";
import AddPetStep1 from "./pages/onboarding/AddPetStep1";
import AddPetStep2 from "./pages/onboarding/AddPetStep2";
import AddPetStep3 from "./pages/onboarding/AddPetStep3";
import PetSuccess from "./pages/onboarding/PetSuccess";
import Dashboard from "./pages/Dashboard";
import PetDashboard from "./pages/PetDashboard";
import ProfilePage from "./pages/pet/ProfilePage";
import WalkPage from "./pages/walk/WalkPage";
import GuidedWalkDetails from "./pages/walk/GuidedWalkDetails";
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
              <Route path="/onboarding/signin" element={<SignIn />} />
              <Route path="/onboarding/email" element={<EmailEntry />} />
              <Route path="/onboarding/verify-code" element={<VerifyCode />} />
              <Route path="/onboarding/forgot-password" element={<ForgotPassword />} />
              <Route path="/onboarding/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding/create-account" element={<CreateAccount />} />
              <Route path="/onboarding/success" element={<Success />} />
              <Route path="/onboarding/add-pet" element={<AddPetStep1 />} />
              <Route path="/onboarding/add-pet-step2" element={<AddPetStep2 />} />
              <Route path="/onboarding/add-pet-step3" element={<AddPetStep3 />} />
              <Route path="/onboarding/pet-success" element={<PetSuccess />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pet/:petId" element={<PetDashboard />} />
              <Route path="/pet/:petId/profile" element={<ProfilePage />} />
              <Route path="/pet/:petId/walk" element={<WalkPage />} />
              <Route path="/pet/:petId/guided-walk/:walkId" element={<GuidedWalkDetails />} />
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
