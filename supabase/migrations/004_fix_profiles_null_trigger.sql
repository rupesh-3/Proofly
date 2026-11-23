-- ============================================================
-- Migration: Add missing profile columns, backfill NULLs, update trigger
-- ============================================================

-- 1. Safely add any missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college text DEFAULT 'Campus University';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text DEFAULT 'Computer Science & AI';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch int DEFAULT 2026;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline text DEFAULT 'Verified Scholar';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- 2. Populate all existing NULL rows
UPDATE public.profiles
SET 
  department = COALESCE(NULLIF(department, ''), 'Computer Science & AI'),
  batch      = COALESCE(batch, 2026),
  college    = COALESCE(NULLIF(college, ''), 'Campus University'),
  headline   = COALESCE(NULLIF(headline, ''), 'Verified Scholar'),
  handle     = COALESCE(handle, lower(regexp_replace(full_name, '[^a-zA-Z0-9]', '', 'g'))),
  is_public  = true
WHERE department IS NULL OR is_public IS NULL OR is_public = false OR college IS NULL;

-- 3. Upgrade trigger for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    department,
    batch,
    college,
    headline,
    is_public
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & AI'),
    COALESCE((new.raw_user_meta_data->>'batch')::int, 2026),
    COALESCE(new.raw_user_meta_data->>'college', 'Campus University'),
    COALESCE(new.raw_user_meta_data->>'headline', 'Verified Scholar'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name   = EXCLUDED.full_name,
    role        = EXCLUDED.role,
    department  = COALESCE(EXCLUDED.department, profiles.department),
    batch       = COALESCE(EXCLUDED.batch, profiles.batch),
    college     = COALESCE(EXCLUDED.college, profiles.college),
    is_public   = true;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read public profiles" ON public.profiles;
CREATE POLICY "Anyone can read public profiles"
  ON public.profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());

DROP POLICY IF EXISTS "User can update own profile" ON public.profiles;
CREATE POLICY "User can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
