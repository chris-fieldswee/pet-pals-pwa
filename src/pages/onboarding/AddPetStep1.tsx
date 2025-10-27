import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dog, Cat, ChevronLeft } from "lucide-react";
import { StepIndicator } from "@/components/StepIndicator";

/**
 * Add Pet Step 1 - Pet name and type
 */
const AddPetStep1 = () => {
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<"dog" | "cat" | null>(null);

  const canContinue = petName.trim().length > 0 && petType !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate("/onboarding/add-pet-step2", { 
      state: { petName, petType } 
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Step Indicator */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-50">
        <div className="pt-6 px-6">
          <StepIndicator currentStep={1} totalSteps={3} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 pb-24 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Tell us about your friend
        </h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="petName" className="text-base text-slate-700">
              What's your pet's name?*
            </Label>
            <Input
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g., Buddy"
              className="h-12 text-base rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base text-slate-700">
              What kind of pet?*
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPetType("dog")}
                className={`h-32 rounded-2xl border-2 transition-all ${
                  petType === "dog"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Dog className={`w-12 h-12 ${petType === "dog" ? "text-primary" : "text-slate-400"}`} />
                  <span className={`font-semibold ${petType === "dog" ? "text-primary" : "text-slate-700"}`}>
                    Dog
                  </span>
                </div>
              </button>

              <button
                onClick={() => setPetType("cat")}
                className={`h-32 rounded-2xl border-2 transition-all ${
                  petType === "cat"
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Cat className={`w-12 h-12 ${petType === "cat" ? "text-primary" : "text-slate-400"}`} />
                  <span className={`font-semibold ${petType === "cat" ? "text-primary" : "text-slate-700"}`}>
                    Cat
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 z-50 mt-auto">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold rounded-2xl"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex-1 h-12 text-base font-semibold rounded-2xl"
            size="lg"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPetStep1;
