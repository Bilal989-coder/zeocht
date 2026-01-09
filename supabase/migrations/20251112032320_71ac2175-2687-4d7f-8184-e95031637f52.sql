-- Fix the SECURITY DEFINER warning on public_profiles view
-- Update to use SECURITY INVOKER instead

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  coordinates_lat,
  coordinates_lng,
  guide_title,
  languages_spoken,
  user_type,
  verification_status,
  response_time,
  response_rate,
  followers_count,
  following_count,
  total_bookings
FROM public.profiles
WHERE user_type IN ('guide','host');

-- Ensure permissions are granted
GRANT SELECT ON public.public_profiles TO authenticated, anon;