import { useEffect, useState } from "react";
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
  const [checkingSession, setCheckingSession] = useState(true);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Wait for session to be available
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session check:", session?.user?.id);
      
      if (!session && !user) {
        // Wait a bit more for auth to initialize
        setTimeout(() => {
          console.log("No session after timeout, redirecting to welcome");
          navigate("/welcome");
        }, 2000);
        return;
      }
      
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (checkingSession) return;
    console.log("StravaCallback mounted", { code, error, user });
    handleCallback();
  }, [code, error, checkingSession]);

  const handleCallback = async () => {
    console.log("handleCallback called", { error, code, user });
    
    if (error) {
      console.error("Strava authorization error:", error);
      toast({
        variant: "destructive",
        title: "Authorization Failed",
        description: "Could not connect to Strava",
      });
      navigate("/settings");
      return;
    }

    if (!code) {
      console.log("No authorization code received");
      navigate("/settings");
      return;
    }

    // Get current session if user is null
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = user || session?.user;
    
    if (!currentUser) {
      console.log("No user found in session, redirecting to welcome");
      navigate("/welcome");
      return;
    }

    console.log("Using user:", currentUser.id);

    try {
      // Exchange authorization code for access token
      // In production, this should be done on your backend to keep client secret secure
      const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
      const redirectUri = `${window.location.origin}/auth/strava/callback`;
      
      console.log("Exchanging token with:", { 
        clientId: !!clientId, 
        clientSecret: !!clientSecret, 
        redirectUri,
        code 
      });
      
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
      console.log("Strava response:", { ok: response.ok, status: response.status, data });

      if (!response.ok) {
        console.error("Strava error details:", data);
        throw new Error(data.message || data.error || "Failed to exchange token");
      }

      // Store the integration in the database
      const { error: dbError } = await supabase
        .from("user_integrations")
        .upsert({
          user_id: currentUser.id,
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

