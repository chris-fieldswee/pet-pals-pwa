import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, HeartPulse, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ShareHealthProfileModal } from "@/components/health/ShareHealthProfileModal";

/**
 * Health Overview Screen - Comprehensive health tracking dashboard
 */
const HealthOverview = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (user && petId) {
      fetchPet();
    }
  }, [user, petId]);

  const fetchPet = async () => {
    if (!petId || !user) return;
    
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
      console.error("Error fetching pet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pet information.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Pet not found</p>
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
              className="hover:bg-transparent hover:text-current"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Health Overview</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setShareModalOpen(true)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Profile
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {/* Placeholder Content */}
          <Card className="p-8 text-center">
            <HeartPulse className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Health Overview
            </h2>
            <p className="text-slate-600 mb-4">
              Comprehensive health tracking dashboard coming soon
            </p>
            <Button onClick={() => navigate(`/pet/${petId}/health`)}>
              View Health Log
            </Button>
          </Card>

          {/* TODO: Implement sections */}
          {/* - Pet Health Summary Card */}
          {/* - Vitals Tracker with Graphs */}
          {/* - Upcoming & Active Alerts */}
          {/* - Recent Health Events Timeline */}
          {/* - Quick Actions Bar */}
        </div>
      </div>

      {/* Share Health Profile Modal */}
      <ShareHealthProfileModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        petId={petId || ""}
        petName={pet?.name}
      />
    </div>
  );
};

export default HealthOverview;

