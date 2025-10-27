import { useEffect, useState } from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep, totalSteps]);

  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-slate-600">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

