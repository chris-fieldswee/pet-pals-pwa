import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Create Account - Email verification and account credentials
 * Collects: OTP code, first name, password, email opt-in
 */
const CreateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  
  const email = location.state?.email || "";
  
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpperLower && hasNumber;

  const canSubmit = firstName.trim().length > 0 && isPasswordValid;

  const handleCreateAccount = async () => {
    if (!canSubmit) return;

    setLoading(true);
    const { error } = await signUp(email, password, firstName, emailOptIn);
    
    if (!error) {
      navigate("/onboarding/success", { state: { firstName } });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Let's create your account
        </h1>

        <p className="text-base text-slate-600 mb-1">
          We've sent a 6-digit code to
        </p>
        <div className="flex items-center gap-2 mb-6">
          <p className="text-base text-slate-900 font-medium">{email}</p>
          <Button
            variant="link"
            onClick={() => navigate(-1)}
            className="text-primary p-0 h-auto text-sm"
          >
            Edit
          </Button>
        </div>

        <div className="space-y-5">
          {/* Note: In production, implement actual OTP verification */}
          {/* For MVP, we're using Supabase's email confirmation instead */}
          
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base text-slate-700">
              First Name*
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="h-12 text-base rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base text-slate-700">
              Password*
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="h-12 text-base rounded-xl"
            />
            
            {/* Password requirements */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-green-500' : 'bg-slate-200'}`}>
                  {hasMinLength && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={hasMinLength ? 'text-green-600' : 'text-slate-600'}>
                  Minimum of 8 characters
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasUpperLower && hasNumber ? 'bg-green-500' : 'bg-slate-200'}`}>
                  {hasUpperLower && hasNumber && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={hasUpperLower && hasNumber ? 'text-green-600' : 'text-slate-600'}>
                  Uppercase, lowercase letters, and one number
                </span>
              </div>
            </div>
          </div>

          {/* Email opt-in */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="emailOptIn"
              checked={emailOptIn}
              onCheckedChange={(checked) => setEmailOptIn(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="emailOptIn"
              className="text-sm text-slate-600 leading-relaxed cursor-pointer"
            >
              Sign up for emails with helpful pet tips and offers.
            </label>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8 pt-4">
        <Button
          onClick={handleCreateAccount}
          disabled={!canSubmit || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </div>
  );
};

export default CreateAccount;
