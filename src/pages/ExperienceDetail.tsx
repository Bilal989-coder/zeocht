import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Video, Clock, Users, ArrowLeft, Heart, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Service } from "@/hooks/useServices";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createConversation } = useConversations();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");

  const [service, setService] = useState<Service | null>(null);
  const [guideProfile, setGuideProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ value: string; label: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ✅ FIX: slot increments should be durationMinutes, not 60
  const generateTimeSlots = (startTime: string, endTime: string, durationMinutes: number) => {
    const slots: { value: string; label: string }[] = [];

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const hh = Math.floor(currentMinutes / 60);
      const mm = currentMinutes % 60;

      const timeValue = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      const hour12 = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
      const ampm = hh >= 12 ? "PM" : "AM";
      const label = `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;

      slots.push({ value: timeValue, label });
      currentMinutes += durationMinutes; // ✅ FIX
    }

    return slots;
  };

  const fetchAvailability = async (selectedDate: Date, guideId: string, serviceDuration: number) => {
    setSlotsLoading(true);
    setTimeSlot("");

    try {
      const dayOfWeek = selectedDate.getDay();

      const { data: availability, error } = await supabase
        .from("guide_availability")
        .select("*")
        .eq("guide_id", guideId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true);

      if (error) throw error;

      if (availability && availability.length > 0) {
        const allSlots: { value: string; label: string }[] = [];
        availability.forEach((avail) => {
          const slots = generateTimeSlots(avail.start_time, avail.end_time, serviceDuration);
          allSlots.push(...slots);
        });

        const uniqueSlots = allSlots
          .filter((slot, index, self) => index === self.findIndex((s) => s.value === slot.value))
          .sort((a, b) => a.value.localeCompare(b.value));

        setAvailableTimeSlots(uniqueSlots);
      } else {
        setAvailableTimeSlots([
          { value: "09:00", label: "9:00 AM" },
          { value: "10:00", label: "10:00 AM" },
          { value: "11:00", label: "11:00 AM" },
          { value: "14:00", label: "2:00 PM" },
          { value: "15:00", label: "3:00 PM" },
          { value: "16:00", label: "4:00 PM" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailableTimeSlots([
        { value: "09:00", label: "9:00 AM" },
        { value: "10:00", label: "10:00 AM" },
        { value: "14:00", label: "2:00 PM" },
        { value: "16:00", label: "4:00 PM" },
      ]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchServiceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  useEffect(() => {
    if (date && service?.guide_id) {
      fetchAvailability(date, service.guide_id, service.duration_minutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, service?.guide_id, service?.duration_minutes]);

  // ✅ FIX: remove `.eq("status","active").single()` (406 when not found)
  // We fetch by id only, then we allow only active for public users.
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);

      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (!serviceData) {
        setService(null);
        return;
      }

      // ✅ Permission: if service is not active, only owner can see
      const isOwner = user?.id && serviceData.guide_id === user.id;
      if (serviceData.status !== "active" && !isOwner) {
        setService(null);
        return;
      }

      setService(serviceData as Service);

      if (serviceData?.guide_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", serviceData.guide_id)
          .maybeSingle();

        setGuideProfile(profileData);
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`*, explorer:explorer_id(full_name, avatar_url)`)
        .eq("service_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

      setReviews(reviewsData || []);
    } catch (err: any) {
      console.error("Error fetching service:", err);
      toast({
        title: "Error",
        description: "Failed to load service details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithGuide = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with the guide",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    if (!service) return;

    const { data, error } = await createConversation(service.guide_id, service.id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      return;
    }
    navigate(`/messages?conversation=${data?.id}`);
  };

  const handleReserveNow = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a reservation",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (!service) return;

    if (service.type !== "recorded" && !date) {
      toast({
        title: "Select a date",
        description: "Please select a date for your booking",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);
    try {
      const scheduledDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          serviceId: service.id,
          scheduledDate,
          scheduledTime: timeSlot || null,
          guestsCount: 1,
        },
      });

      if (error) throw new Error(error.message || "Failed to create checkout session");
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to initiate booking",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-muted-foreground mb-4">Service not found</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </div>
      </div>
    );
  }

  const displayImages =
    service.image_urls && service.image_urls.length > 0 ? service.image_urls : [service.image_urls?.[0] || ""];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <Button variant="ghost" className="mb-4 gap-2 -ml-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">{service.title}</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>

        {/* Images */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          {displayImages.length === 1 ? (
            <div className="h-[400px] sm:h-[500px]">
              <img src={displayImages[0]} alt={service.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[500px]">
              <div className="col-span-1 sm:col-span-2 row-span-2">
                <img src={displayImages[0]} alt={service.title} className="w-full h-full object-cover" />
              </div>
              {displayImages.slice(1, 5).map((img, index) => (
                <div key={index} className="col-span-1 row-span-1">
                  <img src={img} alt={`${service.title} ${index + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {displayImages.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-4 right-4 bg-background gap-2 shadow-lg hover:bg-background/90"
            >
              <Grid3x3 className="h-4 w-4" />
              Show all photos
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div className="pb-8 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                    Experience hosted by {guideProfile?.full_name || "Guide"}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{service.duration_minutes} minutes</span>
                    {service.languages && service.languages.length > 0 && (
                      <>
                        <span>·</span>
                        <span>Hosted in {service.languages.join(", ")}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>Up to {service.max_guests} guests</span>
                  </div>
                </div>
                <Avatar className="h-14 w-14">
                  <AvatarImage src={guideProfile?.avatar_url} />
                  <AvatarFallback className="text-lg">{guideProfile?.full_name?.charAt(0) || "G"}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="pb-8 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">What you'll do</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

              {service.whats_included && service.whats_included.length > 0 && (
                <ul className="space-y-3">
                  {service.whats_included.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-1">
                        <Star className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pb-8 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">Experience details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Experience Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{service.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Group Size</p>
                    <p className="text-sm text-muted-foreground">Up to {service.max_guests} people</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{service.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-8 border-b border-border">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 fill-primary text-primary" />
                <span className="text-xl sm:text-2xl font-semibold">
                  {service.rating_avg ? service.rating_avg.toFixed(1) : "New"}
                </span>
                <span className="text-xl sm:text-2xl font-semibold">·</span>
                <span className="text-xl sm:text-2xl font-semibold">
                  {service.reviews_count} {service.reviews_count === 1 ? "review" : "reviews"}
                </span>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.explorer?.avatar_url} />
                          <AvatarFallback>{review.explorer?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{review.explorer?.full_name || "Anonymous"}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                          {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Right Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-border rounded-2xl p-6 shadow-lg space-y-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">
                      {service.currency === "USD" ? "$" : service.currency}
                      {service.price}
                    </span>
                    <span className="text-muted-foreground">per session</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.duration_minutes} minute session</p>
                </div>

                {service.type !== "recorded" && (
                  <div className="space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start h-14 flex-col items-start", !date && "text-muted-foreground")}
                        >
                          <span className="text-xs font-normal text-muted-foreground">Date</span>
                          <span className="text-sm font-medium">{date ? format(date, "PPP") : "Select date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(d) => d < new Date()}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <Select value={timeSlot} onValueChange={setTimeSlot} disabled={!date || slotsLoading}>
                      <SelectTrigger
                        className={cn("w-full justify-start h-14 flex-col items-start", !timeSlot && "text-muted-foreground")}
                      >
                        <span className="text-xs font-normal text-muted-foreground">Time slot</span>
                        <SelectValue placeholder={slotsLoading ? "Loading..." : !date ? "Select date first" : "Select time"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-sm text-muted-foreground text-center">No available slots for this day</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={handleReserveNow}
                  disabled={bookingLoading || (service.type !== "recorded" && !date)}
                >
                  {bookingLoading ? "Processing..." : "Reserve now"}
                </Button>

                <Button variant="outline" className="w-full h-12 text-base" size="lg" onClick={handleChatWithGuide}>
                  Chat with guide
                </Button>

                <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="underline text-muted-foreground">
                      {service.currency === "USD" ? "$" : service.currency}
                      {service.price} x 1 session
                    </span>
                    <span>
                      {service.currency === "USD" ? "$" : service.currency}
                      {service.price}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="underline text-muted-foreground">Service fee</span>
                    <span>
                      {service.currency === "USD" ? "$" : service.currency}
                      {Math.round(service.price * 0.1)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {service.currency === "USD" ? "$" : service.currency}
                      {service.price + Math.round(service.price * 0.1)}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="link" className="w-full mt-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="underline">Report this listing</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
