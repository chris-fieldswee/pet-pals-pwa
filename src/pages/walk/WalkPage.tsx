import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Music, Play, Download, Clock } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/pet/${petId}`)}
              className="hover:bg-transparent hover:text-current"
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
      <div className="flex-1 min-h-0">
        {activeTab === "standard" ? (
          <StandardWalkScreen 
            petId={petId || ""}
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
const StandardWalkScreen = ({ petId, onMusicClick }: { petId: string; onMusicClick: () => void }) => {
  const navigate = useNavigate();
  
  const handleStart = () => {
    navigate(`/pet/${petId}/walk/active`);
  };
  return (
    <div className="flex flex-col h-full relative">
      {/* Map Placeholder */}
      <div className="flex-1 bg-slate-200 relative overflow-hidden min-h-0">
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

      {/* Bottom Controls - Fixed at Bottom */}
      <div className="bg-white border-t border-slate-200 px-6 py-6 z-50 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          {/* Settings Button */}
          <button className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Settings className="w-6 h-6 text-slate-600" />
          </button>

          {/* START Button - Large Circle */}
          <button
            onClick={handleStart}
            className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Play className="w-8 h-8 text-white fill-white" />
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
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guidedWalks, setGuidedWalks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuidedWalks();
  }, []);

  const fetchGuidedWalks = async () => {
    try {
      const { data, error } = await supabase
        .from("guided_walks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by category
      const grouped = data?.reduce((acc: any, walk: any) => {
        if (!acc[walk.category]) {
          acc[walk.category] = {
            category: walk.category,
            subtitle: getCategorySubtitle(walk.category),
            walks: []
          };
        }
        acc[walk.category].walks.push(walk);
        return acc;
      }, {});

      setGuidedWalks(Object.values(grouped || {}));
    } catch (error: any) {
      console.error("Error fetching guided walks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategorySubtitle = (category: string) => {
    const subtitles: Record<string, string> = {
      "Get Started": "Practical tips for you and your new friend",
      "Leash Training": "Guided tips to stop pulling and start enjoying",
      "Energy Burners": "Intervals and activities for high-energy pets"
    };
    return subtitles[category] || "";
  };

  const handleWalkClick = (walkId: string) => {
    navigate(`/pet/${petId}/guided-walk/${walkId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-600">Loading guided walks...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-6">
      <div className="max-w-md mx-auto px-6 space-y-8 py-6">
        {/* My Walks Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">My Walks</h2>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">Saved</h3>
              <p className="text-2xl font-bold text-primary">0</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">Completed</h3>
              <p className="text-2xl font-bold text-primary">0</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">Downloaded</h3>
              <p className="text-2xl font-bold text-primary">0</p>
            </div>
          </div>
        </div>

        {/* Guided Walk Collections */}
        {guidedWalks.map((category: any) => (
          <div key={category.category} className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{category.category}</h3>
              <p className="text-sm text-slate-600">{category.subtitle}</p>
            </div>
            
            <div className="space-y-3">
              {category.walks.map((walk: any) => (
                <div
                  key={walk.id}
                  onClick={() => handleWalkClick(walk.id)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div 
                    className="h-32 relative bg-slate-200"
                    style={{
                      backgroundImage: `url(${walk.hero_image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-bold text-lg">{walk.title}</h4>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {walk.duration} Min
                      </span>
                      <span>•</span>
                      <span>{walk.category}</span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{walk.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalkPage;
