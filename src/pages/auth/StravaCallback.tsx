import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Strava OAuth Callback Handler
 */
const StravaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  useEffect(() => {
    handleCallback();
  }, [code, error]);

  const handleCallback = async () => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Authorization Failed",
        description: "Could not connect to Strava",
      });
      navigate("/settings");
      return;
    }

    if (!code || !user) {
      navigate("/settings");
      return;
    }

    try {
      // Exchange authorization code for access token
      // In production, this should be done on your backend to keep client secret secure
      const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
      
      // NOTE: For security, this should be done via your backend API
      // This is a simplified example - in production, create a backend endpoint
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to exchange token");
      }

      // Store the integration in the database
      const { error: dbError } = await supabase
        .from("user_integrations")
        .upsert({
          user_id: user.id,
          service: "strava",
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
          scope: data.scope,
        });

      if (dbError) throw dbError;

      toast({
        title: "Successfully Connected!",
        description: "Your Strava account has been connected",
      });

      navigate("/settings");
    } catch (error: any) {
      console.error("Error connecting Strava:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message,
      });
      navigate("/settings");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <p className="text-slate-600">Connecting to Strava...</p>
      </div>
    </div>
  );
};

export default StravaCallback;

