-- Drop the current overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view guide and host profiles" ON public.profiles;

-- Create a new policy that requires authentication to view guide/host profiles
CREATE POLICY "Authenticated users can view guide and host profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_type IN ('guide', 'host'));