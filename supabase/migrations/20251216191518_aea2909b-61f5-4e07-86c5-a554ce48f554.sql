-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view guide settings" ON public.guide_settings;