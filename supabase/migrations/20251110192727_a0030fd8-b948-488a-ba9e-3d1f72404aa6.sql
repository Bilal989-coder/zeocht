-- Add coordinate fields to profiles table for guide location mapping
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coordinates_lat numeric,
ADD COLUMN IF NOT EXISTS coordinates_lng numeric;

-- Drop and recreate public_profiles view to include coordinates
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
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