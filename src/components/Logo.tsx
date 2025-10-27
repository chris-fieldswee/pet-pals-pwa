import logo from "@/assets/logo.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Logo Component - Displays the Livepet logo
 */
export const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-12",
    md: "h-20",
    lg: "h-32",
  };

  const sizeClass = sizeClasses[size];

  return (
    <img 
      src={logo} 
      alt="Livepet" 
      className={`${sizeClass} w-auto ${className}`}
    />
  );
};

