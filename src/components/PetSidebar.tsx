import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, User, Settings, LogOut, X, HeartPulse } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PetSidebarProps {
  currentPetId: string;
  children: React.ReactNode;
}

/**
 * Pet Sidebar - Navigation menu opened by clicking pet icon
 * Custom implementation to stay within mobile frame
 */
export const PetSidebar = ({ currentPetId, children }: PetSidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch pets
      const { data: petsData } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setPets(petsData || []);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePetChange = (petId: string) => {
    navigate(`/pet/${petId}`);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  const currentPet = pets.find(p => p.id === currentPetId);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-3">
        {children}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } md:!absolute md:!inset-0`}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
        />

        {/* Sidebar Content */}
        <div className={`
          absolute left-0 top-0 bottom-0 w-[320px] bg-white shadow-xl z-50
          transition-transform duration-300 transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Pet Selector */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Switch Pet</h3>
              <Select value={currentPetId} onValueChange={handlePetChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue>
                    {currentPet ? currentPet.name : "Select a pet"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => {
                  navigate(`/pet/${currentPetId}/profile`);
                  setOpen(false);
                }}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => {
                  navigate(`/pet/${currentPetId}/health`);
                  setOpen(false);
                }}
              >
                <HeartPulse className="w-5 h-5 mr-3" />
                Health & Nutrition
              </Button>
            </div>

            {/* Add Pet Button */}
            <Button
              onClick={() => {
                navigate("/onboarding/add-pet");
                setOpen(false);
              }}
              className="w-full h-12"
              variant="outline"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add a Pet
            </Button>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-slate-200 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {profile?.first_name || "User"}
              </p>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-sm"
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
