import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

/**
 * Forgot Password - Send password reset email
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendReset = async () => {
    if (!isValidEmail(email)) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/onboarding/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to send reset email",
          description: error.message,
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Reset email sent!",
          description: "Check your email for password reset instructions.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/onboarding/signin")}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Check your email
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-sm">
            We've sent password reset instructions to <span className="font-semibold">{email}</span>
          </p>

          <Button
            onClick={() => navigate("/onboarding/signin")}
            className="w-full h-14 text-base font-semibold rounded-2xl max-w-sm"
            size="lg"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Reset your password
        </h1>

        <p className="text-base text-slate-600 mb-8">
          Enter your email and we'll send you instructions to reset your password.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base text-slate-700">
              Email*
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 text-base rounded-xl"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleSendReset}
          disabled={!isValidEmail(email) || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;

