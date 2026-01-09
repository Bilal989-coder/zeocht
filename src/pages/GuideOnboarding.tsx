import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Globe2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import logo from "@/assets/logo.png";

const STEPS = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Profile", icon: User },
  { id: 3, title: "First Service", icon: Briefcase },
  { id: 4, title: "Complete", icon: Check },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian",
];

const CATEGORY_VALUES = [
  "food", "culture", "adventure", "art", "nature",
  "history", "sports", "music", "wellness", "shopping",
];

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Drink",
  culture: "Culture & History",
  adventure: "Nature & Adventure",
  art: "Art & Photography",
  nature: "Nature & Outdoor",
  history: "History & Heritage",
  sports: "Sports & Fitness",
  music: "Music & Entertainment",
  wellness: "Wellness & Spirituality",
  shopping: "Shopping & Markets",
};

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const GuideOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  const [profile, setProfile] = useState({
    full_name: "",
    guide_title: "",
    bio: "",
    location: "",
    languages_spoken: [] as string[],
    coordinates_lat: null as number | null,
    coordinates_lng: null as number | null,
  });

  const [service, setService] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    price: "",
    duration_minutes: "60",
    max_guests: "4",
    coordinates_lat: null as number | null,
    coordinates_lng: null as number | null,
  });

  const [skipService, setSkipService] = useState(false);

  // ✅ Profile Location Dropdown
  const [profileLocSuggestions, setProfileLocSuggestions] = useState<LocationSuggestion[]>([]);
  const [showProfileLoc, setShowProfileLoc] = useState(false);

  // ✅ Service Location Dropdown
  const [serviceLocSuggestions, setServiceLocSuggestions] = useState<LocationSuggestion[]>([]);
  const [showServiceLoc, setShowServiceLoc] = useState(false);

  const profileDebounceRef = useRef<number | null>(null);
  const serviceDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checkOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, full_name, guide_title, bio, location, languages_spoken")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.onboarding_completed) {
        navigate("/guide/dashboard");
        return;
      }

      setProfile((prev) => ({
        ...prev,
        full_name: data?.full_name ?? prev.full_name,
        guide_title: (data as any)?.guide_title ?? prev.guide_title,
        bio: (data as any)?.bio ?? prev.bio,
        location: (data as any)?.location ?? prev.location,
        languages_spoken: (data as any)?.languages_spoken ?? prev.languages_spoken,
      }));
    } catch (err) {
      console.error("Error checking onboarding:", err);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (field: string, value: any) => {
    setService((prev) => ({ ...prev, [field]: value }));
  };

  const addLanguage = (lang: string) => {
    if (!profile.languages_spoken.includes(lang)) {
      handleProfileChange("languages_spoken", [...profile.languages_spoken, lang]);
    }
  };

  const removeLanguage = (lang: string) => {
    handleProfileChange(
      "languages_spoken",
      profile.languages_spoken.filter((l) => l !== lang)
    );
  };

  // ✅ Fetch suggestions (OpenStreetMap Nominatim)
  const fetchSuggestions = async (query: string) => {
    const q = query.trim();
    if (q.length < 3) return [];
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? (data as LocationSuggestion[]) : [];
    } catch (e) {
      return [];
    }
  };

  // ✅ Profile location typing debounce
  useEffect(() => {
    if (profileDebounceRef.current) window.clearTimeout(profileDebounceRef.current);

    profileDebounceRef.current = window.setTimeout(async () => {
      if (profile.location.trim().length < 3) {
        setProfileLocSuggestions([]);
        setShowProfileLoc(false);
        return;
      }
      const results = await fetchSuggestions(profile.location);
      setProfileLocSuggestions(results);
      setShowProfileLoc(results.length > 0);
    }, 400);

    return () => {
      if (profileDebounceRef.current) window.clearTimeout(profileDebounceRef.current);
    };
  }, [profile.location]);

  // ✅ Service location typing debounce
  useEffect(() => {
    if (serviceDebounceRef.current) window.clearTimeout(serviceDebounceRef.current);

    serviceDebounceRef.current = window.setTimeout(async () => {
      if (service.location.trim().length < 3) {
        setServiceLocSuggestions([]);
        setShowServiceLoc(false);
        return;
      }
      const results = await fetchSuggestions(service.location);
      setServiceLocSuggestions(results);
      setShowServiceLoc(results.length > 0);
    }, 400);

    return () => {
      if (serviceDebounceRef.current) window.clearTimeout(serviceDebounceRef.current);
    };
  }, [service.location]);

  const onSelectProfileLocation = (s: LocationSuggestion) => {
    handleProfileChange("location", s.display_name);
    handleProfileChange("coordinates_lat", Number(s.lat));
    handleProfileChange("coordinates_lng", Number(s.lon));
    setShowProfileLoc(false);
    setProfileLocSuggestions([]);
  };

  const onSelectServiceLocation = (s: LocationSuggestion) => {
    handleServiceChange("location", s.display_name);
    handleServiceChange("coordinates_lat", Number(s.lat));
    handleServiceChange("coordinates_lng", Number(s.lon));
    setShowServiceLoc(false);
    setServiceLocSuggestions([]);
  };

  const completeOnboarding = async () => {
    if (!user?.id) {
      toast.error("Session missing. Please login again.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (error) throw error;

      setCurrentStep(4);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // Step 2: Save profile
    if (currentStep === 2) {
      if (!user?.id) {
        toast.error("Session missing. Please login again.");
        navigate("/auth");
        return;
      }

      if (!profile.full_name || !profile.guide_title || !profile.bio || !profile.location) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: profile.full_name.trim(),
            guide_title: profile.guide_title.trim(),
            bio: profile.bio.trim(),
            location: profile.location.trim(),
            languages_spoken: profile.languages_spoken,
            // coordinates_lat: profile.coordinates_lat,
            // coordinates_lng: profile.coordinates_lng,
          })
          .eq("id", user.id);

        if (error) throw error;

        setCurrentStep(3);
      } catch (err: any) {
        toast.error(err.message || "Failed to save profile");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 3: Create service
    if (currentStep === 3) {
      if (skipService) {
        await completeOnboarding();
        return;
      }

      if (!user?.id) {
        toast.error("Session missing. Please login again.");
        navigate("/auth");
        return;
      }

      if (!service.title || !service.description || !service.category || !service.location || !service.price) {
        toast.error("Please fill in all required fields");
        return;
      }

      const priceNum = Number(service.price);
      const durationNum = Number(service.duration_minutes);
      const maxGuestsNum = Number(service.max_guests);

      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast.error("Price must be a valid number");
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.from("services").insert({
          guide_id: user.id,
          title: service.title.trim(),
          description: service.description.trim(),
          category: service.category,
          location: service.location.trim(),
          price: priceNum,
          currency: "USD",
          duration_minutes: Number.isFinite(durationNum) && durationNum > 0 ? durationNum : 60,
          max_guests: Number.isFinite(maxGuestsNum) && maxGuestsNum > 0 ? maxGuestsNum : 4,
          type: "live",
          status: "draft",
          image_urls: [],
          languages: profile.languages_spoken || [],
          whats_included: [],
          requirements: [],
          // coordinates_lat: service.coordinates_lat,
          // coordinates_lng: service.coordinates_lng,
        });

        if (error) throw error;

        await completeOnboarding();
      } catch (err: any) {
        toast.error(err.message || "Failed to create service");
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const handleBack = () => setCurrentStep((p) => Math.max(1, p - 1));
  const goToDashboard = () => navigate("/guide/dashboard");

  const progress = useMemo(() => (currentStep / STEPS.length) * 100, [currentStep]);

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Globe2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <img src={logo} alt="ZeoChat" className="h-8" />
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Welcome to ZeoChat!</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                You're about to join a community of amazing guides sharing unique experiences with explorers worldwide.
              </p>
            </div>

            <Button size="lg" onClick={handleNext} className="gap-2">
              Let's Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Create Your Profile</h1>
              <p className="text-muted-foreground">Help explorers get to know you better</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={profile.full_name}
                    onChange={(e) => handleProfileChange("full_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guide_title">Professional Title *</Label>
                  <Input
                    id="guide_title"
                    placeholder="e.g., Local Food Expert"
                    value={profile.guide_title}
                    onChange={(e) => handleProfileChange("guide_title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About You *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Share your story..."
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                  />
                </div>

                {/* ✅ Profile Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      className="pl-10"
                      placeholder="Type location (e.g., Karachi)"
                      value={profile.location}
                      onChange={(e) => handleProfileChange("location", e.target.value)}
                      onFocus={() => setShowProfileLoc(profileLocSuggestions.length > 0)}
                      autoComplete="off"
                    />

                    {showProfileLoc && profileLocSuggestions.length > 0 && (
                      <div className="absolute z-[9999] w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {profileLocSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onSelectProfileLocation(s);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm border-b border-border last:border-0"
                          >
                            {s.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <Select onValueChange={addLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add languages" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter((l) => !profile.languages_spoken.includes(l)).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {profile.languages_spoken.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.languages_spoken.map((lang) => (
                        <Badge key={lang} variant="secondary" className="gap-1">
                          {lang}
                          <button type="button" onClick={() => removeLanguage(lang)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading} className="gap-2">
                {loading ? "Saving..." : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Create Your First Service</h1>
              <p className="text-muted-foreground">Create a draft service</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service_title">Service Title *</Label>
                  <Input
                    id="service_title"
                    placeholder="e.g., Food Tour"
                    value={service.title}
                    onChange={(e) => handleServiceChange("title", e.target.value)}
                    disabled={skipService}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_description">Description *</Label>
                  <Textarea
                    id="service_description"
                    placeholder="Describe your service..."
                    rows={4}
                    value={service.description}
                    onChange={(e) => handleServiceChange("description", e.target.value)}
                    disabled={skipService}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={service.category}
                      onValueChange={(v) => handleServiceChange("category", v)}
                      disabled={skipService}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_VALUES.map((val) => (
                          <SelectItem key={val} value={val}>
                            {CATEGORY_LABELS[val]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ✅ Service Location */}
                  <div className="space-y-2">
                    <Label htmlFor="service_location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="service_location"
                        className="pl-10"
                        placeholder="Type location (e.g., Lahore)"
                        value={service.location}
                        onChange={(e) => handleServiceChange("location", e.target.value)}
                        disabled={skipService}
                        onFocus={() => setShowServiceLoc(serviceLocSuggestions.length > 0)}
                        autoComplete="off"
                      />

                      {showServiceLoc && serviceLocSuggestions.length > 0 && !skipService && (
                        <div className="absolute z-[9999] w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                          {serviceLocSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onSelectServiceLocation(s);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm border-b border-border last:border-0"
                            >
                              {s.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="50"
                      value={service.price}
                      onChange={(e) => handleServiceChange("price", e.target.value)}
                      disabled={skipService}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select
                      value={service.duration_minutes}
                      onValueChange={(v) => handleServiceChange("duration_minutes", v)}
                      disabled={skipService}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Guests</Label>
                    <Select
                      value={service.max_guests}
                      onValueChange={(v) => handleServiceChange("max_guests", v)}
                      disabled={skipService}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipService}
                      onChange={(e) => setSkipService(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      Skip for now – I'll create my first service later
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading} className="gap-2">
                {loading ? "Saving..." : skipService ? "Complete Setup" : "Create & Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold">You're All Set!</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your guide profile is ready.
              </p>
            </div>

            <Button size="lg" onClick={goToDashboard} className="gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default GuideOnboarding;
