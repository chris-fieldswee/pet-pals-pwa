import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

/**
 * Sign In - Existing user login
 * Allows users to sign in with email and password
 */
const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSignIn = isValidEmail(email) && password.length > 0;

  const handleSignIn = async () => {
    if (!canSignIn) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (!error) {
      // Navigate to dashboard which will redirect to pet dashboard if pets exist
      navigate("/dashboard", { replace: true });
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
          Welcome back
        </h1>

        <p className="text-base text-slate-600 mb-8">
          Sign in to continue to Livepet
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base text-slate-700">
              Password*
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 text-base rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Button
              variant="link"
              onClick={() => navigate("/onboarding/forgot-password")}
              className="text-sm text-slate-600 p-0 h-auto"
            >
              Forgot password?
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleSignIn}
          disabled={!canSignIn || loading}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </div>
  );
};

export default SignIn;

