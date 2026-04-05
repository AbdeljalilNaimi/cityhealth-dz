-- Update handle_new_citizen trigger to also capture phone from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_citizen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.citizen_profiles (user_id, email, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
