import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Save, X, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Pet Profile Page - View and edit pet profile with organized sections
 */
const ProfilePage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<any>(null);
  const [editedPet, setEditedPet] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>("basic");

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
      setEditedPet(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading pet",
        description: error.message,
      });
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setEditedPet({ ...pet });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!user || !petId || !editedPet) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pets")
        .update(editedPet)
        .eq("id", petId)
        .eq("user_id", user.id);

      if (error) throw error;

      setPet(editedPet);
      setIsEditMode(false);
      
      toast({
        title: "Profile updated!",
        description: "Pet profile has been saved successfully.",
      });
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

  const handleInputChange = (field: string, value: any) => {
    setEditedPet((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sections = [
    { id: "basic", title: "Basic Information", icon: "📋" },
    { id: "activity", title: "Activity & Lifestyle", icon: "🏃" },
    { id: "health", title: "Health & Wellness", icon: "🏥" },
    { id: "care", title: "Care Team & Support", icon: "👥" },
  ];

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
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/pet/${petId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Pet Profile</h1>
          </div>
          
          {!isEditMode ? (
            <Button onClick={handleEdit} size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span>{section.icon}</span>
              <span className="text-sm font-medium">{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {activeSection === "basic" && (
            <BasicInfoSection 
              pet={isEditMode ? editedPet : pet} 
              isEditMode={isEditMode} 
              onInputChange={handleInputChange} 
            />
          )}
          
          {activeSection === "activity" && (
            <ActivityLifestyleSection 
              pet={isEditMode ? editedPet : pet} 
              isEditMode={isEditMode} 
              onInputChange={handleInputChange} 
            />
          )}
          
          {activeSection === "health" && (
            <HealthWellnessSection 
              pet={isEditMode ? editedPet : pet} 
              isEditMode={isEditMode} 
              onInputChange={handleInputChange} 
            />
          )}
          
          {activeSection === "care" && (
            <CareTeamSection 
              pet={isEditMode ? editedPet : pet} 
              isEditMode={isEditMode} 
              onInputChange={handleInputChange} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Basic Info Section Component
const BasicInfoSection = ({ pet, isEditMode, onInputChange }: any) => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            {isEditMode ? (
              <Input
                value={pet?.name || ""}
                onChange={(e) => onInputChange("name", e.target.value)}
              />
            ) : (
              <p className="text-slate-700">{pet?.name || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Type</Label>
            {isEditMode ? (
              <Select value={pet?.type || ""} onValueChange={(value) => onInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-slate-700 capitalize">{pet?.type || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Breed</Label>
            {isEditMode ? (
              <Input
                value={pet?.breed || ""}
                onChange={(e) => onInputChange("breed", e.target.value)}
                placeholder="e.g., Golden Retriever"
              />
            ) : (
              <p className="text-slate-700">{pet?.breed || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Birth Date</Label>
            {isEditMode ? (
              <Input
                type="date"
                value={pet?.birth_date || ""}
                onChange={(e) => onInputChange("birth_date", e.target.value)}
              />
            ) : (
              <p className="text-slate-700">
                {pet?.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "Not set"}
              </p>
            )}
          </div>

          <div>
            <Label>Gender</Label>
            {isEditMode ? (
              <Select value={pet?.gender || ""} onValueChange={(value) => onInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-slate-700 capitalize">{pet?.gender || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Weight (lbs)</Label>
            {isEditMode ? (
              <Input
                type="number"
                value={pet?.weight_lbs || ""}
                onChange={(e) => onInputChange("weight_lbs", e.target.value)}
                placeholder="e.g., 50"
              />
            ) : (
              <p className="text-slate-700">{pet?.weight_lbs ? `${pet.weight_lbs} lbs` : "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Personality Traits</Label>
            {isEditMode ? (
              <Textarea
                value={pet?.personality || ""}
                onChange={(e) => onInputChange("personality", e.target.value)}
                placeholder="Describe your pet's personality..."
              />
            ) : (
              <p className="text-slate-700">{pet?.personality || "Not set"}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Activity & Lifestyle Section Component
const ActivityLifestyleSection = ({ pet, isEditMode, onInputChange }: any) => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity & Lifestyle</h2>
        <div className="space-y-4">
          <div>
            <Label>Activity Level</Label>
            {isEditMode ? (
              <Select value={pet?.activity_level || ""} onValueChange={(value) => onInputChange("activity_level", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-slate-700 capitalize">{pet?.activity_level || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Walks per Day</Label>
            {isEditMode ? (
              <Input
                type="number"
                value={pet?.walks_per_day || ""}
                onChange={(e) => onInputChange("walks_per_day", e.target.value)}
                placeholder="e.g., 2"
              />
            ) : (
              <p className="text-slate-700">{pet?.walks_per_day || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Exercise Preferences</Label>
            {isEditMode ? (
              <Textarea
                value={pet?.exercise_preferences || ""}
                onChange={(e) => onInputChange("exercise_preferences", e.target.value)}
                placeholder="e.g., Loves running, playing fetch..."
              />
            ) : (
              <p className="text-slate-700">{pet?.exercise_preferences || "Not set"}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Health & Wellness Section Component
const HealthWellnessSection = ({ pet, isEditMode, onInputChange }: any) => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Health & Wellness</h2>
        <div className="space-y-4">
          <div>
            <Label>Primary Veterinarian</Label>
            {isEditMode ? (
              <Input
                value={pet?.primary_vet || ""}
                onChange={(e) => onInputChange("primary_vet", e.target.value)}
                placeholder="Vet clinic name"
              />
            ) : (
              <p className="text-slate-700">{pet?.primary_vet || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Vet Phone</Label>
            {isEditMode ? (
              <Input
                type="tel"
                value={pet?.vet_phone || ""}
                onChange={(e) => onInputChange("vet_phone", e.target.value)}
                placeholder="e.g., (555) 123-4567"
              />
            ) : (
              <p className="text-slate-700">{pet?.vet_phone || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Microchip ID</Label>
            {isEditMode ? (
              <Input
                value={pet?.microchip_id || ""}
                onChange={(e) => onInputChange("microchip_id", e.target.value)}
                placeholder="e.g., 123456789"
              />
            ) : (
              <p className="text-slate-700">{pet?.microchip_id || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Insurance Provider</Label>
            {isEditMode ? (
              <Input
                value={pet?.insurance_provider || ""}
                onChange={(e) => onInputChange("insurance_provider", e.target.value)}
                placeholder="e.g., Pet Insurance Co."
              />
            ) : (
              <p className="text-slate-700">{pet?.insurance_provider || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Insurance Policy Number</Label>
            {isEditMode ? (
              <Input
                value={pet?.insurance_policy || ""}
                onChange={(e) => onInputChange("insurance_policy", e.target.value)}
                placeholder="Policy number"
              />
            ) : (
              <p className="text-slate-700">{pet?.insurance_policy || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Medical Notes</Label>
            {isEditMode ? (
              <Textarea
                value={pet?.medical_notes || ""}
                onChange={(e) => onInputChange("medical_notes", e.target.value)}
                placeholder="Any important medical information..."
                rows={4}
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap">{pet?.medical_notes || "Not set"}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Care Team Section Component
const CareTeamSection = ({ pet, isEditMode, onInputChange }: any) => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Care Team & Support</h2>
        <div className="space-y-4">
          <div>
            <Label>Emergency Contact</Label>
            {isEditMode ? (
              <Input
                value={pet?.emergency_contact || ""}
                onChange={(e) => onInputChange("emergency_contact", e.target.value)}
                placeholder="Emergency contact name"
              />
            ) : (
              <p className="text-slate-700">{pet?.emergency_contact || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Emergency Phone</Label>
            {isEditMode ? (
              <Input
                type="tel"
                value={pet?.emergency_phone || ""}
                onChange={(e) => onInputChange("emergency_phone", e.target.value)}
                placeholder="e.g., (555) 123-4567"
              />
            ) : (
              <p className="text-slate-700">{pet?.emergency_phone || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Special Dietary Requirements</Label>
            {isEditMode ? (
              <Textarea
                value={pet?.diet_requirements || ""}
                onChange={(e) => onInputChange("diet_requirements", e.target.value)}
                placeholder="e.g., Grain-free, prescription diet..."
              />
            ) : (
              <p className="text-slate-700">{pet?.diet_requirements || "Not set"}</p>
            )}
          </div>

          <div>
            <Label>Medication Schedule</Label>
            {isEditMode ? (
              <Textarea
                value={pet?.medication_schedule || ""}
                onChange={(e) => onInputChange("medication_schedule", e.target.value)}
                placeholder="e.g., Heartworm prevention - monthly"
                rows={3}
              />
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap">{pet?.medication_schedule || "Not set"}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
