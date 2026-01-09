import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Heart } from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExplorerNavbar } from "@/components/ExplorerNavbar";
import { usePublicServices } from "@/hooks/useServices";
import GuideCard from "@/components/GuideCard";
import { supabase } from "@/integrations/supabase/client";
import GuideMap from "@/components/GuideMap";
import { useFavorites } from "@/hooks/useFavorites";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Service } from "@/hooks/useServices";

const GuidesTab = ({ explorerLocation }: { explorerLocation: { lat: number; lng: number; cityName: string } | null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [allGuides, setAllGuides] = useState<any[]>([]);
  const [hoveredGuideId, setHoveredGuideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          avatar_url,
          full_name,
          guide_title,
          location,
          total_bookings,
          response_rate,
          response_time,
          languages_spoken,
          verification_status,
          bio,
          coordinates_lat,
          coordinates_lng,
          user_type
        `)
        .eq("user_type", "guide")
        .not("id", "is", null)
        .order("total_bookings", { ascending: false });

      console.log("🔍 DEBUG - Fetching guides from profiles:");
      console.log("  - Query filter: user_type = 'guide'");
      console.log("  - Returned count:", data?.length || 0);
      console.log("  - Error:", error);
      console.log("  - Raw data:", data);

      setAllGuides(data || []);
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-muted-foreground">Loading guides...</div>
      </div>
    );
  }

  const validGuides = allGuides.filter(g => g?.id);
  
  // Normalize coordinates: convert to numbers and filter out invalid values
  const guidesWithCoordinates = validGuides
    .map(g => ({
      ...g,
      coordinates_lat: Number(g.coordinates_lat),
      coordinates_lng: Number(g.coordinates_lng)
    }))
    .filter(g => 
      !isNaN(g.coordinates_lat) && 
      !isNaN(g.coordinates_lng) &&
      g.coordinates_lat !== 0 &&
      g.coordinates_lng !== 0
    );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Discover Guides</h2>
        <p className="text-muted-foreground">
          Find verified guides for your next adventure • {validGuides.length} guide{validGuides.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {guidesWithCoordinates.length > 0 && (
        <ErrorBoundary where="GuideMap" fallback={
          <div className="w-full h-[40vh] rounded-xl overflow-hidden border shadow-lg flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Map unavailable</p>
          </div>
        }>
          <div className="w-full h-[40vh] rounded-xl overflow-hidden border shadow-lg">
            <GuideMap
              guides={guidesWithCoordinates}
              hoveredGuideId={hoveredGuideId}
              onMarkerClick={(id) => navigate(`/explore/guides/${id}`)}
              center={explorerLocation ? [explorerLocation.lat, explorerLocation.lng] : undefined}
            />
          </div>
        </ErrorBoundary>
      )}

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">All Guides • {validGuides.length} available</h3>
        {validGuides.length > 0 ? (
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-8">
            {validGuides.slice(0, 12).map((guide) => (
              <div
                key={guide.id}
                onMouseEnter={() => setHoveredGuideId(guide.id)}
                onMouseLeave={() => setHoveredGuideId(null)}
              >
                <GuideCard
                  id={guide.id}
                  avatar={guide.avatar_url}
                  name={guide.full_name || "Guide"}
                  title={guide.guide_title}
                  location={guide.location}
                  rating={guide.total_bookings > 0 ? 4.8 : 0}
                  reviewsCount={guide.total_bookings || 0}
                  responseRate={guide.response_rate}
                  responseTime={guide.response_time}
                  totalBookings={guide.total_bookings || 0}
                  languagesSpoken={guide.languages_spoken}
                  verificationStatus={guide.verification_status || "unverified"}
                  bio={guide.bio}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No guides available yet
          </div>
        )}
      </div>
    </div>
  );
};
const ExplorerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [explorerLocation, setExplorerLocation] = useState<{ lat: number; lng: number; cityName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"experiences" | "guides" | "favorites">("experiences");
  const { services: popularExperiences, loading } = usePublicServices();
  const { favorites } = useFavorites();
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [featuredGuides, setFeaturedGuides] = useState<any[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);
  const [filteredExperiences, setFilteredExperiences] = useState<Service[]>([]);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || "your area";
          setExplorerLocation({
            lat: latitude,
            lng: longitude,
            cityName: city
          });
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }, error => {
        console.error("Geolocation error:", error);
      });
    }
  }, []);

  useEffect(() => {
    fetchFeaturedGuides();
  }, []);

  useEffect(() => {
    if (activeTab === 'favorites' && favorites.size > 0) {
      fetchFavoriteServices();
    }
  }, [activeTab, favorites]);

  useEffect(() => {
    filterExperiences();
  }, [searchFilters, popularExperiences]);

  const fetchFeaturedGuides = async () => {
    try {
      setGuidesLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          avatar_url,
          full_name,
          guide_title,
          location,
          total_bookings,
          response_rate,
          response_time,
          languages_spoken,
          verification_status,
          bio
        `)
        .eq("user_type", "guide")
        .not("id", "is", null)
        .order("total_bookings", { ascending: false })
        .limit(12);

      if (error) throw error;
      setFeaturedGuides(data || []);
    } catch (error) {
      console.error("Error fetching featured guides:", error);
    } finally {
      setGuidesLoading(false);
    }
  };

  const fetchFavoriteServices = async () => {
    setFavoritesLoading(true);
    try {
      const favoriteIds = Array.from(favorites);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .in('id', favoriteIds)
        .eq('status', 'active');

      if (error) throw error;
      setFavoriteServices(data || []);
    } catch (error) {
      console.error('Error fetching favorite services:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const filterExperiences = () => {
    if (!searchFilters || (!searchFilters.location && !searchFilters.date && !searchFilters.duration)) {
      setFilteredExperiences(popularExperiences);
      return;
    }

    let filtered = [...popularExperiences];

    // Filter by location
    if (searchFilters.location && searchFilters.location !== "Nearby") {
      filtered = filtered.filter(service => 
        service.location.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    // Filter by duration
    if (searchFilters.duration) {
      const maxDuration = parseInt(searchFilters.duration);
      if (maxDuration === 120) {
        // 2+ hours
        filtered = filtered.filter(service => service.duration_minutes >= 120);
      } else {
        filtered = filtered.filter(service => service.duration_minutes <= maxDuration);
      }
    }

    setFilteredExperiences(filtered);
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "experiences" | "guides" | "favorites")} className="min-h-screen bg-background">
      {/* Header */}
      <ExplorerNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Search Bar Section */}
      <div className="px-6 lg:px-10 xl:px-20 pb-6 pt-2 bg-zinc-100 border-b border-border">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="px-6 lg:px-10 xl:px-20 py-8">
        <TabsList className="lg:hidden mb-6 bg-muted w-full">
          <TabsTrigger value="experiences" className="flex-1">{t("nav.experiences")}</TabsTrigger>
          <TabsTrigger value="guides" className="flex-1">{t("nav.guides")}</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">{t("nav.favorites")}</TabsTrigger>
        </TabsList>

        <TabsContent value="experiences" className="mt-0">
          {/* Search Results or Popular Experiences */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/explore?category=popular-experiences&location=${explorerLocation?.cityName || "your area"}`)}>
                {searchFilters && (searchFilters.location || searchFilters.duration) 
                  ? `Search Results ${searchFilters.location ? `in ${searchFilters.location}` : ''}`
                  : `${t("dashboard.popularExperiences")} ${explorerLocation?.cityName || "your area"}`
                }
              </h2>
              {searchFilters && (searchFilters.location || searchFilters.duration) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSearchFilters(null)}
                >
                  Clear filters
                </Button>
              )}
            </div>
            {loading ? (
              <div className="text-center py-12">Loading experiences...</div>
            ) : filteredExperiences.length > 0 ? (
              <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <div className="absolute -top-14 right-0 flex gap-2">
                  <CarouselPrevious className="relative static translate-y-0" />
                  <CarouselNext className="relative static translate-y-0" />
                </div>
                <CarouselContent className="-ml-5">
                  {filteredExperiences.slice(0, 12).map((service) => (
                    <CarouselItem key={service.id} className="pl-5 basis-full sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                      <ExperienceCard 
                        id={service.id} 
                        image={service.image_urls?.[0] || "/placeholder.svg"} 
                        title={service.title} 
                        guide="Guide" 
                        location={service.location} 
                        price={service.price} 
                        rating={service.rating_avg} 
                        reviews={service.reviews_count} 
                        type={service.type} 
                        isGuestFavorite={service.is_guest_favorite} 
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No experiences found matching your filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchFilters(null)}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Best Sellers */}
          {!searchFilters && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/explore?category=best-sellers&location=${explorerLocation?.cityName || "your area"}`)}>
                  {t("dashboard.bestSellers")} {explorerLocation?.cityName || "your area"}
                </h2>
              </div>
              {loading ? (
                <div className="text-center py-12">Loading experiences...</div>
              ) : (
                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                  <div className="absolute -top-14 right-0 flex gap-2">
                    <CarouselPrevious className="relative static translate-y-0" />
                    <CarouselNext className="relative static translate-y-0" />
                  </div>
                  <CarouselContent className="-ml-5">
                    {[...popularExperiences].sort((a, b) => b.bookings_count - a.bookings_count).slice(0, 12).map((service) => (
                      <CarouselItem key={service.id} className="pl-5 basis-full sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                        <ExperienceCard 
                          id={service.id} 
                          image={service.image_urls?.[0] || "/placeholder.svg"} 
                          title={service.title} 
                          guide="Guide" 
                          location={service.location} 
                          price={service.price} 
                          rating={service.rating_avg} 
                          reviews={service.reviews_count} 
                          type={service.type} 
                          isGuestFavorite={service.is_guest_favorite} 
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </div>
          )}

          {/* Featured Guides */}
          {!searchFilters && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setActiveTab("guides")}>
                  Top Guides in {explorerLocation?.cityName || "your area"}
                </h2>
              </div>
              {guidesLoading ? (
                <div className="text-center py-12">Loading guides...</div>
              ) : (
                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                  <div className="absolute -top-14 right-0 flex gap-2">
                    <CarouselPrevious className="relative static translate-y-0" />
                    <CarouselNext className="relative static translate-y-0" />
                  </div>
                  <CarouselContent className="-ml-5">
                    {featuredGuides.map((guide) => (
                      <CarouselItem key={guide.id} className="pl-5 basis-full sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                        <GuideCard
                          id={guide.id}
                          avatar={guide.avatar_url}
                          name={guide.full_name || "Guide"}
                          title={guide.guide_title}
                          location={guide.location}
                          rating={guide.total_bookings > 0 ? 4.8 : 0}
                          reviewsCount={guide.total_bookings || 0}
                          responseRate={guide.response_rate}
                          responseTime={guide.response_time}
                          totalBookings={guide.total_bookings || 0}
                          languagesSpoken={guide.languages_spoken}
                          verificationStatus={guide.verification_status || "unverified"}
                          bio={guide.bio}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guides" className="mt-0">
          <GuidesTab explorerLocation={explorerLocation} />
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
                <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                {t("nav.favorites")}
              </h2>
              <p className="text-muted-foreground">
                Your saved experiences • {favorites.size} favorite{favorites.size !== 1 ? 's' : ''}
              </p>
            </div>

            {favoritesLoading ? (
              <div className="text-center py-12">
                <div className="text-lg text-muted-foreground">Loading favorites...</div>
              </div>
            ) : favoriteServices.length > 0 ? (
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-8">
                {favoriteServices.map((service) => (
                  <ExperienceCard
                    key={service.id}
                    id={service.id}
                    image={service.image_urls?.[0] || "/placeholder.svg"}
                    title={service.title}
                    guide="Guide"
                    location={service.location}
                    price={service.price}
                    rating={service.rating_avg}
                    reviews={service.reviews_count}
                    type={service.type}
                    isGuestFavorite={service.is_guest_favorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground mb-2">No favorites yet</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the heart icon on experiences to save them here
                </p>
                <Button onClick={() => setActiveTab("experiences")}>
                  Explore Experiences
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};
export default ExplorerDashboard;