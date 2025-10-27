import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MapPin, Compass, Bell, MessageCircle, Home, Activity, Plus, Heart } from "lucide-react";
import { PetSidebar } from "@/components/PetSidebar";

/**
 * Pet Dashboard - Individual pet's main view
 */
const PetDashboard = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !petId) {
      navigate("/dashboard");
      return;
    }

    fetchPet();
  }, [user, petId, navigate]);

  const fetchPet = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setPet(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading pet",
        description: error.message,
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Pet not found</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Fixed Top Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Pet Profile Picture and Name */}
          <PetSidebar currentPetId={petId}>
            <button className="flex items-center gap-3">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
              )}
              <span className="text-lg font-semibold text-slate-900">{pet.name}</span>
            </button>
          </PetSidebar>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <MapPin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Compass className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back, {pet.name}!
          </h1>
          <p className="text-slate-600">
            {pet.breed ? `${pet.breed}` : `${pet.type}`} • {new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} years old
          </p>
        </div>

        {/* Activity Cards Placeholder */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-200">
            <div className="text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No activities yet
              </h3>
              <p className="text-sm text-slate-600">
                Tap the + button below to start tracking activities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => navigate(`/pet/${petId}`)}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          {/* Emphasized Plus Button */}
          <button className="flex flex-col items-center gap-1 relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-600 mt-1">Add</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Activities</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDashboard;

