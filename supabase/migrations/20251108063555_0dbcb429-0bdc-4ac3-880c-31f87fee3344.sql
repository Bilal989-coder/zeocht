-- Update public_profiles view to include both guide and host user types
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
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
WHERE user_type IN ('guide', 'host');