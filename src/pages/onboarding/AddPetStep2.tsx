import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Add Pet Step 2 - Additional details
 * Collects: breed, birth date, photo
 */
const AddPetStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { petName, petType } = location.state || {};
  
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const canFinish = birthDate !== undefined;

  const handleFinish = async () => {
    if (!canFinish || !user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("pets")
        .insert({
          user_id: user.id,
          name: petName,
          type: petType,
          breed: breed || null,
          birth_date: format(birthDate, "yyyy-MM-dd"),
          photo_url: null, // TODO: Implement photo upload
        });

      if (error) throw error;

      toast({
        title: "Pet added!",
        description: `${petName} has been added to your profile.`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add pet",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Content */}
      <div className="flex-1 px-6 pt-12 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Just a few more details
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="breed" className="text-base text-slate-700">
              Breed (Optional)
            </Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g., Golden Retriever"
              className="h-12 text-base rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base text-slate-700">
              Pet's Birthday or 'Gotcha Day'*
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal rounded-xl"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-slate-500">
              We use this for birthday reminders and age-based content
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-slate-700">
              Add a profile photo (Optional)
            </Label>
            <button
              className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors flex flex-col items-center justify-center gap-2"
              onClick={() => toast({ title: "Photo upload coming soon!" })}
            >
              <Camera className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-600">Tap to add photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={handleFinish}
          disabled={!canFinish || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Creating Profile..." : "Finish"}
        </Button>
        
        <Button
          onClick={handleFinish}
          variant="ghost"
          disabled={!canFinish || loading}
          className="w-full h-12 text-base font-medium"
        >
          Skip Photo
        </Button>
      </div>
    </div>
  );
};

export default AddPetStep2;
