import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Clock, 
  User, 
  Camera,
  Activity as ActivityIcon,
  Utensils,
  Smile
} from "lucide-react";

/**
 * Activities Feed - Social media style feed showing user and followed users' activities
 */
const ActivitiesFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      // Fetch activities for current user
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          pets (name, photo_url, type)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (activityId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("activity_likes")
        .select("*")
        .eq("activity_id", activityId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("activity_likes")
          .delete()
          .eq("activity_id", activityId)
          .eq("user_id", user.id);
      } else {
        // Like
        await supabase
          .from("activity_likes")
          .insert({
            activity_id: activityId,
            user_id: user.id,
          });
      }

      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      walk: MapPin,
      feed: Utensils,
      play: ActivityIcon,
      health: Smile,
      photo: Camera,
      milestone: Heart,
    };
    return icons[type] || ActivityIcon;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Activities</h1>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No activities yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Start tracking activities to see them here
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.activity_type);
              const isLiked = activity.has_liked || false; // Would need to fetch this separately

              return (
                <Card key={activity.id} className="overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        {activity.pets?.photo_url ? (
                          <img
                            src={activity.pets.photo_url}
                            alt={activity.pets.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <ActivityIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {activity.pets?.name || "Pet"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTime(activity.created_at)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary uppercase">
                        {activity.activity_type}
                      </span>
                    </div>
                  </div>

                  {/* Media */}
                  {activity.media_url && (
                    <div className="aspect-square bg-slate-100">
                      <img
                        src={activity.media_url}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {activity.title}
                      </h3>
                      {activity.description && (
                        <p className="text-sm text-slate-600">
                          {activity.description}
                        </p>
                      )}
                    </div>

                    {/* Activity Details */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      {activity.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration_minutes} min
                        </span>
                      )}
                      {activity.distance_miles && (
                        <span>
                          {activity.distance_miles.toFixed(1)} miles
                        </span>
                      )}
                      {activity.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(activity.id)}
                        className="flex items-center gap-2 hover:text-red-600 transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isLiked ? "fill-red-600 text-red-600" : ""
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {activity.likes_count || 0}
                        </span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {activity.comments_count || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesFeed;

