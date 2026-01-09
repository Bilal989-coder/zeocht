-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create livestream sessions" ON public.livestream_sessions;

-- Create a restrictive INSERT policy that only allows booking participants to create sessions
CREATE POLICY "Booking participants can create livestream sessions"
ON public.livestream_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = booking_id
    AND (bookings.explorer_id = auth.uid() OR bookings.guide_id = auth.uid())
  )
);