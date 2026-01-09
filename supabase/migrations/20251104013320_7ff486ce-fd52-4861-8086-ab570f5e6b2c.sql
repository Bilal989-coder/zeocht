-- Fix 1: Restrict profiles table access and create public view
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a public view with only safe, non-sensitive fields for guide discovery
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
WHERE user_type IN ('host');

-- Create new restrictive policy: users can only view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow authenticated users to view the public view (no RLS needed on views by default)
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Fix 2: Remove role self-assignment vulnerability
-- Drop the dangerous INSERT policy
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- Create a trigger to automatically assign 'explorer' role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'explorer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_user_created_assign_role ON auth.users;
CREATE TRIGGER on_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- Create a secure function for users to request host role
CREATE OR REPLACE FUNCTION public.request_host_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that profile is complete
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND full_name IS NOT NULL 
    AND phone IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Profile must be complete with name and phone number';
  END IF;
  
  -- Check if user already has host role
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'host'::app_role
  ) THEN
    RAISE EXCEPTION 'You already have the host role';
  END IF;
  
  -- Add host role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'host'::app_role);
END;
$$;