import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StepIndicator } from "@/components/StepIndicator";

/**
 * Add Pet Step 3 - User preferences and goals
 */
const AddPetStep3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { petName, petType, breed, birthDate, photoUrl } = location.state || {};
  
  const [preferences, setPreferences] = useState({
    trackActivities: false,
    manageHealth: false,
    discoverActivities: false,
    trainingGuidance: false,
  });
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Update user profile with preferences
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          track_activities: preferences.trackActivities,
          manage_health: preferences.manageHealth,
          discover_activities: preferences.discoverActivities,
          training_guidance: preferences.trainingGuidance,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Navigate to success screen
      navigate("/onboarding/pet-success", { 
        state: { 
          petName,
          completed: false // Profile is not complete yet
        } 
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save preferences",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasSelectedPreference = 
    preferences.trackActivities || 
    preferences.manageHealth || 
    preferences.discoverActivities || 
    preferences.trainingGuidance;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Step Indicator */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="pt-6 px-6">
          <StepIndicator currentStep={3} totalSteps={3} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-24 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Choose your goals
        </h1>

        <p className="text-base text-slate-600 mb-8">
          What would you like Livepet to help with? Choose your goals so we can tailor tips, reminders, and insights just for you and your pet.
        </p>

        <div className="space-y-4">
          {/* Track Activities */}
          <button
            onClick={() => setPreferences(prev => ({ ...prev, trackActivities: !prev.trackActivities }))}
            className={`w-full p-4 bg-white rounded-2xl border-2 text-left transition-all ${
              preferences.trackActivities
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="trackActivities"
                checked={preferences.trackActivities}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, trackActivities: checked === true }))
                }
                className="mt-1 pointer-events-none"
              />
              <div className="flex-1">
                <label
                  htmlFor="trackActivities"
                  className="text-base font-semibold text-slate-900 cursor-pointer block mb-1"
                >
                  Track daily activities
                </label>
                <p className="text-sm text-slate-600">
                  Walks, meals, playtime. Keep your pet's routine consistent and balanced.
                </p>
              </div>
            </div>
          </button>

          {/* Manage Health */}
          <button
            onClick={() => setPreferences(prev => ({ ...prev, manageHealth: !prev.manageHealth }))}
            className={`w-full p-4 bg-white rounded-2xl border-2 text-left transition-all ${
              preferences.manageHealth
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="manageHealth"
                checked={preferences.manageHealth}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, manageHealth: checked === true }))
                }
                className="mt-1 pointer-events-none"
              />
              <div className="flex-1">
                <label
                  htmlFor="manageHealth"
                  className="text-base font-semibold text-slate-900 cursor-pointer block mb-1"
                >
                  Manage health and wellness
                </label>
                <p className="text-sm text-slate-600">
                  Appointments, medications, reminders. Stay organized and confident about your pet's care.
                </p>
              </div>
            </div>
          </button>

          {/* Discover Activities */}
          <button
            onClick={() => setPreferences(prev => ({ ...prev, discoverActivities: !prev.discoverActivities }))}
            className={`w-full p-4 bg-white rounded-2xl border-2 text-left transition-all ${
              preferences.discoverActivities
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="discoverActivities"
                checked={preferences.discoverActivities}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, discoverActivities: checked === true }))
                }
                className="mt-1 pointer-events-none"
              />
              <div className="flex-1">
                <label
                  htmlFor="discoverActivities"
                  className="text-base font-semibold text-slate-900 cursor-pointer block mb-1"
                >
                  Discover new activities
                </label>
                <p className="text-sm text-slate-600">
                  Events, challenges, ideas. Find fun, meaningful ways to spend time together.
                </p>
              </div>
            </div>
          </button>

          {/* Training Guidance */}
          <button
            onClick={() => setPreferences(prev => ({ ...prev, trainingGuidance: !prev.trainingGuidance }))}
            className={`w-full p-4 bg-white rounded-2xl border-2 text-left transition-all ${
              preferences.trainingGuidance
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="trainingGuidance"
                checked={preferences.trainingGuidance}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, trainingGuidance: checked === true }))
                }
                className="mt-1 pointer-events-none"
              />
              <div className="flex-1">
                <label
                  htmlFor="trainingGuidance"
                  className="text-base font-semibold text-slate-900 cursor-pointer block mb-1"
                >
                  Get training and behavior guidance
                </label>
                <p className="text-sm text-slate-600">
                  Support your pet's growth with expert advice and gentle techniques.
                </p>
              </div>
            </div>
          </button>
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
            disabled={!hasSelectedPreference || loading}
            className="flex-1 h-12 text-base font-semibold rounded-2xl"
            size="lg"
          >
            {loading ? "Saving..." : "Continue"}
            {!loading && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPetStep3;

