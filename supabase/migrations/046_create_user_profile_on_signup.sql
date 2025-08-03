-- Drop the existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    -- Safely access the 'username' from the raw_user_meta_data JSONB object.
    -- The ->> operator extracts the value as text.
    -- Use COALESCE to provide a fallback value if 'username' is null or missing.
    -- The fallback concatenates the part of the email before the '@' with the first 8 chars of the user's ID.
    COALESCE(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
    ),
    -- Safely access 'first_name', fallback to an empty string if not provided.
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    -- Safely access 'last_name', fallback to an empty string if not provided.
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    -- Safely access 'role', fallback to 'user' if not provided.
    (COALESCE(new.raw_user_meta_data ->> 'role', 'user'))::user_role
  );
  RETURN new;
END;
$$;

-- Create the trigger that fires the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comments for clarity
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles the creation of a public user profile upon new user signup in Supabase Auth.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'After a new user signs up, this trigger creates a corresponding profile in the public.users table.';
