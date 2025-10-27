import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Pet Profile Page - Comprehensive profile management
 */
const ProfilePage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<any>(null);

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    if (!user || !petId) return;
    
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading pet",
        description: error.message,
      });
    }
  };

  const handleSave = async () => {
    if (!user || !petId || !pet) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pets")
        .update(pet)
        .eq("id", petId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Pet profile has been saved successfully.",
      });
      
      navigate(`/pet/${petId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pet/${petId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">{pet.name}'s Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
          
          {/* Basic Information */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={pet.breed || ""}
                onChange={(e) => setPet({ ...pet, breed: e.target.value })}
                placeholder="e.g., Golden Retriever"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={pet.date_of_birth || ""}
                onChange={(e) => setPet({ ...pet, date_of_birth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={pet.gender || ""} onValueChange={(value) => setPet({ ...pet, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color_or_markings">Color or Markings</Label>
              <Input
                id="color_or_markings"
                value={pet.color_or_markings || ""}
                onChange={(e) => setPet({ ...pet, color_or_markings: e.target.value })}
                placeholder="e.g., Golden with white chest"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality</Label>
              <Textarea
                id="personality"
                value={pet.personality || ""}
                onChange={(e) => setPet({ ...pet, personality: e.target.value })}
                placeholder="e.g., Playful and gentle..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favorite_activities">Favorite Activities</Label>
              <Input
                id="favorite_activities"
                value={pet.favorite_activities || ""}
                onChange={(e) => setPet({ ...pet, favorite_activities: e.target.value })}
                placeholder="e.g., Long walks, fetch, swimming"
              />
            </div>
          </section>

          {/* Activity & Lifestyle */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Activity & Lifestyle</h2>
            
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={pet.activity_level || ""} onValueChange={(value) => setPet({ ...pet, activity_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Very High">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Walk Frequency</Label>
              <Select value={pet.walk_frequency || ""} onValueChange={(value) => setPet({ ...pet, walk_frequency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select walk frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Several times a week">Several times a week</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Rarely">Rarely</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet_type">Diet Type</Label>
              <Input
                id="diet_type"
                value={pet.diet_type || ""}
                onChange={(e) => setPet({ ...pet, diet_type: e.target.value })}
                placeholder="e.g., Grain-free kibble..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeding_schedule">Feeding Schedule</Label>
              <Input
                id="feeding_schedule"
                value={pet.feeding_schedule || ""}
                onChange={(e) => setPet({ ...pet, feeding_schedule: e.target.value })}
                placeholder="e.g., 2 meals per day..."
              />
            </div>

            <div className="space-y-2">
              <Label>Socialization</Label>
              <Select value={pet.socialization || ""} onValueChange={(value) => setPet({ ...pet, socialization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select socialization level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Well-socialized">Well-socialized</SelectItem>
                  <SelectItem value="Somewhat social">Somewhat social</SelectItem>
                  <SelectItem value="Needs improvement">Needs improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Living Environment</Label>
              <Select value={pet.living_environment || ""} onValueChange={(value) => setPet({ ...pet, living_environment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select living environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="House with yard">House with yard</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Rural area">Rural area</SelectItem>
                  <SelectItem value="Suburban">Suburban</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Health & Wellness */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Health & Wellness</h2>
            
            <div className="space-y-2">
              <Label htmlFor="weight_lbs">Weight (lbs)</Label>
              <Input
                id="weight_lbs"
                type="number"
                value={pet.weight_lbs || ""}
                onChange={(e) => setPet({ ...pet, weight_lbs: e.target.value })}
                placeholder="e.g., 65"
              />
            </div>

            <div className="space-y-2">
              <Label>Spayed or Neutered?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pet.spayed_or_neutered === true}
                    onChange={() => setPet({ ...pet, spayed_or_neutered: true })}
                    className="w-4 h-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={pet.spayed_or_neutered === false}
                    onChange={() => setPet({ ...pet, spayed_or_neutered: false })}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="microchip_number">Microchip Number (if applicable)</Label>
              <Input
                id="microchip_number"
                value={pet.microchip_number || ""}
                onChange={(e) => setPet({ ...pet, microchip_number: e.target.value })}
                placeholder="Enter microchip ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_concerns">Health Concerns</Label>
              <Textarea
                id="health_concerns"
                value={pet.health_concerns || ""}
                onChange={(e) => setPet({ ...pet, health_concerns: e.target.value })}
                placeholder="List any ongoing or chronic conditions"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={pet.allergies || ""}
                onChange={(e) => setPet({ ...pet, allergies: e.target.value })}
                placeholder="e.g., Chicken, dust"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Current Medications</Label>
              <Textarea
                id="current_medications"
                value={pet.current_medications || ""}
                onChange={(e) => setPet({ ...pet, current_medications: e.target.value })}
                placeholder="Name, dosage, and frequency"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccinations">Vaccinations (optional)</Label>
              <Textarea
                id="vaccinations"
                value={pet.vaccinations || ""}
                onChange={(e) => setPet({ ...pet, vaccinations: e.target.value })}
                placeholder="e.g., Rabies – up to date"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Preventive Care</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="flea_tick"
                    checked={pet.flea_tick_prevention || false}
                    onCheckedChange={(checked) => setPet({ ...pet, flea_tick_prevention: checked })}
                  />
                  <Label htmlFor="flea_tick" className="font-normal cursor-pointer">
                    Flea/Tick prevention
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="heartworm"
                    checked={pet.heartworm_prevention || false}
                    onCheckedChange={(checked) => setPet({ ...pet, heartworm_prevention: checked })}
                  />
                  <Label htmlFor="heartworm" className="font-normal cursor-pointer">
                    Heartworm prevention
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dental"
                    checked={pet.dental_care_routine || false}
                    onCheckedChange={(checked) => setPet({ ...pet, dental_care_routine: checked })}
                  />
                  <Label htmlFor="dental" className="font-normal cursor-pointer">
                    Dental care routine
                  </Label>
                </div>
              </div>
            </div>
          </section>

          {/* Care Team & Support */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Care Team & Support</h2>
            
            <div className="space-y-2">
              <Label htmlFor="veterinarian_name">Veterinarian Name</Label>
              <Input
                id="veterinarian_name"
                value={pet.veterinarian_name || ""}
                onChange={(e) => setPet({ ...pet, veterinarian_name: e.target.value })}
                placeholder="Dr. Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input
                id="clinic_name"
                value={pet.clinic_name || ""}
                onChange={(e) => setPet({ ...pet, clinic_name: e.target.value })}
                placeholder="Riverside Animal Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet_phone">Vet Phone</Label>
              <Input
                id="vet_phone"
                type="tel"
                value={pet.vet_phone || ""}
                onChange={(e) => setPet({ ...pet, vet_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet_address">Vet Address</Label>
              <Textarea
                id="vet_address"
                value={pet.vet_address || ""}
                onChange={(e) => setPet({ ...pet, vet_address: e.target.value })}
                placeholder="123 Main Street, Springfield"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={pet.emergency_contact_name || ""}
                onChange={(e) => setPet({ ...pet, emergency_contact_name: e.target.value })}
                placeholder="Sarah Johnson"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={pet.emergency_contact_phone || ""}
                onChange={(e) => setPet({ ...pet, emergency_contact_phone: e.target.value })}
                placeholder="(555) 987-6543"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_insurance">Pet Insurance (optional)</Label>
              <Input
                id="pet_insurance"
                value={pet.pet_insurance || ""}
                onChange={(e) => setPet({ ...pet, pet_insurance: e.target.value })}
                placeholder="Provider and policy number"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 z-50">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;

