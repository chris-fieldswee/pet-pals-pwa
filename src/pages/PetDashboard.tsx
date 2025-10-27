import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MapPin, Compass, Bell, MessageCircle, Home, Activity, Plus, Heart, FileText, ShoppingCart, ActivityLog } from "lucide-react";
import { PetSidebar } from "@/components/PetSidebar";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerDescription } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !petId) {
      navigate("/dashboard");
      return;
    }

    fetchPet();
    fetchActivities();
  }, [user, petId, navigate]);

  const fetchActivities = async () => {
    if (!petId) return;
    
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
    }
  };

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
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-24 space-y-6">
        {/* Profile Completion Message */}
        {!pet.breed && !pet.personality && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  Complete {pet.name}'s Profile
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  Add more details to unlock personalized insights and features
                </p>
                <Button
                  onClick={() => navigate(`/pet/${petId}/profile`)}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back, {pet.name}!
          </h1>
          <p className="text-slate-600">
            {pet.breed ? `${pet.breed}` : `${pet.type}`} • {new Date().getFullYear() - new Date(pet.birth_date).getFullYear()} years old
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/pet/${petId}/health`)}
            variant="outline"
            className="h-20 flex-col gap-2 bg-white hover:bg-slate-50"
          >
            <ActivityLog className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold">Health Log</span>
          </Button>

          <Button
            onClick={() => navigate("/activities")}
            variant="outline"
            className="h-20 flex-col gap-2 bg-white hover:bg-slate-50"
          >
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold">Activities</span>
          </Button>

          <Button
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Medical summary feature coming soon",
              });
            }}
            variant="outline"
            className="h-20 flex-col gap-2 bg-white hover:bg-slate-50"
          >
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold">Medical Summary</span>
          </Button>

          <Button
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Pet products shop coming soon",
              });
            }}
            variant="outline"
            className="h-20 flex-col gap-2 bg-white hover:bg-slate-50"
          >
            <ShoppingCart className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold">Buy Products</span>
          </Button>
        </div>

        {/* Recent Activities Preview */}
        {activities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/activities")}
              >
                View all
              </Button>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                {activities[0].media_url && activities[0].media_type === 'image' && (
                  <img
                    src={activities[0].media_url}
                    alt={activities[0].title}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary uppercase">
                      {activities[0].activity_type}
                    </span>
                    {activities[0].duration_minutes && (
                      <span className="text-xs text-slate-500">
                        {activities[0].duration_minutes} min
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 truncate">
                    {activities[0].title}
                  </h3>
                  {activities[0].description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {activities[0].description}
                    </p>
                  )}
                  {activities[0].location_name && (
                    <p className="text-xs text-slate-500 mt-2">
                      📍 {activities[0].location_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(activities[0].created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="flex flex-col items-center gap-1 relative">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 mt-1">Add</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Add Activity</DrawerTitle>
                <DrawerDescription>Choose an activity to track with {pet?.name}</DrawerDescription>
              </DrawerHeader>
              <div className="p-6 space-y-3">
                <Button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate(`/pet/${petId}/walk`);
                  }}
                  className="w-full h-16 justify-start text-left"
                  variant="outline"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Walk</p>
                      <p className="text-sm text-slate-600">Track your walking activity</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    // TODO: Navigate to feed activity
                    toast({
                      title: "Coming soon",
                      description: "Feed tracking will be available soon",
                    });
                  }}
                  className="w-full h-16 justify-start text-left"
                  variant="outline"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Feed</p>
                      <p className="text-sm text-slate-600">Log meals and snacks</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    // TODO: Navigate to play activity
                    toast({
                      title: "Coming soon",
                      description: "Play tracking will be available soon",
                    });
                  }}
                  className="w-full h-16 justify-start text-left"
                  variant="outline"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Play</p>
                      <p className="text-sm text-slate-600">Record playtime sessions</p>
                    </div>
                  </div>
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
          
          <button 
            onClick={() => navigate("/activities")}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs font-medium">Activities</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PetDashboard;

