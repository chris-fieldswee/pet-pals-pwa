import { ReactNode, useEffect, useState } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

/**
 * MobileFrame - Desktop wrapper that displays the app in a mobile device frame
 * On mobile devices (actual mobile devices or small screens), shows full-screen responsive layout
 * On desktop/large screens, displays in a simulated mobile device frame
 */
export const MobileFrame = ({ children }: MobileFrameProps) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Detect if running on an actual mobile device
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Check for mobile devices
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      
      // Also check for touch screen capability
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check viewport width (additional check)
      const isSmallScreen = window.innerWidth < 768;
      
      // Consider it a mobile device if:
      // 1. User agent indicates mobile, OR
      // 2. Has touch screen and small viewport (likely a real mobile device)
      const mobileDevice = isMobile || (hasTouchScreen && isSmallScreen);
      
      setIsMobileDevice(mobileDevice);
    };

    checkMobileDevice();
    
    // Re-check on resize (though less important for device detection)
    const handleResize = () => {
      if (!isMobileDevice) {
        checkMobileDevice();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileDevice]);

  // On actual mobile devices, show full screen (no frame)
  // On desktop, show mobile frame simulation
  // Use both device detection and responsive breakpoints for best UX
  if (isMobileDevice || window.innerWidth < 768) {
    return (
      <div className="min-h-screen w-full">
        {children}
      </div>
    );
  }

  // Desktop view - mobile frame
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-8">
      <div 
        className="relative w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl border-[14px] border-slate-800 overflow-hidden flex flex-col" 
        id="mobile-frame-container" 
        style={{ zIndex: 1 }}
      >
        {/* Notch simulation */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-50" />
        
        {/* App content with proper scrolling */}
        <div className="h-full overflow-y-auto overflow-x-hidden relative" style={{ zIndex: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
