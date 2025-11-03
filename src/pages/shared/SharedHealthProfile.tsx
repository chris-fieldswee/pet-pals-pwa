import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock, HeartPulse, Calendar, FileText, AlertCircle, TrendingUp, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Shared Health Profile View - Public access to pet health profile via share link
 */
const SharedHealthProfile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [requiresCode, setRequiresCode] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  
  const [shareData, setShareData] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      checkShareAccess();
    }
  }, [token]);

  const checkShareAccess = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Check if share exists and is valid
      const { data: share, error: shareError } = await supabase
        .from("health_profile_shares")
        .select("*")
        .eq("share_token", token)
        .single();

      if (shareError || !share) {
        toast({
          variant: "destructive",
          title: "Invalid link",
          description: "This share link is invalid or has expired.",
        });
        navigate("/");
        return;
      }

      // Check expiration
      if (new Date(share.expires_at) < new Date()) {
        toast({
          variant: "destructive",
          title: "Link expired",
          description: "This share link has expired.",
        });
        navigate("/");
        return;
      }

      // Check if revoked
      if (share.status !== "active") {
        toast({
          variant: "destructive",
          title: "Access revoked",
          description: "This share link has been revoked by the owner.",
        });
        navigate("/");
        return;
      }

      // Check if access code is required
      if (share.access_code) {
        setRequiresCode(true);
        setShareData(share);
        setLoading(false);
        return;
      }

      // No access code required, load data
      setAuthenticated(true);
      setShareData(share);
      await loadHealthData(share);

    } catch (error: any) {
      console.error("Error checking share:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shared health profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAccessCode = async () => {
    if (!token || !shareData) return;

    if (accessCode.trim() !== shareData.access_code) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "The access code you entered is incorrect.",
      });
      return;
    }

    // Log access
    try {
      const { data: shareForLog } = await supabase
        .from("health_profile_shares")
        .select("id")
        .eq("share_token", token)
        .single();

      if (shareForLog) {
        await supabase.from("health_share_access_logs").insert({
          share_id: shareForLog.id,
          viewed_section: "summary",
          success: true,
        });

        // Update share views count
        await supabase
          .from("health_profile_shares")
          .update({
            views_count: shareData.views_count + 1,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", shareForLog.id);
      }
    } catch (logError) {
      // Don't fail if logging fails
      console.error("Error logging access:", logError);
    }

    setAuthenticated(true);
    await loadHealthData(shareData);
  };

  const loadHealthData = async (share: any) => {
    try {
      // Load pet info
      const { data: petData, error: petError } = await supabase
        .from("pets")
        .select("id, name, breed, type, photo_url, birth_date")
        .eq("id", share.pet_id)
        .single();

      if (!petError && petData) {
        setPet(petData);
      }

      // Load health records (if allowed)
      if (share.allow_health_records) {
        const { data: records } = await supabase
          .from("health_records")
          .select("*")
          .eq("pet_id", share.pet_id)
          .order("date", { ascending: false })
          .limit(20);

        if (records) setHealthRecords(records);
      }

      // Load vitals (if allowed)
      if (share.allow_vitals) {
        const { data: vitalsData } = await supabase
          .from("health_vitals")
          .select("*")
          .eq("pet_id", share.pet_id)
          .order("measured_at", { ascending: false })
          .limit(30);

        if (vitalsData) setVitals(vitalsData);
      }

      // Load alerts (if allowed)
      if (share.allow_alerts) {
        const { data: alertsData } = await supabase
          .from("health_alerts")
          .select("*")
          .eq("pet_id", share.pet_id)
          .eq("status", "active")
          .order("due_date", { ascending: true });

        if (alertsData) setAlerts(alertsData);
      }

      // Load documents (if allowed)
      if (share.allow_documents) {
        const { data: docs } = await supabase
          .from("health_documents")
          .select("*")
          .eq("pet_id", share.pet_id)
          .order("document_date", { ascending: false })
          .limit(20);

        if (docs) setDocuments(docs);
      }
    } catch (error: any) {
      console.error("Error loading health data:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <HeartPulse className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading health profile...</p>
        </div>
      </div>
    );
  }

  if (requiresCode && !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Access Required
            </h1>
            <p className="text-slate-600">
              This health profile is protected. Enter the access code to continue.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                maxLength={6}
                className="h-14 text-2xl text-center tracking-widest font-mono"
              />
            </div>
            <Button
              onClick={verifyAccessCode}
              className="w-full h-12"
              disabled={accessCode.length !== 6}
            >
              Verify & Access
            </Button>
          </div>

          {shareData?.recipient_name && (
            <p className="text-sm text-slate-500 text-center mt-4">
              Shared for: {shareData.recipient_name}
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (!pet || !shareData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">No data available</p>
      </div>
    );
  }

  // Calculate expiration date
  const expiresAt = new Date(shareData.expires_at);
  const isExpiringSoon = expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000; // 24 hours

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-transparent hover:text-current"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Shared Health Profile</h1>
            <p className="text-sm text-slate-600">{pet.name}</p>
          </div>
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Expiration Warning */}
      {isExpiringSoon && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <p className="text-sm text-amber-800 text-center">
            ⏰ This link expires {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Pet Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              {pet.photo_url ? (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <HeartPulse className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{pet.name}</h2>
                {pet.breed && (
                  <p className="text-slate-600">{pet.breed}</p>
                )}
                {shareData.message && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{shareData.message}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Health Records */}
          {shareData.allow_health_records && healthRecords.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Health Records
              </h3>
              <div className="space-y-3">
                {healthRecords.map((record: any) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{record.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{record.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                          {record.veterinarian_name && (
                            <span>Dr. {record.veterinarian_name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {shareData.allow_alerts && alerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Active Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <Card key={alert.id} className="p-4 border-l-4 border-l-amber-500">
                    <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Due: {new Date(alert.due_date).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Vitals */}
          {shareData.allow_vitals && vitals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Health Vitals
              </h3>
              <Card className="p-4">
                <div className="space-y-2">
                  {vitals.slice(0, 10).map((vital: any) => (
                    <div key={vital.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-600 capitalize">
                        {vital.vital_type}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {vital.value} {vital.unit}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(vital.measured_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Documents */}
          {shareData.allow_documents && documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </h3>
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <Card key={doc.id} className="p-4">
                    <h4 className="font-semibold text-slate-900">{doc.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(doc.document_date || doc.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Data Message */}
          {healthRecords.length === 0 && alerts.length === 0 && vitals.length === 0 && documents.length === 0 && (
            <Card className="p-8 text-center">
              <HeartPulse className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No health data available to share.</p>
            </Card>
          )}

          {/* Footer Info */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              This is a shared health profile. Access is limited and expires on{" "}
              {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SharedHealthProfile;

