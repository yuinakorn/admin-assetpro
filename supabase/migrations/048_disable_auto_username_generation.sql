-- Disable the auto username generation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to not generate auto username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only insert if the user doesn't already exist in the users table
  -- This prevents duplicate entries when we manually insert user data
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = new.id) THEN
    INSERT INTO public.users (id, email, username, first_name, last_name, role)
    VALUES (
      new.id,
      new.email,
      -- Use the username from raw_user_meta_data, don't generate fallback
      new.raw_user_meta_data ->> 'username',
      COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
      COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
      (COALESCE(new.raw_user_meta_data ->> 'role', 'user'))::user_role
    );
  END IF;
  RETURN new;
END;
$$;

-- Recreate the trigger but it will only run if user doesn't exist
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 