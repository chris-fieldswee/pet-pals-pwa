import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

/**
 * Verify Code - Verify the OTP code sent to email
 * After verification, user is logged in
 */
const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || "";
  
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidCode = (code: string) => {
    return /^\d{6}$/.test(code);
  };

  const handleVerify = async () => {
    if (!isValidCode(code)) return;

    setLoading(true);

    try {
      // Verify OTP and log in the user
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: error.message,
        });
      } else {
        // If verification succeeds, user is now logged in
        // Navigate to create account to set password and details
        navigate("/onboarding/create-account", { 
          state: { email } 
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

  const handleResend = () => {
    // TODO: Implement resend logic
    navigate(-1);
  };

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
          Check your email
        </h1>

        <p className="text-base text-slate-600 mb-8">
          We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-base text-slate-700">
              Enter verification code*
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="h-14 text-2xl text-center font-mono tracking-widest rounded-xl"
              autoFocus
              maxLength={6}
            />
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleResend}
              className="text-sm text-slate-600"
            >
              Didn't receive a code? Resend
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleVerify}
          disabled={!isValidCode(code) || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </div>
  );
};

export default VerifyCode;

