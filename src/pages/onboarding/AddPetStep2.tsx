import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StepIndicator } from "@/components/StepIndicator";

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
  const [breeds, setBreeds] = useState<Array<{ id: string; name: string }>>([]);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (petType) {
      loadBreeds();
    }
  }, [petType]);

  const loadBreeds = async () => {
    try {
      const { data, error } = await supabase
        .from("breeds")
        .select("id, name")
        .eq("type", petType)
        .order("name");

      if (error) throw error;
      setBreeds(data || []);
    } catch (error: any) {
      console.error("Error loading breeds:", error);
      toast({
        variant: "destructive",
        title: "Failed to load breeds",
        description: error.message,
      });
    }
  };

  const canFinish = day && month && year;

  const handleFinish = async () => {
    if (!canFinish || !user) return;

    setLoading(true);

    try {
      // Format date
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      const { error } = await supabase
        .from("pets")
        .insert({
          user_id: user.id,
          name: petName,
          type: petType,
          breed: breed || null,
          birth_date: birthDate,
          photo_url: photoUrl,
        });

      if (error) throw error;

      // Navigate to preferences step instead of dashboard
      navigate("/onboarding/add-pet-step3", {
        state: {
          petName,
          petType,
          breed,
          birthDate,
          photoUrl
        }
      });
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please choose an image smaller than 5MB.",
      });
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `pet-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
      toast({
        title: "Photo uploaded!",
        description: "Your pet's photo has been added.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Step Indicator */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="pt-6 px-6">
          <StepIndicator currentStep={2} totalSteps={3} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-24 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Just a few more details
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="breed" className="text-base text-slate-700">
              Breed (Optional)
            </Label>
            <Select value={breed} onValueChange={setBreed}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select breed" />
              </SelectTrigger>
              <SelectContent>
                {breeds.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-slate-700">
              Pet's Birthday or 'Gotcha Day'*
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Day</label>
                <Select value={day} onValueChange={setDay}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="DD" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Month</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: "1", label: "January" },
                      { value: "2", label: "February" },
                      { value: "3", label: "March" },
                      { value: "4", label: "April" },
                      { value: "5", label: "May" },
                      { value: "6", label: "June" },
                      { value: "7", label: "July" },
                      { value: "8", label: "August" },
                      { value: "9", label: "September" },
                      { value: "10", label: "October" },
                      { value: "11", label: "November" },
                      { value: "12", label: "December" },
                    ].map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Year</label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              We use this for birthday reminders and age-based content
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="text-base text-slate-700">
              Add a profile photo (Optional)
            </Label>
            <label
              htmlFor="photo"
              className={`w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer ${
                photoUrl ? 'border-green-500' : ''
              }`}
            >
              {photoUrl ? (
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <img src={photoUrl} alt="Pet" className="w-full h-full object-cover" />
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-600">Tap to add photo</span>
                </>
              )}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 z-50 mt-auto">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold rounded-2xl"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleFinish}
            disabled={!canFinish || loading}
            className="flex-1 h-12 text-base font-semibold rounded-2xl"
            size="lg"
          >
            {loading ? "Saving..." : "Next"}
            {!loading && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPetStep2;
