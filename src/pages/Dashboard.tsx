import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Home, Calendar, User, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Dashboard - Main app home screen
 * Shows user's pets and provides navigation
 */
const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pets, setPets] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
      return;
    }

    fetchData();
  }, [user, navigate]);

  // Redirect to first pet's dashboard when pets are loaded
  useEffect(() => {
    if (!loading && pets.length > 0 && location.pathname === "/dashboard") {
      // Only redirect if we're on the dashboard page and have pets
      navigate(`/pet/${pets[0].id}`, { replace: true });
    }
  }, [pets, loading, navigate, location.pathname]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch pets
      const { data: petsData } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setPets(petsData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {profile?.first_name}!
            </h1>
            <p className="text-sm text-slate-600">Your pets are waiting</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="rounded-full"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">My Pets</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/onboarding/add-pet")}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pet
          </Button>
        </div>

        {pets.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No pets yet
            </h3>
            <p className="text-slate-600 mb-4">
              Add your first pet to get started!
            </p>
            <Button onClick={() => navigate("/onboarding/add-pet")}>
              Add Your First Pet
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pets.map((pet) => (
              <Card 
                key={pet.id} 
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => navigate(`/pet/${pet.id}`)}
              >
                <div className="flex items-center gap-4">
                  {pet.photo_url ? (
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-slate-600 capitalize">
                      {pet.type} {pet.breed ? `• ${pet.breed}` : ""}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 md:relative">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Calendar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Health</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
