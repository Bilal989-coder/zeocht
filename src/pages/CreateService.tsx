import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import MediaUploadZone from "@/components/MediaUploadZone";
import { ArrowLeft, ArrowRight, Check, DollarSign, Film, MapPin, Plus, Tv, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";

type LocationSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const CreateService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { createService, updateService } = useServices();
  const { uploadFiles, uploading, uploadProgress } = useMediaUpload();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Location dropdown state
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    type: "live" as "live" | "recorded" | "both",
    title: "",
    category: "",
    mediaFiles: [] as File[],
    mediaUrls: [] as string[],
    location: "",
    coordinates_lat: null as number | null,
    coordinates_lng: null as number | null,
    description: "",
    duration_minutes: 60,
    languages: [] as string[],
    max_guests: 10,
    price: 0,
    currency: "USD",
    whats_included: [] as string[],
    requirements: [] as string[],
  });

  const [tempIncluded, setTempIncluded] = useState("");
  const [tempRequirement, setTempRequirement] = useState("");

  const categoryValues = [
    "food", "culture", "adventure", "art", "nature",
    "history", "sports", "music", "wellness", "shopping",
  ];

  const categoryLabels: Record<string, string> = {
    food: t("categories.food") || "Food & Drink",
    culture: t("categories.culture") || "Culture & History",
    adventure: t("categories.adventure") || "Nature & Adventure",
    art: t("categories.art") || "Art & Photography",
    nature: t("categories.nature") || "Nature & Outdoor",
    history: t("categories.history") || "History & Heritage",
    sports: t("categories.sports") || "Sports & Fitness",
    music: t("categories.music") || "Music & Entertainment",
    wellness: t("categories.wellness") || "Wellness & Spirituality",
    shopping: t("categories.shopping") || "Shopping & Markets",
  };

  const languageOptions = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese",
    "Japanese", "Chinese", "Arabic", "Hindi", "Russian", "Korean",
  ];

  const steps = [
    { number: 1, title: t("service.step1") || "Type & Info" },
    { number: 2, title: t("service.step2") || "Media Upload" },
    { number: 3, title: t("service.step3") || "Location & Details" },
    { number: 4, title: t("service.step4") || "Pricing & Extras" },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.type) newErrors.type = "Service type is required";
      if (!formData.title || formData.title.trim().length < 10) newErrors.title = "Title must be at least 10 characters";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2) {
      if (formData.mediaFiles.length === 0 && formData.mediaUrls.length === 0) {
        newErrors.media = "At least 1 image or video is required";
      }
    }

    if (step === 3) {
      if (!formData.location || formData.location.trim().length < 3) newErrors.location = "Location is required";
      if (!formData.description || formData.description.trim().length < 100) {
        newErrors.description = "Description must be at least 100 characters";
      }
      if (formData.duration_minutes < 15 || formData.duration_minutes > 480) {
        newErrors.duration = "Duration must be between 15 and 480 minutes";
      }
      if (formData.languages.length === 0) newErrors.languages = "At least 1 language is required";
    }

    if (step === 4) {
      if (formData.price < 5) newErrors.price = "Price must be at least $5";
      if (formData.whats_included.length === 0) newErrors.whats_included = "At least 1 item is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // ✅ Draft/Active FIX: use mode string, NOT boolean
  const handleSubmit = async (mode: "draft" | "active") => {
    if (!validateStep(4)) return;
    if (!user?.id) {
      toast({ title: "Session missing", description: "Please login again", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls = [...formData.mediaUrls];

      // upload new files
      if (formData.mediaFiles.length > 0) {
        const tempServiceId = id || crypto.randomUUID();
        const uploadedUrls = await uploadFiles(formData.mediaFiles, user.id, tempServiceId);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category,
        price: Number(formData.price),
        currency: formData.currency,
        duration_minutes: Number(formData.duration_minutes) || 60,
        max_guests: Number(formData.max_guests) || 10,
        type: formData.type,
        status: mode, // ✅ KEY FIX
        image_urls: imageUrls,
        coordinates_lat: formData.coordinates_lat,
        coordinates_lng: formData.coordinates_lng,
        languages: formData.languages,
        whats_included: formData.whats_included,
        requirements: formData.requirements,
      };

      console.log("SUBMIT MODE:", mode);
      console.log("SENDING STATUS:", payload.status);

      const result = id ? await updateService(id, payload) : await createService(payload);

      if (result.error) throw new Error(result.error);

      toast({ title: mode === "draft" ? "Draft saved!" : "Service published successfully!" });
      navigate("/guide/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service. Please check all fields and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addIncludedItem = () => {
    if (tempIncluded.trim() && formData.whats_included.length < 10) {
      setFormData((prev) => ({ ...prev, whats_included: [...prev.whats_included, tempIncluded.trim()] }));
      setTempIncluded("");
    }
  };

  const addRequirement = () => {
    if (tempRequirement.trim() && formData.requirements.length < 10) {
      setFormData((prev) => ({ ...prev, requirements: [...prev.requirements, tempRequirement.trim()] }));
      setTempRequirement("");
    }
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  // ✅ Location suggestions with debounce (WORKING)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      const q = formData.location?.trim() || "";
      if (q.length < 3) {
        setLocationSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const encoded = encodeURIComponent(q);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=6`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          setLocationSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? (data as LocationSuggestion[]) : [];
        setLocationSuggestions(list);
        setShowSuggestions(list.length > 0);
      } catch (e) {
        console.error("Location fetch error:", e);
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [formData.location]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleLocationSelect = (s: LocationSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      location: s.display_name,
      coordinates_lat: Number(s.lat),
      coordinates_lng: Number(s.lon),
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/guide/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{id ? "Edit Service" : "Create New Service"}</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep === step.number
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.number
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <span className="text-sm mt-2 text-center hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("h-1 flex-1 mx-2 transition-colors", currentStep > step.number ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg p-6 shadow-sm overflow-visible">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Service Type</Label>

                <RadioGroup value={formData.type} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}>
                  <Card className={cn("cursor-pointer transition-colors", formData.type === "recorded" && "border-primary")}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <RadioGroupItem value="recorded" id="recorded" />
                      <label htmlFor="recorded" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Recorded Video Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sell pre-recorded content that explorers can watch anytime
                        </p>
                      </label>
                    </CardContent>
                  </Card>

                  <Card className={cn("cursor-pointer transition-colors", formData.type === "live" && "border-primary")}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <RadioGroupItem value="live" id="live" />
                      <label htmlFor="live" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Tv className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Live Virtual Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Host live tours with real-time interaction</p>
                      </label>
                    </CardContent>
                  </Card>

                  <Card className={cn("cursor-pointer transition-colors", formData.type === "both" && "border-primary")}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <RadioGroupItem value="both" id="both" />
                      <label htmlFor="both" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Film className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Both Options</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Offer both recorded and live sessions</p>
                      </label>
                    </CardContent>
                  </Card>
                </RadioGroup>

                {errors.type && <p className="text-sm text-destructive mt-2">{errors.type}</p>}
              </div>

              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Virtual Cooking Class in Tuscany"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground mt-1">{formData.title.length}/100 characters</p>
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {categoryLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Upload Images & Videos</Label>
                <p className="text-sm text-muted-foreground mb-4">Upload up to 10 items. First one is cover.</p>

                <MediaUploadZone
                  files={formData.mediaFiles}
                  existingUrls={formData.mediaUrls}
                  onFilesChange={(files) => setFormData((prev) => ({ ...prev, mediaFiles: files }))}
                  onUrlsChange={(urls) => setFormData((prev) => ({ ...prev, mediaUrls: urls }))}
                  maxFiles={10}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                />

                {errors.media && <p className="text-sm text-destructive mt-2">{errors.media}</p>}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* ✅ Location with working dropdown */}
              <div className="relative overflow-visible" ref={containerRef}>
                <Label htmlFor="location">Location *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Santorini, Greece"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    onFocus={() => setShowSuggestions(locationSuggestions.length > 0)}
                    className="pl-10"
                    autoComplete="off"
                  />

                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-[9999] mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {locationSuggestions.map((s, index) => (
                        <button
                          key={`${s.lat}-${s.lon}-${index}`}
                          type="button"
                          onMouseDown={(e) => {
                            // ✅ IMPORTANT: prevent blur closing dropdown
                            e.preventDefault();
                            handleLocationSelect(s);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors text-sm border-b border-border last:border-0"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{s.display_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your experience in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-sm text-muted-foreground mt-1">{formData.description.length}/1000 characters</p>
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    max={480}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                  />
                  {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <Label htmlFor="max_guests">Max Guests *</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    min={1}
                    max={50}
                    value={formData.max_guests}
                    onChange={(e) => setFormData((prev) => ({ ...prev, max_guests: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Languages Offered *</Label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <Badge
                      key={lang}
                      variant={formData.languages.includes(lang) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
                {errors.languages && <p className="text-sm text-destructive mt-2">{errors.languages}</p>}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={5}
                    step={0.01}
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="pl-10"
                  />
                </div>
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label>What's Included *</Label>
                <div className="space-y-2">
                  {formData.whats_included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex-1 justify-between">
                        {item}
                        <X
                          className="h-3 w-3 ml-2 cursor-pointer"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              whats_included: prev.whats_included.filter((_, i) => i !== index),
                            }))
                          }
                        />
                      </Badge>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., HD video streaming"
                      value={tempIncluded}
                      onChange={(e) => setTempIncluded(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIncludedItem();
                        }
                      }}
                    />
                    <Button type="button" onClick={addIncludedItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {errors.whats_included && <p className="text-sm text-destructive mt-1">{errors.whats_included}</p>}
              </div>

              <div>
                <Label>Requirements (Optional)</Label>
                <div className="space-y-2">
                  {formData.requirements.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-1 justify-between">
                        {item}
                        <X
                          className="h-3 w-3 ml-2 cursor-pointer"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              requirements: prev.requirements.filter((_, i) => i !== index),
                            }))
                          }
                        />
                      </Badge>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Stable internet connection"
                      value={tempRequirement}
                      onChange={(e) => setTempRequirement(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                    />
                    <Button type="button" onClick={addRequirement} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ✅ Publish Status Removed → now only buttons control draft/active */}
              <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                <b>Tip:</b> “Save as Draft” se listing public nahi hogi. “Publish Now” se public hogi.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit("draft")}
                  disabled={submitting || uploading}
                >
                  {submitting ? "Saving..." : "Save as Draft"}
                </Button>

                <Button
                  type="button"
                  onClick={() => handleSubmit("active")}
                  disabled={submitting || uploading}
                >
                  {submitting || uploading ? "Processing..." : "Publish Now"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
