-- Drop the request_host_role function (no longer needed)
DROP FUNCTION IF EXISTS public.request_host_role();

-- Clean up users with multiple roles (keep the most recent role only)
DELETE FROM public.user_roles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.user_roles
  ORDER BY user_id, created_at DESC
);

-- Drop existing constraint and add new unique constraint on user_id only
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Update assign_default_role to respect signup role choice from metadata
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  selected_role app_role;
BEGIN
  -- Read role from user metadata (can be 'explorer', 'guide', or 'host')
  -- Map 'guide' to 'host' role
  selected_role := CASE 
    WHEN NEW.raw_user_meta_data->>'role' IN ('guide', 'host') THEN 'host'::app_role
    ELSE 'explorer'::app_role
  END;
  
  -- Insert the single selected role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;