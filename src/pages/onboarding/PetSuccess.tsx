import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Pet Success Screen - Shows after completing pet onboarding
 */
const PetSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const petName = location.state?.petName || "your pet";
  const [lastPetId, setLastPetId] = useState<string | null>(null);

  useEffect(() => {
    fetchLastPet();
  }, []);

  const fetchLastPet = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("pets")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setLastPetId(data.id);
      }
    } catch (error) {
      console.error("Error fetching last pet:", error);
    }
  };

  const handleGoToPet = () => {
    if (lastPetId) {
      navigate(`/pet/${lastPetId}`);
    } else {
      navigate("/dashboard");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 animate-scale-in">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          You're off to a great start!
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed max-w-sm mb-8">
          {petName}'s basic profile is ready. Add a few more details to unlock personalized insights, health reminders, and daily care suggestions.
        </p>
      </div>

      {/* Footer Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          Complete Profile
        </Button>
        
        <Button
          onClick={handleGoToPet}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
          variant="outline"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PetSuccess;

