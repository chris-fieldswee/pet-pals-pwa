import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Stethoscope, Syringe, Pill, TrendingUp, FileText, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddHealthRecordModal } from "@/components/health/AddHealthRecordModal";

/**
 * Health Log Page - Track pet's health records
 */
const HealthLog = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pet, setPet] = useState<any>(null);
  const [healthEntries, setHealthEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && petId) {
      fetchPet();
      fetchHealthEntries();
    }
  }, [user, petId]);

  const fetchPet = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error: any) {
      console.error("Error fetching pet:", error);
    }
  };

  const fetchHealthEntries = async () => {
    try {
      // Fetch from health_records table (new schema)
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("pet_id", petId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHealthEntries(data || []);
    } catch (error: any) {
      console.error("Error fetching health entries:", error);
      // Fallback to activities table if health_records doesn't exist yet
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("activities")
          .select("*")
          .eq("pet_id", petId)
          .eq("activity_type", "health")
          .order("created_at", { ascending: false });

        if (!fallbackError) {
          setHealthEntries(fallbackData || []);
        }
      } catch (fallbackErr) {
        // Ignore fallback errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAdded = () => {
    fetchHealthEntries();
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
            <h1 className="text-xl font-bold text-slate-900">Health Log</h1>
          </div>
          
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
          {healthEntries.length === 0 ? (
            <Card className="p-12 text-center">
              <HeartPulse className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No health records yet
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Start tracking {pet?.name}'s health by adding your first entry
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </Card>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Health History</h2>
                <div className="space-y-3">
                  {healthEntries.map((entry) => {
                    const getEntryIcon = () => {
                      switch (entry.record_type) {
                        case "vet_visit":
                          return Stethoscope;
                        case "vaccination":
                          return Syringe;
                        case "medication":
                          return Pill;
                        case "weight_log":
                          return TrendingUp;
                        case "lab_test":
                          return FileText;
                        default:
                          return HeartPulse;
                      }
                    };
                    const EntryIcon = getEntryIcon();
                    return (
                      <Card key={entry.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <EntryIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {entry.date ? new Date(entry.date).toLocaleDateString() : new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-slate-600 mb-3">
                                {entry.description}
                              </p>
                            )}
                            {entry.diagnosis && (
                              <p className="text-sm text-slate-700 mb-2">
                                <span className="font-medium">Diagnosis:</span> {entry.diagnosis}
                              </p>
                            )}
                            {entry.medication_name && (
                              <p className="text-sm text-slate-700 mb-2">
                                <span className="font-medium">Medication:</span> {entry.medication_name}
                                {entry.dosage && ` (${entry.dosage})`}
                              </p>
                            )}
                            {entry.vaccine_type && (
                              <p className="text-sm text-slate-700 mb-2">
                                <span className="font-medium">Vaccine:</span> {entry.vaccine_type}
                              </p>
                            )}
                            {entry.veterinarian_name && (
                              <p className="text-xs text-slate-500">
                                {entry.veterinarian_name}
                                {entry.clinic_name && ` at ${entry.clinic_name}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Health Record Modal */}
      <AddHealthRecordModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        petId={petId || ""}
        onRecordAdded={handleRecordAdded}
      />
    </div>
  );
};

export default HealthLog;

