import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dog, Cat } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Welcome Screen - Entry point for new and existing users
 * Directs users to sign up or sign in
 */
const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Logo */}
      <div className="pt-12 px-6 text-center">
        <div className="inline-flex items-center justify-center">
          <Logo size="md" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="mb-8 flex gap-4 animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-md">
            <Dog className="w-12 h-12 text-slate-700" />
          </div>
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-md">
            <Cat className="w-12 h-12 text-slate-700" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 text-center mb-2">
          All your pet's needs,
        </h2>
        <h2 className="text-2xl font-semibold text-slate-900 text-center mb-8">
          all in one place.
        </h2>
      </div>

      {/* CTA Buttons - Thumb-friendly at bottom */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={() => navigate("/onboarding/signin")}
          className="w-full h-14 text-base font-semibold rounded-2xl shadow-md"
          size="lg"
        >
          Sign In
        </Button>
        
        <Button
          onClick={() => navigate("/onboarding/email")}
          variant="outline"
          className="w-full h-14 text-base font-semibold rounded-2xl border-2"
          size="lg"
        >
          Join Livepet
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
