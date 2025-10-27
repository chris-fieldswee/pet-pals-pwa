import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

/**
 * MobileFrame - Desktop wrapper that displays the app in a mobile device frame
 * On mobile devices, shows full-screen responsive layout
 */
export const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <>
      {/* Mobile view - full screen */}
      <div className="md:hidden min-h-screen">
        {children}
      </div>

      {/* Desktop view - mobile frame */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-slate-100 p-8">
        <div className="relative w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl border-[14px] border-slate-800 overflow-hidden">
          {/* Notch simulation */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-50" />
          
          {/* App content with proper scrolling */}
          <div className="h-full overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
