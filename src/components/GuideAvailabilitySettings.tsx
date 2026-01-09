import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Clock, DollarSign, Calendar, Users } from "lucide-react";

interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Settings {
  pricing_type: "fixed" | "time_based";
  fixed_duration: number | null;
  hourly_rate: number | null;
  currency: string;
  max_daily_bookings: number;
  buffer_time_minutes: number;
  advance_booking_days: number;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DURATIONS = [15, 30, 45, 60];

export function GuideAvailabilitySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [settings, setSettings] = useState<Settings>({
    pricing_type: "fixed",
    fixed_duration: 60,
    hourly_rate: 50,
    currency: "USD",
    max_daily_bookings: 5,
    buffer_time_minutes: 15,
    advance_booking_days: 30,
  });
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [newSlot, setNewSlot] = useState({ start_time: "09:00", end_time: "17:00" });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings
      const { data: settingsData } = await supabase
        .from("guide_settings")
        .select("*")
        .eq("guide_id", user?.id)
        .single();

      if (settingsData) {
        setSettings({
          pricing_type: settingsData.pricing_type as "fixed" | "time_based",
          fixed_duration: settingsData.fixed_duration,
          hourly_rate: settingsData.hourly_rate,
          currency: settingsData.currency,
          max_daily_bookings: settingsData.max_daily_bookings,
          buffer_time_minutes: settingsData.buffer_time_minutes,
          advance_booking_days: settingsData.advance_booking_days,
        });
      }

      // Fetch time slots
      const { data: slotsData } = await supabase
        .from("guide_availability")
        .select("*")
        .eq("guide_id", user?.id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (slotsData) {
        setTimeSlots(slotsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("guide_settings")
        .upsert({
          guide_id: user?.id,
          ...settings,
        });

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const addTimeSlot = async () => {
    try {
      const daysToAdd = applyToAllDays ? [0, 1, 2, 3, 4, 5, 6] : [selectedDay];
      
      const slots = daysToAdd.map(day => ({
        guide_id: user?.id,
        day_of_week: day,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        is_available: true,
      }));

      const { error } = await supabase
        .from("guide_availability")
        .insert(slots);

      if (error) throw error;
      
      toast.success(applyToAllDays ? "Time slot added to all days" : "Time slot added");
      fetchData();
    } catch (error: any) {
      console.error("Error adding time slot:", error);
      if (error.code === '23505') {
        toast.error("This time slot already exists");
      } else {
        toast.error("Failed to add time slot");
      }
    }
  };

  const deleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from("guide_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Time slot deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("Failed to delete time slot");
    }
  };

  const toggleSlotAvailability = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("guide_availability")
        .update({ is_available: !currentState })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Failed to update availability");
    }
  };

  const getDaySlots = (day: number) => {
    return timeSlots.filter(slot => slot.day_of_week === day);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading availability settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground mb-2">Availability & Pricing</h2>
        <p className="text-muted-foreground">Set your availability schedule, pricing, and booking limits</p>
      </div>

      {/* Pricing Settings */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Pricing Settings</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select
                value={settings.pricing_type}
                onValueChange={(value: "fixed" | "time_based") =>
                  setSettings({ ...settings, pricing_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Duration</SelectItem>
                  <SelectItem value="time_based">Time Based (Hourly)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.pricing_type === "fixed" ? (
              <div className="space-y-2">
                <Label>Session Duration (minutes)</Label>
                <Select
                  value={settings.fixed_duration?.toString() || "60"}
                  onValueChange={(value) =>
                    setSettings({ ...settings, fixed_duration: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(duration => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Hourly Rate ({settings.currency})</Label>
                <Input
                  type="number"
                  value={settings.hourly_rate || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, hourly_rate: parseFloat(e.target.value) })
                  }
                  placeholder="50.00"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Max Daily Bookings</Label>
              <Input
                type="number"
                value={settings.max_daily_bookings}
                onChange={(e) =>
                  setSettings({ ...settings, max_daily_bookings: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Buffer Time (minutes)</Label>
              <Input
                type="number"
                value={settings.buffer_time_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, buffer_time_minutes: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full md:w-auto">
            {saving ? "Saving..." : "Save Pricing Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Time Slots Management */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Weekly Schedule</h3>
          </div>

          {/* Add Time Slot Form */}
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Switch
                checked={applyToAllDays}
                onCheckedChange={setApplyToAllDays}
              />
              <Label>Apply to all days</Label>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {!applyToAllDays && (
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    value={selectedDay.toString()}
                    onValueChange={(value) => setSelectedDay(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addTimeSlot} className="w-full">
                  Add Time Slot
                </Button>
              </div>
            </div>
          </div>

          {/* Display Time Slots by Day */}
          <div className="space-y-4 mt-6">
            {DAYS.map((day, dayIndex) => {
              const daySlots = getDaySlots(dayIndex);
              if (daySlots.length === 0) return null;

              return (
                <div key={dayIndex} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">{day}</h4>
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-background p-3 rounded border"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.is_available}
                            onCheckedChange={() => toggleSlotAvailability(slot.id, slot.is_available)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTimeSlot(slot.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {timeSlots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No time slots configured yet. Add your first availability slot above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
