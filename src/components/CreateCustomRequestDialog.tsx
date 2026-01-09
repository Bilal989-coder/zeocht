import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, CalendarIcon, Plus, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateCustomRequestDialogProps {
  onRequestCreated: () => void;
  onCreateRequest: (data: any, isDraft: boolean) => Promise<any>;
}

export const CreateCustomRequestDialog = ({
  onRequestCreated,
  onCreateRequest,
}: CreateCustomRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    coordinates_lat: null as number | null,
    coordinates_lng: null as number | null,
    preferred_date: "",
    duration_minutes: "",
    budget: "",
    guests_count: "1",
    category: "",
    message: "",
  });

  const [locationSuggestions, setLocationSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch location suggestions (OpenStreetMap Nominatim)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.location && formData.location.trim().length > 2) {
        try {
          const encodedLocation = encodeURIComponent(formData.location.trim());
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=5`
          );

          if (response.ok) {
            const data = await response.json();
            setLocationSuggestions(data);
            setShowSuggestions(Array.isArray(data) && data.length > 0);
          } else {
            setLocationSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
          setLocationSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.location]);

  const handleLocationSelect = (suggestion: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      location: suggestion.display_name,
      coordinates_lat: parseFloat(suggestion.lat),
      coordinates_lng: parseFloat(suggestion.lon),
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    setErrors((prev) => ({ ...prev, location: "" }));
  };

  // ✅ Updated: async validate + auto-resolve coords if user didn't click suggestion
  const validateForm = async (isDraft: boolean) => {
    const newErrors: Record<string, string> = {};

    let resolvedLocation = formData.location?.trim() || "";
    let resolvedLat = formData.coordinates_lat;
    let resolvedLng = formData.coordinates_lng;

    // Auto resolve coords (mobile pe click miss ho jata hai often)
    if (!isDraft && resolvedLocation && (!resolvedLat || !resolvedLng)) {
      try {
        const encodedLocation = encodeURIComponent(resolvedLocation);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            resolvedLocation = first.display_name || resolvedLocation;
            resolvedLat = first.lat ? parseFloat(first.lat) : resolvedLat;
            resolvedLng = first.lon ? parseFloat(first.lon) : resolvedLng;

            // update UI too
            setFormData((prev) => ({
              ...prev,
              location: resolvedLocation,
              coordinates_lat: resolvedLat ?? null,
              coordinates_lng: resolvedLng ?? null,
            }));
          }
        }
      } catch (error) {
        console.error("Location auto-resolve failed:", error);
      }
    }

    if (!isDraft) {
      if (!formData.title || formData.title.length < 10) {
        newErrors.title = "Title must be at least 10 characters";
      }
      if (formData.title.length > 100) {
        newErrors.title = "Title must be less than 100 characters";
      }

      if (!resolvedLocation) {
        newErrors.location = "Location is required";
      } else if (!resolvedLat || !resolvedLng) {
        newErrors.location =
          "Please select a location from suggestions (or try a different city/area)";
      }

      if (!date) {
        newErrors.date = "Date is required";
      }

      if (!formData.duration_minutes) {
        newErrors.duration = "Duration is required";
      }

      if (!formData.category) {
        newErrors.category = "Category is required";
      }

      if (!formData.message || formData.message.length < 20) {
        newErrors.message = "Description must be at least 20 characters";
      }

      if (formData.message.length > 1000) {
        newErrors.message = "Description must be less than 1000 characters";
      }
    }

    // Draft: light validation
    if (isDraft) {
      if (formData.title && formData.title.length > 100) {
        newErrors.title = "Title must be less than 100 characters";
      }
      if (formData.message && formData.message.length > 1000) {
        newErrors.message = "Description must be less than 1000 characters";
      }
    }

    setErrors(newErrors);

    return {
      ok: Object.keys(newErrors).length === 0,
      location: resolvedLocation,
      coordinates_lat: resolvedLat,
      coordinates_lng: resolvedLng,
    };
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      coordinates_lat: null,
      coordinates_lng: null,
      preferred_date: "",
      duration_minutes: "",
      budget: "",
      guests_count: "1",
      category: "",
      message: "",
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setDate(undefined);
    setErrors({});
  };

  const handleSubmit = async (isDraft: boolean) => {
    const validation = await validateForm(isDraft);

    if (!validation.ok) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        title: formData.title,
        location: validation.location,
        coordinates_lat: validation.coordinates_lat,
        coordinates_lng: validation.coordinates_lng,
        preferred_date: date ? format(date, "yyyy-MM-dd") : "",
        duration_minutes: parseInt(formData.duration_minutes),
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        guests_count: parseInt(formData.guests_count),
        category: formData.category,
        message: formData.message,
        request_type: "custom_request",
        is_draft: isDraft,
        status: isDraft ? "draft" : "pending",
      };

      const { error } = await onCreateRequest(requestData, isDraft);
      if (error) throw new Error(error);

      toast({
        title: isDraft ? "Saved as Draft" : "Request Submitted",
        description: isDraft
          ? "Your request has been saved as a draft"
          : "Your custom tour request has been submitted successfully",
      });

      setOpen(false);
      resetForm();
      onRequestCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Request
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Tour Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., 3-day cultural tour in Paris with local food"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          {/* ✅ Location (FIXED) */}
          <div className="relative">
            <Label htmlFor="location">Location *</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Paris, France"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                    coordinates_lat: null,
                    coordinates_lng: null,
                  }))
                }
                onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 450)}
                className="pl-10"
                autoComplete="off"
              />

              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault(); // ✅ fires before blur, fixes mobile
                        handleLocationSelect(suggestion);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors text-sm border-b border-border last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{suggestion.display_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
          </div>

          {/* Date and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preferred Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
            </div>

            <div>
  <Label>Duration *</Label>
  <Select
    value={formData.duration_minutes}
    onValueChange={(value) =>
      setFormData((prev) => ({ ...prev, duration_minutes: value }))
    }
  >
    <SelectTrigger className="mt-1">
      <SelectValue placeholder="Select duration" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="30">30 minutes</SelectItem>
      <SelectItem value="60">1 hour</SelectItem>
      <SelectItem value="90">1 hour 30 minutes</SelectItem>
      <SelectItem value="120">2 hours</SelectItem>
      <SelectItem value="150">2 hours 30 minutes</SelectItem>
      <SelectItem value="180">3 hours</SelectItem>
      <SelectItem value="240">4 hours</SelectItem>
      <SelectItem value="300">5 hours</SelectItem>
      <SelectItem value="360">6 hours</SelectItem>
      <SelectItem value="480">8 hours</SelectItem>
    </SelectContent>
  </Select>

  {errors.duration && (
    <p className="text-sm text-destructive mt-1">{errors.duration}</p>
  )}
</div>

          </div>

          {/* Budget + Guests */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget (optional)</Label>
              <Input
                id="budget"
                placeholder="e.g., 200"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="guests">Guests *</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                value={formData.guests_count}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, guests_count: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="city">City</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Description *</Label>
            <Textarea
              id="message"
              placeholder="Describe your custom tour requirements..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              className="mt-1 min-h-[120px]"
            />
            {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            <Button onClick={() => handleSubmit(false)} disabled={loading} className="gap-2">
              <Plus className="h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
