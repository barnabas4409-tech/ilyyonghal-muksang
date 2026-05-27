-- ============================================================
-- 일용할묵상 Supabase 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================================

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_status text CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,
  push_enabled boolean DEFAULT false,
  push_token text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- daily_readings
CREATE TABLE IF NOT EXISTS public.daily_readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date UNIQUE NOT NULL,
  title text NOT NULL,
  passage text NOT NULL,
  content text NOT NULL,
  reflection_question text NOT NULL,
  illustration_type text DEFAULT 'spring' CHECK (illustration_type IN ('dawn', 'night', 'spring')),
  liturgical_season text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily readings are public"
  ON public.daily_readings FOR SELECT
  USING (true);

-- reflections
CREATE TABLE IF NOT EXISTS public.reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  reading_id uuid REFERENCES public.daily_readings ON DELETE SET NULL,
  title text,
  content text NOT NULL,
  highlighted_sentence text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON public.reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON public.reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON public.reflections FOR DELETE
  USING (auth.uid() = user_id);

-- streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_reflection_date date
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);
