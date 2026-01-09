-- Create a secure function for users to switch their own role
CREATE OR REPLACE FUNCTION public.switch_user_role(new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user_roles table
  UPDATE public.user_roles
  SET role = new_role
  WHERE user_id = auth.uid();

  -- Update profiles table (map host -> guide for user_type)
  UPDATE public.profiles
  SET user_type = CASE 
    WHEN new_role = 'host' THEN 'guide'
    ELSE 'explorer'
  END
  WHERE id = auth.uid();
END;
$$;