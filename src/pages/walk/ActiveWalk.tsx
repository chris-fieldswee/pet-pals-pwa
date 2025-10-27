import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Square, Pause, Play, Flag, MapPin, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Active Walk Tracking Page
 * Tracks walk in progress and saves to database + Strava
 */
const ActiveWalk = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [startTime] = useState<Date>(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0); // in km
  const [pet, setPet] = useState<any>(null);

  useEffect(() => {
    fetchPet();
    const interval = setInterval(() => {
      if (!isPaused) {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const fetchPet = async () => {
    if (!petId) return;
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();
      if (error) throw error;
      setPet(data);
    } catch (error) {
      console.error("Error fetching pet:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    if (!user || !petId || !pet) return;

    try {
      // Mock distance (in a real app, get from GPS tracking)
      const mockDistance = 1.5 + Math.random() * 2; // 1.5-3.5 km

      // Save to activities table
      const { data: activity, error: activityError } = await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          pet_id: petId,
          activity_type: "walk",
          title: `Walk with ${pet.name}`,
          description: `Walked ${mockDistance.toFixed(1)} km in ${formatTime(elapsedTime)}`,
          distance_km: mockDistance,
          duration_minutes: Math.floor(elapsedTime / 60),
          created_at: startTime.toISOString(),
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Try to publish to Strava
      await publishToStrava(user.id, {
        name: `${pet.name}'s Walk`,
        type: "walk",
        startDate: startTime,
        elapsedTime: elapsedTime,
        distance: mockDistance,
        description: `Walk with ${pet.name} via Livepet`,
      });

      toast({
        title: "Walk completed!",
        description: `${mockDistance.toFixed(1)} km in ${formatTime(elapsedTime)}`,
      });

      navigate(`/pet/${petId}`);
    } catch (error: any) {
      console.error("Error saving walk:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save walk: " + error.message,
      });
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this walk?")) {
      navigate(`/pet/${petId}/walk`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Active Walk</h1>
          <Button onClick={handleCancel} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="px-6 py-6 space-y-6">
          {/* Map Placeholder */}
          <Card className="h-64 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">GPS Tracking Active</p>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-slate-600">Time</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatTime(elapsedTime)}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flag className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-slate-600">Distance</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {distance.toFixed(2)} km
              </p>
            </Card>
          </div>

          {/* Pet Info */}
          {pet && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{pet.name[0]}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">{pet.name}</p>
                  <p className="text-sm text-slate-600">Walking together</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Fixed Bottom Controls */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-6 z-50">
        <div className="space-y-3">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant={isPaused ? "default" : "outline"}
            className="w-full h-14"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            )}
          </Button>

          <Button
            onClick={handleFinish}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white"
          >
            <Square className="w-5 h-5 mr-2" />
            Finish Walk
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Publish activity to Strava
 */
const publishToStrava = async (
  userId: string,
  activityData: {
    name: string;
    type: string;
    startDate: Date;
    elapsedTime: number;
    distance: number;
    description?: string;
  }
) => {
  try {
    // Get user's Strava integration
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("service", "strava")
      .single();

    if (!integration || !integration.access_token) {
      console.log("Strava not connected");
      return;
    }

    // Check if token is expired (simple check, in production use refresh token)
    if (
      integration.token_expires_at &&
      new Date(integration.token_expires_at) < new Date()
    ) {
      console.log("Strava token expired");
      return;
    }

    // Map activity type to Strava format
    const typeMap: Record<string, string> = {
      walk: "Walk",
      run: "Run",
      ride: "Ride",
      hike: "Hike",
    };
    const stravaType = typeMap[activityData.type] || "Workout";

    // Publish to Strava
    const response = await fetch("https://www.strava.com/api/v3/activities", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: activityData.name,
        type: stravaType,
        start_date_local: activityData.startDate.toISOString(),
        elapsed_time: activityData.elapsedTime,
        distance: activityData.distance * 1000, // convert km to meters
        description: activityData.description || "",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to publish to Strava:", error);
      return;
    }

    const result = await response.json();
    console.log("Published to Strava:", result);
  } catch (error) {
    console.error("Error publishing to Strava:", error);
    // Silent fail - don't interrupt user
  }
};

export default ActiveWalk;

