import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ExperienceCard from "@/components/ExperienceCard";
import ExperienceMap from "@/components/ExperienceMap";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, Grid3x3, Map as MapIcon, Info, ArrowLeft } from "lucide-react";
import { usePublicServices } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
const Explore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hoveredExperienceId, setHoveredExperienceId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const category = searchParams.get("category") || "popular-experiences";
  const location = searchParams.get("location") || "your area";

  // Memoize filters to avoid refetch loops and ignore location for popular-experiences
  const serviceFilters = useMemo(() => {
    if (category === "popular-experiences") return undefined;
    if (location && location !== "your area") return {
      location
    } as const;
    return undefined;
  }, [category, location]);
  const {
    services,
    loading
  } = usePublicServices(serviceFilters as any);
  const [guideProfiles, setGuideProfiles] = useState<Record<string, any>>({});
  useEffect(() => {
    const fetchGuideProfiles = async () => {
      if (services.length === 0) return;
      const guideIds = [...new Set(services.map(s => s.guide_id))];
      const {
        data
      } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", guideIds);
      if (data) {
        const profilesMap = data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
        setGuideProfiles(profilesMap);
      }
    };
    fetchGuideProfiles();
  }, [services]);
  const categoryTitleMap: Record<string, string> = {
    "popular-experiences": `Popular experiences in ${location}`,
    "following": "My following",
    "popular-guides": `Popular guides in ${location}`,
    "best-sellers": `Best sellers in ${location}`,
    "top-rated": `Top rated guides in ${location}`
  };

  // Sort services based on category
  let experiences = [...services];
  if (category === "best-sellers") {
    experiences = experiences.sort((a, b) => b.bookings_count - a.bookings_count);
  } else if (category === "top-rated") {
    experiences = experiences.sort((a, b) => b.rating_avg - a.rating_avg);
  }
  const pageTitle = categoryTitleMap[category] || `Popular experiences in ${location}`;
  useEffect(() => {
    // Redirect to dashboard if no valid category
    if (!category && !searchParams.get("category")) {
      navigate("/explorer/dashboard");
    }
  }, [category, navigate, searchParams]);
  const handleMarkerClick = (id: string) => {
    setSelectedExperienceId(id);
    // Scroll to the experience card
    const element = document.getElementById(`experience-${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <Navbar />

      {/* Split Screen Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Experience Cards */}
        <div className={`${showMap ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
          <div className="px-6 py-6">
            {/* Experience Grid */}
            {loading ? <div className="text-center py-12">Loading experiences...</div> : experiences.length === 0 ? <div className="text-center py-12">
                <p className="text-muted-foreground">No experiences found in this location.</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                {experiences.map(service => <div key={service.id} id={`experience-${service.id}`}>
                    <ExperienceCard id={service.id} image={service.image_urls?.[0] || "/placeholder.svg"} title={service.title} guide={guideProfiles[service.guide_id]?.full_name || "Guide"} location={service.location} price={service.price} rating={service.rating_avg} reviews={service.reviews_count} type={service.type} isGuestFavorite={service.is_guest_favorite} hostAvatar={guideProfiles[service.guide_id]?.avatar_url} onHover={setHoveredExperienceId} isHighlighted={selectedExperienceId === service.id} />
                  </div>)}
              </div>}
          </div>
        </div>

        {/* Right Panel - Map */}
        {showMap && experiences.length > 0 && <div className="w-1/2 sticky top-0 h-full mx-0">
            <ExperienceMap experiences={experiences.map(s => ({
          ...s,
          guide: "Guide",
          reviews: s.reviews_count,
          rating: s.rating_avg,
          image: s.image_urls?.[0] || "/placeholder.svg",
          coordinates: {
            lat: s.coordinates_lat || 0,
            lng: s.coordinates_lng || 0
          }
        }))} hoveredExperienceId={hoveredExperienceId} onMarkerClick={handleMarkerClick} className="my-0 mx-0 px-[20px] py-[20px] rounded-sm" />
          </div>}
      </div>
    </div>;
};
export default Explore;