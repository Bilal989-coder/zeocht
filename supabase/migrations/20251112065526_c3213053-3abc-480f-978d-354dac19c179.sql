-- Create table for guide availability settings
CREATE TABLE IF NOT EXISTS public.guide_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guide_id, day_of_week, start_time)
);

-- Create table for guide pricing and booking settings
CREATE TABLE IF NOT EXISTS public.guide_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'time_based')),
  fixed_duration INTEGER CHECK (fixed_duration IN (15, 30, 45, 60)), -- minutes
  hourly_rate NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  max_daily_bookings INTEGER DEFAULT 5,
  buffer_time_minutes INTEGER DEFAULT 15,
  advance_booking_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guide_availability
CREATE POLICY "Guides can view their own availability"
  ON public.guide_availability FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can insert their own availability"
  ON public.guide_availability FOR INSERT
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guides can update their own availability"
  ON public.guide_availability FOR UPDATE
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can delete their own availability"
  ON public.guide_availability FOR DELETE
  USING (auth.uid() = guide_id);

CREATE POLICY "Anyone can view active guide availability"
  ON public.guide_availability FOR SELECT
  USING (is_available = true);

-- RLS Policies for guide_settings
CREATE POLICY "Guides can view their own settings"
  ON public.guide_settings FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can insert their own settings"
  ON public.guide_settings FOR INSERT
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guides can update their own settings"
  ON public.guide_settings FOR UPDATE
  USING (auth.uid() = guide_id);

CREATE POLICY "Anyone can view guide settings"
  ON public.guide_settings FOR SELECT
  USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_guide_availability_updated_at
  BEFORE UPDATE ON public.guide_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guide_settings_updated_at
  BEFORE UPDATE ON public.guide_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();