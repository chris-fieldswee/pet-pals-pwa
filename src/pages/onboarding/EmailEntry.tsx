import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

/**
 * Email Entry - First step for both sign up and sign in
 * Determines if email is new or existing and routes accordingly
 */
const EmailEntry = () => {
  const navigate = useNavigate();
  const { sendOTP } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinue = async () => {
    if (!isValidEmail(email)) return;

    setLoading(true);

    // Send OTP code to the email
    const { error } = await sendOTP(email);
    
    if (!error) {
      // Navigate to OTP verification page
      navigate("/onboarding/verify-code", { state: { email } });
    }
    
    setLoading(false);
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
            onClick={() => navigate("/welcome")}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Enter your email to join us or sign in
        </h1>

        <div className="mt-8 space-y-6">
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

          <p className="text-sm text-slate-600 leading-relaxed">
            By continuing, I agree to Livepet's Privacy Policy and Terms of Use.
          </p>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleContinue}
          disabled={!isValidEmail(email) || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Continuing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default EmailEntry;
