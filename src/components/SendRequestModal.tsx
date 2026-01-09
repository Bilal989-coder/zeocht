import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface Service {
  id: string;
  title: string;
  max_guests: number;
}

interface SendRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideId: string;
  guideName: string;
  guideAvatar: string | null;
  services: Service[];
}

const SendRequestModal = ({
  open,
  onOpenChange,
  guideId,
  guideName,
  guideAvatar,
  services,
}: SendRequestModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: "",
    date: undefined as Date | undefined,
    time: "",
    guestCount: 1,
    budget: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to send a request");
      navigate("/auth");
      return;
    }

    if (!formData.serviceId) {
      toast.error("Please select a service");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    if (!formData.message || formData.message.length < 20) {
      toast.error("Please write a message (at least 20 characters)");
      return;
    }

    if (formData.guestCount < 1) {
      toast.error("Guest count must be at least 1");
      return;
    }

    const selectedService = services.find(s => s.id === formData.serviceId);
    if (selectedService && formData.guestCount > selectedService.max_guests) {
      toast.error(`Maximum ${selectedService.max_guests} guests allowed for this service`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .insert({
          explorer_id: user.id,
          guide_id: guideId,
          service_id: formData.serviceId,
          preferred_date: format(formData.date, "yyyy-MM-dd"),
          preferred_time: formData.time || null,
          guests_count: formData.guestCount,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          message: formData.message,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Request sent successfully!");
      onOpenChange(false);
      navigate("/explorer/requests");
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = [
    "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Request</DialogTitle>
        </DialogHeader>

        {/* Guide Info */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Avatar className="h-12 w-12">
            <AvatarImage src={guideAvatar || undefined} />
            <AvatarFallback>{guideName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{guideName}</p>
            <p className="text-sm text-muted-foreground">Guide</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Select Service *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Preferred Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time (Optional)</Label>
            <Select
              value={formData.time}
              onValueChange={(value) => setFormData({ ...formData, time: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests *</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter your budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder="Tell the guide about your request... (min 20 characters)"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.message.length} / 20 characters minimum
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendRequestModal;
