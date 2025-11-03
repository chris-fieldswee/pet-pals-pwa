import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Stethoscope, 
  Syringe, 
  Pill, 
  TrendingUp, 
  FileText,
  X,
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AddHealthRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  onRecordAdded?: () => void;
  editRecordId?: string | null; // For editing existing records
}

type RecordType = "vet_visit" | "vaccination" | "medication" | "weight_log" | "surgery" | "allergy" | "diagnosis" | "general" | "lab_test";

interface RecordFormData {
  record_type: RecordType;
  title: string;
  description: string;
  date: string;
  time: string;
  
  // Vet visit fields
  visit_reason: string;
  diagnosis: string;
  treatment_notes: string;
  follow_up_required: boolean;
  follow_up_date: string;
  veterinarian_name: string;
  clinic_name: string;
  cost: string;
  
  // Vaccination fields
  vaccine_type: string;
  vaccine_batch_number: string;
  
  // Medication fields
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  
  // Weight log fields (will also create vital entry)
  weight_value: string;
  weight_unit: "lbs" | "kg";
  
  // Lab test fields
  document_title: string;
  document_date: string;
  
  // General fields
  notes: string;
  location: string;
  
  // Reminder settings
  set_reminder: boolean;
  reminder_date: string;
  reminder_type: "checkup_due" | "follow_up_due" | "test_due" | "custom";
  reminder_title: string;
  
  // Document upload
  uploaded_file: File | null;
  uploaded_file_preview: string | null;
  uploaded_document_id: string | null;
}

const RECORD_TYPES: Array<{ value: RecordType; label: string; icon: any; description: string }> = [
  { value: "vet_visit", label: "Vet Visit", icon: Stethoscope, description: "Regular checkup or appointment" },
  { value: "vaccination", label: "Vaccination", icon: Syringe, description: "Vaccine or immunization record" },
  { value: "medication", label: "Medication", icon: Pill, description: "Medication started or prescribed" },
  { value: "weight_log", label: "Vital Log", icon: TrendingUp, description: "Weight or other vital measurement" },
  { value: "lab_test", label: "Lab Test / Report", icon: FileText, description: "Lab results or medical reports" },
];

export const AddHealthRecordModal = ({
  open,
  onOpenChange,
  petId,
  onRecordAdded,
  editRecordId,
}: AddHealthRecordModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<RecordType | null>(null);
  const [formData, setFormData] = useState<RecordFormData>({
    record_type: "general",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    visit_reason: "",
    diagnosis: "",
    treatment_notes: "",
    follow_up_required: false,
    follow_up_date: "",
    veterinarian_name: "",
    clinic_name: "",
    cost: "",
    vaccine_type: "",
    vaccine_batch_number: "",
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    weight_value: "",
    weight_unit: "lbs",
    document_title: "",
    document_date: "",
    notes: "",
    location: "",
    set_reminder: false,
    reminder_date: "",
    reminder_type: "checkup_due",
    reminder_title: "",
    uploaded_file: null,
    uploaded_file_preview: null,
    uploaded_document_id: null,
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (editRecordId) {
      fetchRecord();
    } else {
      resetForm();
    }
  }, [editRecordId, open]);

  const fetchRecord = async () => {
    if (!editRecordId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("id", editRecordId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedType(data.record_type as RecordType);
        setFormData({
          record_type: data.record_type as RecordType,
          title: data.title || "",
          description: data.description || "",
          date: data.date || new Date().toISOString().split("T")[0],
          time: data.time || "",
          visit_reason: data.visit_reason || "",
          diagnosis: data.diagnosis || "",
          treatment_notes: data.treatment_notes || "",
          follow_up_required: data.follow_up_required || false,
          follow_up_date: data.follow_up_date || "",
          veterinarian_name: data.veterinarian_name || "",
          clinic_name: data.clinic_name || "",
          cost: data.cost?.toString() || "",
          vaccine_type: data.vaccine_type || "",
          vaccine_batch_number: data.vaccine_batch_number || "",
          medication_name: data.medication_name || "",
          dosage: data.dosage || "",
          frequency: data.frequency || "",
          duration: data.duration || "",
          weight_value: "",
          weight_unit: "lbs",
          document_title: "",
          document_date: data.date || "",
          notes: data.notes || "",
          location: data.location || "",
          set_reminder: false,
          reminder_date: "",
          reminder_type: "checkup_due",
          reminder_title: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load record details.",
      });
    }
  };

  const resetForm = () => {
    // Clean up preview URL if it exists
    if (formData.uploaded_file_preview && formData.uploaded_file_preview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.uploaded_file_preview);
    }
    
    setSelectedType(null);
    setFormData({
      record_type: "general",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      visit_reason: "",
      diagnosis: "",
      treatment_notes: "",
      follow_up_required: false,
      follow_up_date: "",
      veterinarian_name: "",
      clinic_name: "",
      cost: "",
      vaccine_type: "",
      vaccine_batch_number: "",
      medication_name: "",
      dosage: "",
      frequency: "",
      duration: "",
      weight_value: "",
      weight_unit: "lbs",
      document_title: "",
      document_date: "",
      notes: "",
      location: "",
      set_reminder: false,
      reminder_date: "",
      reminder_type: "checkup_due",
      reminder_title: "",
      uploaded_file: null,
      uploaded_file_preview: null,
      uploaded_document_id: null,
    });
  };

  const removeUploadedFile = () => {
    // Clean up preview URL if it's an object URL
    if (formData.uploaded_file_preview && formData.uploaded_file_preview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.uploaded_file_preview);
    }
    setFormData((prev) => ({
      ...prev,
      uploaded_file: null,
      uploaded_file_preview: null,
      uploaded_document_id: null,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check (10MB max for documents)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please choose a file smaller than 10MB.",
      });
      return;
    }

    // Create preview URL for images
    let preview: string | null = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    setFormData((prev) => ({
      ...prev,
      uploaded_file: file,
      uploaded_file_preview: preview,
    }));
  };

  const handleSave = async () => {
    if (!user || !petId) return;
    if (!selectedType) {
      toast({
        variant: "destructive",
        title: "Please select a record type",
      });
      return;
    }

    // Validate required fields based on type
    if (!formData.title.trim() || !formData.date) {
      toast({
        variant: "destructive",
        title: "Please fill in required fields",
        description: "Title and date are required.",
      });
      return;
    }

    setLoading(true);

    try {
      const recordData: any = {
        pet_id: petId,
        user_id: user.id,
        record_type: selectedType,
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        time: formData.time || null,
      };

      // Add type-specific fields
      if (selectedType === "vet_visit") {
        recordData.visit_reason = formData.visit_reason || null;
        recordData.diagnosis = formData.diagnosis || null;
        recordData.treatment_notes = formData.treatment_notes || null;
        recordData.follow_up_required = formData.follow_up_required;
        recordData.follow_up_date = formData.follow_up_date || null;
        recordData.veterinarian_name = formData.veterinarian_name || null;
        recordData.clinic_name = formData.clinic_name || null;
        recordData.location = formData.location || null;
        recordData.cost = formData.cost ? parseFloat(formData.cost) : null;
      }

      if (selectedType === "vaccination") {
        recordData.vaccine_type = formData.vaccine_type || null;
        recordData.vaccine_batch_number = formData.vaccine_batch_number || null;
        recordData.veterinarian_name = formData.veterinarian_name || null;
        recordData.clinic_name = formData.clinic_name || null;
      }

      if (selectedType === "medication") {
        recordData.medication_name = formData.medication_name || null;
        recordData.dosage = formData.dosage || null;
        recordData.frequency = formData.frequency || null;
        recordData.duration = formData.duration || null;
      }

      if (selectedType === "lab_test") {
        recordData.document_title = formData.document_title || formData.title;
        recordData.notes = formData.notes || null;
      }

      // General fields
      recordData.notes = formData.notes || null;
      recordData.location = formData.location || null;

      let recordId: string;

      if (editRecordId) {
        // Update existing record
        const { data, error } = await supabase
          .from("health_records")
          .update(recordData)
          .eq("id", editRecordId)
          .select()
          .single();

        if (error) throw error;
        recordId = data.id;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("health_records")
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;
        recordId = data.id;

        // Handle weight log - also create vital entry
        if (selectedType === "weight_log" && formData.weight_value) {
          const weightValue = parseFloat(formData.weight_value);
          if (!isNaN(weightValue)) {
            const { error: vitalError } = await supabase
              .from("health_vitals")
              .insert({
                pet_id: petId,
                user_id: user.id,
                vital_type: "weight",
                value: weightValue,
                unit: formData.weight_unit,
                measured_at: new Date(formData.date + (formData.time ? `T${formData.time}` : "")).toISOString(),
              });

            if (vitalError) {
              console.error("Error creating vital entry:", vitalError);
              // Don't fail the whole operation, just log
            }
          }
        }
      }

      // Handle reminder creation
      if (formData.set_reminder && formData.reminder_date) {
        const alertData: any = {
          pet_id: petId,
          user_id: user.id,
          alert_type: formData.reminder_type,
          title: formData.reminder_title || `Follow-up for ${formData.title}`,
          description: formData.description || null,
          due_date: formData.reminder_date,
          related_record_id: recordId,
          priority: "medium",
          status: "active",
        };

        const { error: alertError } = await supabase
          .from("health_alerts")
          .insert(alertData);

        if (alertError) {
          console.error("Error creating alert:", alertError);
          // Don't fail the whole operation
        }
      }

      // Auto-create follow-up alert if follow_up_required is true
      if (selectedType === "vet_visit" && formData.follow_up_required && formData.follow_up_date) {
        const { error: alertError } = await supabase
          .from("health_alerts")
          .insert({
            pet_id: petId,
            user_id: user.id,
            alert_type: "follow_up_due",
            title: `Follow-up: ${formData.title}`,
            description: formData.treatment_notes || null,
            due_date: formData.follow_up_date,
            related_record_id: recordId,
            priority: "medium",
            status: "active",
          });

        if (alertError) {
          console.error("Error creating follow-up alert:", alertError);
        }
      }

      // Handle document upload - upload file and create health_documents entry
      if (formData.uploaded_file && user) {
        setUploadingFile(true);
        try {
          const fileExt = formData.uploaded_file.name.split('.').pop();
          const fileName = `${user.id}/${petId}/${recordId}_${Date.now()}.${fileExt}`;
          const filePath = `health-documents/${fileName}`;
          
          // Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('health-documents')
            .upload(filePath, formData.uploaded_file);

          if (uploadError) throw uploadError;

          // Get file type
          const fileType = formData.uploaded_file.type || 'application/octet-stream';
          
          // Determine document type based on file type and record type
          let docType = 'general';
          if (selectedType === 'lab_test') {
            docType = 'lab_result';
          } else if (fileType.includes('image')) {
            docType = 'xray';
          } else if (fileType.includes('pdf')) {
            docType = 'prescription';
          }

          // Create health_documents entry
          const { error: docError } = await supabase
            .from("health_documents")
            .insert({
              pet_id: petId,
              user_id: user.id,
              related_record_id: recordId,
              title: formData.document_title || formData.title || formData.uploaded_file.name,
              description: formData.description || null,
              file_name: formData.uploaded_file.name,
              file_path: filePath,
              file_size: formData.uploaded_file.size,
              file_type: fileType,
              document_type: docType,
              document_date: formData.document_date || formData.date || null,
              storage_bucket: 'health-documents',
            });

          if (docError) {
            console.error("Error creating document record:", docError);
            // Don't fail the whole operation, just log
          }
        } catch (error: any) {
          console.error("Error uploading document:", error);
          toast({
            variant: "destructive",
            title: "Document upload failed",
            description: error.message || "Failed to upload document, but record was saved.",
          });
        } finally {
          setUploadingFile(false);
        }
      }

      toast({
        title: editRecordId ? "Record updated" : "Record added",
        description: "Your health record has been saved successfully.",
      });

      onOpenChange(false);
      resetForm();
      onRecordAdded?.();
    } catch (error: any) {
      console.error("Error saving record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save health record.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelector = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Record Type</h3>
        <p className="text-sm text-slate-600 mb-4">Select the type of health record you want to add</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {RECORD_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => {
                setSelectedType(type.value);
                setFormData((prev) => ({ ...prev, record_type: type.value }));
              }}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col items-start gap-2">
                <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                <div>
                  <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-slate-900"}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{type.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFormFields = () => {
    if (!selectedType) return null;

    return (
      <div className="space-y-4">
        {/* Common Fields */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Annual Checkup, Rabies Vaccine"
            className="h-12 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base">
              Time (Optional)
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Add any notes or details..."
            className="rounded-xl min-h-[100px]"
          />
        </div>

        {/* Vet Visit Fields */}
        {selectedType === "vet_visit" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="visit_reason">Visit Reason</Label>
              <Input
                id="visit_reason"
                value={formData.visit_reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, visit_reason: e.target.value }))}
                placeholder="e.g., Annual checkup, Routine exam"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Diagnosis or findings"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment_notes">Treatment Notes</Label>
              <Textarea
                id="treatment_notes"
                value={formData.treatment_notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, treatment_notes: e.target.value }))}
                placeholder="Treatment plan, recommendations..."
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian_name">Veterinarian Name</Label>
                <Input
                  id="veterinarian_name"
                  value={formData.veterinarian_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, veterinarian_name: e.target.value }))}
                  placeholder="Dr. Smith"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinic_name: e.target.value }))}
                  placeholder="Animal Hospital"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="follow_up_required"
                checked={formData.follow_up_required}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, follow_up_required: checked === true }))
                }
              />
              <Label htmlFor="follow_up_required" className="cursor-pointer">
                Follow-up required
              </Label>
            </div>
            {formData.follow_up_required && (
              <div className="space-y-2">
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, follow_up_date: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
            )}
          </>
        )}

        {/* Vaccination Fields */}
        {selectedType === "vaccination" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="vaccine_type">Vaccine Type</Label>
              <Input
                id="vaccine_type"
                value={formData.vaccine_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, vaccine_type: e.target.value }))}
                placeholder="e.g., Rabies, DHPP, FVRCP"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccine_batch_number">Batch Number (Optional)</Label>
              <Input
                id="vaccine_batch_number"
                value={formData.vaccine_batch_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, vaccine_batch_number: e.target.value }))}
                placeholder="Vaccine batch number"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian_name">Veterinarian Name</Label>
                <Input
                  id="veterinarian_name"
                  value={formData.veterinarian_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, veterinarian_name: e.target.value }))}
                  placeholder="Dr. Smith"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinic_name: e.target.value }))}
                  placeholder="Animal Hospital"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </>
        )}

        {/* Medication Fields */}
        {selectedType === "medication" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="medication_name">Medication Name</Label>
              <Input
                id="medication_name"
                value={formData.medication_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, medication_name: e.target.value }))}
                placeholder="e.g., Heartgard, NexGard"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 5mg"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                  placeholder="e.g., Once daily"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 7 days, Ongoing"
                className="h-12 rounded-xl"
              />
            </div>
          </>
        )}

        {/* Weight/Vital Log Fields */}
        {selectedType === "weight_log" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_value">Weight <span className="text-red-500">*</span></Label>
                <Input
                  id="weight_value"
                  type="number"
                  step="0.1"
                  value={formData.weight_value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight_value: e.target.value }))}
                  placeholder="0.0"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_unit">Unit</Label>
                <Select
                  value={formData.weight_unit}
                  onValueChange={(value: "lbs" | "kg") =>
                    setFormData((prev) => ({ ...prev, weight_unit: value }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Lab Test Fields */}
        {selectedType === "lab_test" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="document_title">Report/Test Name</Label>
              <Input
                id="document_title"
                value={formData.document_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, document_title: e.target.value }))}
                placeholder="e.g., Blood Work, X-Ray Results"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_date">Test Date</Label>
              <Input
                id="document_date"
                type="date"
                value={formData.document_date || formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, document_date: e.target.value }))}
                className="h-12 rounded-xl"
              />
            </div>
          </>
        )}

        {/* Additional Notes */}
        {(selectedType === "general" || selectedType === "allergy" || selectedType === "diagnosis" || selectedType === "surgery") && (
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional information..."
              className="rounded-xl min-h-[100px]"
            />
          </div>
        )}

        {/* Document Upload Section - Available for all record types */}
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div>
            <Label className="text-base font-semibold">Attach Document (Optional)</Label>
            <p className="text-sm text-slate-600 mt-1">
              Upload lab results, X-rays, prescriptions, invoices, or other health documents
            </p>
          </div>

          {!formData.uploaded_file && (
            <label
              htmlFor="document-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                uploadingFile
                  ? "border-slate-300 bg-slate-50"
                  : "border-slate-300 bg-white hover:border-primary hover:bg-primary/5"
              }`}
            >
              <input
                id="document-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                onChange={handleFileSelect}
                disabled={uploadingFile}
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">Tap to select document</p>
                <p className="text-xs text-slate-500">PDF, Images, or Documents (max 10MB)</p>
              </div>
            </label>
          )}

          {formData.uploaded_file && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                {formData.uploaded_file_preview ? (
                  <img
                    src={formData.uploaded_file_preview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{formData.uploaded_file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(formData.uploaded_file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeUploadedFile}
                    className="mt-2 h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reminder Settings */}
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="set_reminder"
              checked={formData.set_reminder}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, set_reminder: checked === true }))
              }
            />
            <Label htmlFor="set_reminder" className="cursor-pointer font-semibold">
              Set Reminder
            </Label>
          </div>
          {formData.set_reminder && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder_date">Reminder Date</Label>
                <Input
                  id="reminder_date"
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reminder_date: e.target.value }))}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder_type">Reminder Type</Label>
                <Select
                  value={formData.reminder_type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, reminder_type: value }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup_due">Checkup Due</SelectItem>
                    <SelectItem value="follow_up_due">Follow-up Due</SelectItem>
                    <SelectItem value="test_due">Test Due</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder_title">Reminder Title</Label>
                <Input
                  id="reminder_title"
                  value={formData.reminder_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reminder_title: e.target.value }))}
                  placeholder="e.g., Follow-up appointment"
                  className="h-12 rounded-xl"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editRecordId ? "Edit Health Record" : "Add Health Record"}
          </DialogTitle>
          <DialogDescription>
            {!selectedType
              ? "Select a record type to get started"
              : `Adding ${RECORD_TYPES.find((t) => t.value === selectedType)?.label.toLowerCase()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!selectedType ? renderTypeSelector() : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
                className="mb-2"
              >
                <X className="w-4 h-4 mr-2" />
                Change Type
              </Button>
              {renderFormFields()}
            </>
          )}
        </div>

        {selectedType && (
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
            onClick={handleSave}
            className="flex-1"
            disabled={loading || uploadingFile}
          >
            {loading || uploadingFile ? "Saving..." : editRecordId ? "Update Record" : "Save Record"}
          </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

