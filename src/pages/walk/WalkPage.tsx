import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Music, Play } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";

/**
 * Walk Page - Main walk activity page
 * Features tabs for Standard Walk and Guided Walk
 */
const WalkPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"standard" | "guided">("standard");
  const [isMusicDrawerOpen, setIsMusicDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/pet/${petId}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Walk</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("standard")}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-colors ${
                activeTab === "standard"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Start a Walk
            </button>
            <button
              onClick={() => setActiveTab("guided")}
              className={`flex-1 py-3 rounded-2xl font-semibold transition-colors ${
                activeTab === "guided"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Guided Walks
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "standard" ? (
          <StandardWalkScreen 
            onStart={() => {
              // TODO: Navigate to active walk screen
              alert("Walk started! (Implementation coming soon)");
            }}
            onMusicClick={() => setIsMusicDrawerOpen(true)}
          />
        ) : (
          <GuidedWalksScreen />
        )}
      </div>

      {/* Music Integration Drawer */}
      <Drawer open={isMusicDrawerOpen} onOpenChange={setIsMusicDrawerOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Music</DrawerTitle>
            <DrawerDescription>Connect your music service to play during walks</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-3">
            <Button
              onClick={() => {
                // TODO: Implement Spotify integration
                alert("Spotify integration coming soon!");
                setIsMusicDrawerOpen(false);
              }}
              className="w-full h-16 justify-start text-left"
              variant="outline"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Connect to Spotify</p>
                  <p className="text-sm text-slate-600">Play your Spotify playlists</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => {
                // TODO: Implement Apple Music integration
                alert("Apple Music integration coming soon!");
                setIsMusicDrawerOpen(false);
              }}
              className="w-full h-16 justify-start text-left"
              variant="outline"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Connect to Apple Music</p>
                  <p className="text-sm text-slate-600">Play your Apple Music library</p>
                </div>
              </div>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

/**
 * Standard Walk Screen - Map view with controls
 */
const StandardWalkScreen = ({ onStart, onMusicClick }: { onStart: () => void; onMusicClick: () => void }) => {
  return (
    <div className="flex flex-col h-full relative">
      {/* Map Placeholder */}
      <div className="flex-1 bg-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full border-4 border-slate-400 border-dashed rounded-full"></div>
            </div>
            <p className="text-slate-600">Map View</p>
          </div>
        </div>

        {/* Weather Card Example */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-sm">
            <p className="text-sm font-semibold text-amber-900">Hot Pavement Warning</p>
            <p className="text-xs text-amber-700">92°F. Keep paws safe!</p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white border-t border-slate-200 px-6 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto gap-4">
          {/* Settings Button */}
          <button className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Settings className="w-6 h-6 text-slate-600" />
          </button>

          {/* START Button */}
          <button
            onClick={onStart}
            className="flex-1 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-white font-bold text-lg">START</span>
          </button>

          {/* Music Button */}
          <button
            onClick={onMusicClick}
            className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <Music className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Guided Walks Screen - Library of guided walks
 */
const GuidedWalksScreen = () => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-md mx-auto">
        <p className="text-slate-600 text-center py-12">
          Browse guided walks library
          <br />
          <span className="text-sm text-slate-500">Coming soon</span>
        </p>
      </div>
    </div>
  );
};

export default WalkPage;
