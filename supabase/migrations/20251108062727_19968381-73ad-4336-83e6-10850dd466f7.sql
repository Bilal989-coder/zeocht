-- Update the handle_new_user function to properly set user_type based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the role from user metadata (can be 'explorer', 'guide', or 'host')
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'explorer');
  
  -- Map 'guide' or 'host' to 'guide' user_type, otherwise 'explorer'
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN user_role IN ('guide', 'host') THEN 'guide'
      ELSE 'explorer'
    END
  );
  RETURN NEW;
END;
$$;

-- Also update the existing user to be a guide
UPDATE profiles 
SET user_type = 'guide' 
WHERE id = 'a7996c7d-de62-4624-a0e1-d33f30a00107';