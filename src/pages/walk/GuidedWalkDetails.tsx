import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Clock, User, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Guided Walk Details Page
 * Shows details about a specific guided walk before starting
 */
const GuidedWalkDetails = () => {
  const { petId, walkId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [walk, setWalk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalkDetails();
  }, [walkId]);

  const fetchWalkDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("guided_walks")
        .select("*")
        .eq("id", walkId)
        .single();

      if (error) throw error;
      setWalk(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading walk",
        description: error.message,
      });
      navigate(`/pet/${petId}/walk`);
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

  if (!walk) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Walk not found</p>
          <Button onClick={() => navigate(`/pet/${petId}/walk`)}>
            Back to Walks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/pet/${petId}/walk`)}
            className="hover:bg-transparent hover:text-current"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div 
        className="h-64 bg-slate-200 relative"
        style={{
          backgroundImage: `url(${walk.hero_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto px-6 space-y-6 py-6">
          {/* Title and Stats */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{walk.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {walk.duration} Min
              </span>
              <span>•</span>
              <span>{walk.category}</span>
              <span>•</span>
              <span className="capitalize">{walk.level}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-slate-700 leading-relaxed">{walk.description}</p>
          </div>

          {/* Trainer Info */}
          {walk.trainer_name && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                {walk.trainer_image_url && (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={walk.trainer_image_url}
                      alt={walk.trainer_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {walk.trainer_name}
                  </p>
                  {walk.trainer_bio && (
                    <p className="text-sm text-slate-600 mt-1">{walk.trainer_bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Practice Tags */}
          {walk.practice_tags && walk.practice_tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">What You'll Practice</h3>
              <div className="flex flex-wrap gap-2">
                {walk.practice_tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-6 z-50">
        <div className="max-w-md mx-auto space-y-3">
          <Button
            onClick={() => {
              // TODO: Navigate to active walk with this guided walk
              alert(`Starting guided walk: ${walk.title}`);
            }}
            className="w-full h-14 text-base font-semibold"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            START GUIDED WALK
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: "Download started",
                description: `${walk.title} is being downloaded for offline use`,
              });
            }}
            variant="outline"
            className="w-full h-14 text-base"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Walk
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedWalkDetails;

