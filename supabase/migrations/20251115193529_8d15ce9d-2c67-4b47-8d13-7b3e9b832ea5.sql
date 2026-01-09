-- Create livestream_sessions table
CREATE TABLE IF NOT EXISTS public.livestream_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL UNIQUE,
  explorer_token TEXT,
  guide_token TEXT,
  session_start_time TIMESTAMP WITH TIME ZONE,
  session_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.livestream_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own livestream sessions"
  ON public.livestream_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = livestream_sessions.booking_id
      AND (bookings.explorer_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

CREATE POLICY "System can create livestream sessions"
  ON public.livestream_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update session status"
  ON public.livestream_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = livestream_sessions.booking_id
      AND (bookings.explorer_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_booking_id ON public.livestream_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_livestream_sessions_status ON public.livestream_sessions(status);

-- Add trigger for updated_at
CREATE TRIGGER update_livestream_sessions_updated_at
  BEFORE UPDATE ON public.livestream_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();