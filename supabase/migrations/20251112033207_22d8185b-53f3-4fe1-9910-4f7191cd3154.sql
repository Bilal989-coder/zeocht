-- Allow anyone to view guide and host profiles (needed for public_profiles view)
CREATE POLICY "Anyone can view guide and host profiles"
ON public.profiles
FOR SELECT
USING (user_type IN ('guide', 'host'));