import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Link as LinkIcon, Unlink, Music2, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * User Settings Page - Manage user profile and integrations
 */
const UserSettings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
      return;
    }

    fetchProfile();
    checkIntegrations();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrations = async () => {
    if (!user) return;

    try {
      const { data: strava } = await supabase
        .from("user_integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("service", "strava")
        .single();

      const { data: spotify } = await supabase
        .from("user_integrations")
        .select("*")
        .eq("user_id", user.id)
        .eq("service", "spotify")
        .single();

      setStravaConnected(!!strava && strava.access_token);
      setSpotifyConnected(!!spotify && spotify.access_token);
    } catch (error) {
      console.error("Error checking integrations:", error);
    }
  };

  const handleConnectStrava = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/strava/callback`;
    
    if (!clientId) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Strava client ID not configured",
      });
      return;
    }

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=activity:write,activity:read`;
    
    window.location.href = authUrl;
  };

  const handleConnectSpotify = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/spotify/callback`;
    
    if (!clientId) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Spotify client ID not configured",
      });
      return;
    }

    const scopes = "user-read-private user-read-email user-read-playback-state user-modify-playback-state";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    window.location.href = authUrl;
  };

  const handleDisconnectStrava = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("service", "strava");

      if (error) throw error;

      setStravaConnected(false);
      toast({
        title: "Disconnected",
        description: "Strava has been disconnected",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDisconnectSpotify = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("service", "spotify");

      if (error) throw error;

      setSpotifyConnected(false);
      toast({
        title: "Disconnected",
        description: "Spotify has been disconnected",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  if (loading) {
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
          {/* User Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {profile?.first_name || "User"}
                </h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </Card>

          {/* Integrations Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Connected Apps
            </h2>

            <div className="space-y-3">
              {/* Strava Integration */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Strava</h3>
                      <p className="text-sm text-slate-500">
                        Track workouts and activities
                      </p>
                    </div>
                  </div>
                  {stravaConnected ? (
                    <Button
                      onClick={handleDisconnectStrava}
                      variant="outline"
                      size="sm"
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnectStrava} size="sm">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </Card>

              {/* Spotify Integration */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <Music2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Spotify</h3>
                      <p className="text-sm text-slate-500">
                        Play music during activities
                      </p>
                    </div>
                  </div>
                  {spotifyConnected ? (
                    <Button
                      onClick={handleDisconnectSpotify}
                      variant="outline"
                      size="sm"
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={handleConnectSpotify} size="sm">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;

