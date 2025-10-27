import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, Pill, HeartPulse, FileText, Syringe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [entryType, setEntryType] = useState<"medication" | "vaccination" | "vet_visit" | "general">("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

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
      // For now, we'll use activities table with health type
      // In production, you'd have a dedicated health_logs table
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("pet_id", petId)
        .eq("activity_type", "health")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHealthEntries(data || []);
    } catch (error: any) {
      console.error("Error fetching health entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!user || !petId) return;

    try {
      const entryData: any = {
        user_id: user.id,
        pet_id: petId,
        activity_type: "health",
        title: title || `${entryType} Entry`,
        description: description,
        created_at: date || new Date().toISOString(),
      };

      const { error } = await supabase
        .from("activities")
        .insert(entryData);

      if (error) throw error;

      toast({
        title: "Health entry added",
        description: "Your health record has been saved successfully.",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchHealthEntries();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setMedicationName("");
    setDosage("");
    setNotes("");
    setEntryType("general");
  };

  const getEntryIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("medication") || lowerTitle.includes("pill")) return Pill;
    if (lowerTitle.includes("vaccine") || lowerTitle.includes("vaccination")) return Syringe;
    if (lowerTitle.includes("vet") || lowerTitle.includes("doctor")) return FileText;
    return HeartPulse;
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
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Health Log</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Health Entry</DialogTitle>
                <DialogDescription>Record a new health event for {pet?.name}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Entry Type</Label>
                  <Select value={entryType} onValueChange={(value: any) => setEntryType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Note</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="vet_visit">Vet Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vet checkup, New medication"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the health event..."
                    rows={4}
                  />
                </div>

                {entryType === "medication" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="medicationName">Medication Name</Label>
                      <Input
                        id="medicationName"
                        value={medicationName}
                        onChange={(e) => setMedicationName(e.target.value)}
                        placeholder="e.g., Heartgard"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="e.g., 1 tablet daily"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry} className="flex-1">
                    Save Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              <Button onClick={() => setIsDialogOpen(true)}>
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
                    const EntryIcon = getEntryIcon(entry.title);
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
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.description && (
                              <p className="text-sm text-slate-600 mb-3">
                                {entry.description}
                              </p>
                            )}
                            {entry.duration_minutes && (
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {entry.duration_minutes} minutes
                                </span>
                              </div>
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
    </div>
  );
};

export default HealthLog;

