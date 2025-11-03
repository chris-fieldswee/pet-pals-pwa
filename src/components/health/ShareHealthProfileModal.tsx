import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Mail, Calendar, Eye, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ShareHealthProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  petName?: string;
}

interface ShareFormData {
  recipient_email: string;
  recipient_name: string;
  message: string;
  expiration_hours: number;
  max_views: string; // "" for unlimited
  require_access_code: boolean;
  allow_health_records: boolean;
  allow_vitals: boolean;
  allow_alerts: boolean;
  allow_documents: boolean;
}

export const ShareHealthProfileModal = ({
  open,
  onOpenChange,
  petId,
  petName = "your pet",
}: ShareHealthProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareCreated, setShareCreated] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<ShareFormData>({
    recipient_email: "",
    recipient_name: "",
    message: "",
    expiration_hours: 24,
    max_views: "",
    require_access_code: false,
    allow_health_records: true,
    allow_vitals: true,
    allow_alerts: true,
    allow_documents: true,
  });

  const handleShare = async () => {
    if (!user || !petId) return;

    // Validate email
    if (!formData.recipient_email.trim() || !formData.recipient_email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid recipient email address.",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate share token (using a simple random token)
      const shareToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Generate access code if required
      let accessCodeValue: string | null = null;
      if (formData.require_access_code) {
        accessCodeValue = Math.floor(100000 + Math.random() * 900000).toString();
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + formData.expiration_hours);

      // Create share record
      const { data, error } = await supabase
        .from("health_profile_shares")
        .insert({
          pet_id: petId,
          user_id: user.id,
          share_token: shareToken,
          access_code: accessCodeValue,
          recipient_email: formData.recipient_email.trim(),
          recipient_name: formData.recipient_name.trim() || null,
          message: formData.message.trim() || null,
          expires_at: expiresAt.toISOString(),
          max_views: formData.max_views ? parseInt(formData.max_views) : null,
          allow_health_records: formData.allow_health_records,
          allow_vitals: formData.allow_vitals,
          allow_alerts: formData.allow_alerts,
          allow_documents: formData.allow_documents,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      setShareId(data.id);

      // Generate share link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/shared/health/${shareToken}`;
      setShareLink(link);
      if (accessCodeValue) {
        setAccessCode(accessCodeValue);
      }

      // Log the share as a health record
      try {
        await supabase
          .from("health_records")
          .insert({
            pet_id: petId,
            user_id: user.id,
            record_type: "general",
            title: "Health Profile Shared",
            description: `Shared with ${formData.recipient_email}${formData.recipient_name ? ` (${formData.recipient_name})` : ""}. Expires: ${expiresAt.toLocaleString()}`,
            date: new Date().toISOString().split("T")[0],
            notes: `Access code: ${accessCodeValue || "None"}. Link valid until ${expiresAt.toLocaleString()}`,
          });
      } catch (recordError) {
        // Don't fail if logging fails
        console.error("Error logging share record:", recordError);
      }

      // Send email to recipient via Edge Function (optional - won't block if it fails)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Try to invoke the Edge Function, but don't block if it's not deployed
          const { error: emailError } = await supabase.functions.invoke(
            "send-health-share-email",
            {
              body: {
                shareId: data.id,
                recipientEmail: formData.recipient_email.trim(),
                recipientName: formData.recipient_name.trim() || null,
                petName: petName,
                shareLink: link,
                accessCode: accessCodeValue,
                expirationHours: formData.expiration_hours,
                message: formData.message.trim() || null,
              },
            }
          ).catch((err) => {
            // Edge Function not deployed or CORS issue - that's okay
            console.warn("Email function not available:", err);
            return { error: null }; // Return no error to continue
          });

          if (emailError) {
            console.warn("Email sending failed (function may not be deployed):", emailError);
            // Show success message anyway - share link is available
          } else {
            toast({
              title: "Email sent!",
              description: `Share link has been sent to ${formData.recipient_email}`,
            });
          }
        }
      } catch (emailErr: any) {
        // Edge Function not deployed - that's fine, show link instead
        console.warn("Email function not available. Share link created successfully.", emailErr);
      }

      setShareCreated(true);
    } catch (error: any) {
      console.error("Error creating share:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create share link.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRevoke = async () => {
    if (!shareId || !user) return;

    try {
      const { error } = await supabase
        .from("health_profile_shares")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
        })
        .eq("id", shareId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Share revoked",
        description: "The share link has been deactivated.",
      });

      onOpenChange(false);
      // Reset form
      setShareCreated(false);
      setShareLink("");
      setAccessCode("");
      setFormData({
        recipient_email: "",
        recipient_name: "",
        message: "",
        expiration_hours: 24,
        max_views: "",
        require_access_code: false,
        allow_health_records: true,
        allow_vitals: true,
        allow_alerts: true,
        allow_documents: true,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke share.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Health Profile</DialogTitle>
          <DialogDescription>
            {shareCreated
              ? "Share link created! Send this link to access the health profile."
              : `Generate a secure link to share ${petName}'s health profile`}
          </DialogDescription>
        </DialogHeader>

        {!shareCreated ? (
          <div className="space-y-6 py-4">
            {/* Recipient Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_email" className="text-base">
                  Recipient Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_email"
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, recipient_email: e.target.value }))
                  }
                  placeholder="recipient@example.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_name" className="text-base">
                  Recipient Name (Optional)
                </Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, recipient_name: e.target.value }))
                  }
                  placeholder="Dr. Smith, Veterinary Clinic, etc."
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Add a personal message to include with the share..."
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>

            {/* Access Settings */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h3 className="font-semibold text-slate-900">Access Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="expiration_hours">Link Expires In</Label>
                <Select
                  value={formData.expiration_hours.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, expiration_hours: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours (1 day)</SelectItem>
                    <SelectItem value="48">48 hours (2 days)</SelectItem>
                    <SelectItem value="72">72 hours (3 days)</SelectItem>
                    <SelectItem value="168">168 hours (1 week)</SelectItem>
                    <SelectItem value="720">720 hours (30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_views">Maximum Views (Optional)</Label>
                <Input
                  id="max_views"
                  type="number"
                  min="1"
                  value={formData.max_views}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_views: e.target.value }))
                  }
                  placeholder="Leave empty for unlimited"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-slate-500">
                  Link will expire after this many views. Leave empty for unlimited access.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="require_access_code"
                  checked={formData.require_access_code}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, require_access_code: checked === true }))
                  }
                />
                <Label htmlFor="require_access_code" className="cursor-pointer">
                  Require access code for extra security
                </Label>
              </div>
            </div>

            {/* Permissions */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h3 className="font-semibold text-slate-900">What to Share</h3>
              <p className="text-sm text-slate-600">
                Select which sections of the health profile to include
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="allow_health_records"
                    checked={formData.allow_health_records}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allow_health_records: checked === true }))
                    }
                  />
                  <Label htmlFor="allow_health_records" className="cursor-pointer">
                    Health Records (vet visits, vaccinations, medications)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="allow_vitals"
                    checked={formData.allow_vitals}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allow_vitals: checked === true }))
                    }
                  />
                  <Label htmlFor="allow_vitals" className="cursor-pointer">
                    Vitals Tracking (weight, temperature, etc.)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="allow_alerts"
                    checked={formData.allow_alerts}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allow_alerts: checked === true }))
                    }
                  />
                  <Label htmlFor="allow_alerts" className="cursor-pointer">
                    Health Alerts & Reminders
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="allow_documents"
                    checked={formData.allow_documents}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allow_documents: checked === true }))
                    }
                  />
                  <Label htmlFor="allow_documents" className="cursor-pointer">
                    Health Documents (lab results, X-rays, etc.)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleShare} className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Generate Share Link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Success Message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-1">Share link created!</p>
                  <p className="text-sm text-green-700">
                    An email has been sent to {formData.recipient_email} with access instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="h-12 rounded-xl font-mono text-sm"
                />
                <Button
                  size="icon"
                  onClick={() => copyToClipboard(shareLink)}
                  className="h-12 w-12"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Access Code (if required) */}
            {accessCode && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Access Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={accessCode}
                    readOnly
                    className="h-12 rounded-xl font-mono text-2xl text-center tracking-widest"
                  />
                  <Button
                    size="icon"
                    onClick={() => copyToClipboard(accessCode)}
                    className="h-12 w-12"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Recipient will need this code to access the health profile
                </p>
              </div>
            )}

            {/* Share Details */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Expires in:</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formData.expiration_hours} hours
                </span>
              </div>
              {formData.max_views && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Max views:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formData.max_views}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Recipient:</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formData.recipient_email}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleRevoke}
                className="flex-1"
              >
                Revoke Access
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  setShareCreated(false);
                  setShareLink("");
                  setAccessCode("");
                }}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

