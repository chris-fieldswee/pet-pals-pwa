import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

/**
 * Reset Password - Set new password after clicking reset link
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpperLower && hasNumber;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch && confirmPassword.length > 0;

  useEffect(() => {
    // Check if user is authenticated with a password reset session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          variant: "destructive",
          title: "Invalid reset link",
          description: "This password reset link is invalid or has expired.",
        });
        navigate("/onboarding/signin");
      }
    });
  }, [navigate, toast]);

  const handleResetPassword = async () => {
    if (!canSubmit) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to reset password",
          description: error.message,
        });
      } else {
        toast({
          title: "Password updated!",
          description: "Your password has been successfully updated.",
        });
        navigate("/dashboard");
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Set a new password
        </h1>

        <p className="text-base text-slate-600 mb-8">
          Enter your new password below.
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base text-slate-700">
              New Password*
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base text-slate-700">
              Confirm Password*
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="h-12 text-base rounded-xl"
            />
            
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-sm text-red-600 pt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8 pt-4">
        <Button
          onClick={handleResetPassword}
          disabled={!canSubmit || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Updating Password..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;

