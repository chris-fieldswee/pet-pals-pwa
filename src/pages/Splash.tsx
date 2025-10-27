import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

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
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Livepet</h1>
        <p className="text-slate-600 mt-2">Your pet's companion</p>
      </div>
    </div>
  );
};

export default Splash;
