import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

/**
 * Splash Screen - Brand introduction while app loads
 * Auto-transitions to Welcome after 2 seconds
 */
const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="text-center animate-fade-in">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="text-slate-600">Your pet's companion</p>
      </div>
    </div>
  );
};

export default Splash;
