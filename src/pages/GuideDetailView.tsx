import Navbar from "@/components/Navbar";
import BookingServiceCard from "@/components/BookingServiceCard";
import TestimonialCard from "@/components/TestimonialCard";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Heart, Shield, Globe, Link2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SendRequestModal from "@/components/SendRequestModal";
import { Badge } from "@/components/ui/badge";

const GuideDetailView = () => {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guideProfile, setGuideProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [availability, setAvailability] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('15');

  useEffect(() => {
    if (guideId) loadData();
  }, [guideId]);

  const loadData = async () => {
    const { data: profile } = await supabase.from("public_profiles").select("*").eq("id", guideId).single();
    const { data: serviceList } = await supabase.from("services").select("*").eq("guide_id", guideId);
    const { data: reviewList } = await supabase.from("reviews").select("*, explorer:profiles(full_name, avatar_url)");
    const { data: availabilityData } = await supabase
      .from("guide_availability")
      .select("*")
      .eq("guide_id", guideId)
      .eq("is_available", true);
    const { data: settingsData } = await supabase
      .from("guide_settings")
      .select("*")
      .eq("guide_id", guideId)
      .maybeSingle();
    
    setGuideProfile(profile);
    setServices(serviceList || []);
    setReviews(reviewList || []);
    setAvailability(availabilityData || []);
    setSettings(settingsData);
  };

  const getDurationOptions = () => {
    if (!settings) return [];
    if (settings.pricing_type === 'fixed' && settings.fixed_duration) {
      return [
        { label: `${settings.fixed_duration} Min`, value: settings.fixed_duration.toString(), price: settings.hourly_rate || 0 }
      ];
    }
    return [
      { label: '15 Min', value: '15', price: (settings.hourly_rate || 0) * 0.25 },
      { label: '30 Min', value: '30', price: (settings.hourly_rate || 0) * 0.5 },
      { label: '45 Min', value: '45', price: (settings.hourly_rate || 0) * 0.75 },
      { label: '60 Min', value: '60', price: settings.hourly_rate || 0 }
    ];
  };

  const getTodayTimeSlots = () => {
    const today = new Date().getDay();
    const todaySlots = availability.filter(slot => slot.day_of_week === today);
    
    // Generate time slots based on availability
    const slots = [];
    for (const slot of todaySlots) {
      const start = new Date(`2000-01-01T${slot.start_time}`);
      const end = new Date(`2000-01-01T${slot.end_time}`);
      
      while (start < end) {
        const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        slots.push({
          time: timeStr,
          available: Math.random() > 0.3 // Simulate availability
        });
        start.setMinutes(start.getMinutes() + parseInt(selectedDuration));
      }
    }
    
    return slots.slice(0, 6); // Show max 6 slots
  };

  if (!guideProfile) return null;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            <div className="relative">
              <img src={guideProfile.avatar_url} alt={guideProfile.full_name} className="w-96 h-96 rounded-lg object-cover shadow" />
              <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100">
                <Heart />
              </button>
              {guideProfile.top_expert && (
                <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 text-sm rounded">
                  Top Expert
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold">{guideProfile.full_name}</h1>
            {guideProfile.subtitle && <p className="text-muted-foreground">{guideProfile.subtitle}</p>}

            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{reviews.length > 0 ? reviews.length + " reviews" : "No reviews yet"}</span>
            </div>

            <div className="space-y-4">
              {guideProfile.bio && (
                <div>
                  <h2 className="font-semibold mb-1">About Me</h2>
                  <p className="text-muted-foreground">{guideProfile.bio}</p>
                </div>
              )}
              {guideProfile.notables?.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-1">Notables</h2>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {guideProfile.notables.map((n: string, i: number) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                {guideProfile.instagram_url && <a href={guideProfile.instagram_url}><Globe /></a>}
                {guideProfile.linkedin_url && <a href={guideProfile.linkedin_url}><Link2 /></a>}
                {guideProfile.website_url && <a href={guideProfile.website_url}><Globe /></a>}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="w-full md:w-[450px] space-y-6 md:sticky md:top-20 self-start">
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Powered by your platform</p>
                  <h2 className="text-2xl font-bold mb-4">Book a session</h2>
                  
                  {settings && (
                    <>
                      {/* Duration Options */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {getDurationOptions().map((option) => (
                          <Button
                            key={option.value}
                            variant={selectedDuration === option.value ? "default" : "outline"}
                            className="h-auto py-3"
                            onClick={() => setSelectedDuration(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>

                      {/* Today's Availability */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4" />
                          <h3 className="font-semibold">Today</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {getTodayTimeSlots().length > 0 ? (
                            getTodayTimeSlots().map((slot, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                className="h-auto py-3 flex flex-col items-center"
                                disabled={!slot.available}
                              >
                                <span className="font-medium">{slot.time}</span>
                                {!slot.available && (
                                  <span className="text-xs text-muted-foreground">(Sold Out)</span>
                                )}
                              </Button>
                            ))
                          ) : (
                            <p className="col-span-3 text-sm text-muted-foreground text-center py-4">
                              No availability today
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Request Time Link */}
                      <p className="text-sm text-center mb-4">
                        Looking for a time not listed?{' '}
                        <button 
                          className="text-primary underline"
                          onClick={() => setShowRequestModal(true)}
                        >
                          Tap here to request a time
                        </button>
                      </p>

                      {/* Price & Rating */}
                      <div className="border-t pt-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold">
                              ${getDurationOptions().find(o => o.value === selectedDuration)?.price || 0}
                            </span>
                            <span className="text-muted-foreground">• Session</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                            <span className="text-sm ml-1">5.0 ({reviews.length})</span>
                          </div>
                        </div>
                        <Button 
                          size="lg"
                          onClick={() => setShowRequestModal(true)}
                          className="px-8"
                        >
                          Next
                        </Button>
                      </div>
                    </>
                  )}

                  {!settings && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">This guide hasn't set up availability yet</p>
                      <Button onClick={() => setShowRequestModal(true)}>
                        Send Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services List */}
            {services.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Available Services</h3>
                {services.map(service => (
                  <BookingServiceCard key={service.id} service={service} onBook={() => setShowRequestModal(true)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="mt-12 space-y-10">
          {services.some(s => s.session_details?.length > 0) && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">What to Expect</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map(
                  s =>
                    s.session_details && (
                      <Card key={s.id}>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-2">{s.title}</h3>
                          <ul className="list-disc list-inside text-muted-foreground text-sm">
                            {s.session_details.map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )
                )}
              </div>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Why It's Valuable</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.slice(0, 6).map(r => (
                  <TestimonialCard key={r.id} review={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <SendRequestModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        guideId={guideId!}
        guideName={guideProfile.full_name}
        guideAvatar={guideProfile.avatar_url}
        services={services}
      />
    </div>
  );
};

export default GuideDetailView;
