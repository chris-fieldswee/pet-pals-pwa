import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

/**
 * Success Screen - Confirms account creation
 * Transitions user to pet onboarding
 */
const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = location.state?.firstName || "there";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 animate-scale-in">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Account Created!
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed max-w-sm">
          Welcome to Livepet, {firstName}! Now, let's set up your first pet profile.
        </p>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={() => navigate("/onboarding/add-pet")}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          Add Your Pet
        </Button>
      </div>
    </div>
  );
};

export default Success;
