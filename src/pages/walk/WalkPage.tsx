import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Walk Page - Main walk activity page
 * This is a placeholder for the walk feature implementation
 */
const WalkPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pet/${petId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Walk Activity</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-600 mb-4">
              Walk tracking feature will be implemented here
            </p>
            <p className="text-sm text-slate-500">
              This will include maps, guided walks, and walk statistics
            </p>
          </div>
          
          <Button
            onClick={() => navigate(`/pet/${petId}`)}
            className="w-full"
            variant="outline"
          >
            Back to Pet Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalkPage;

