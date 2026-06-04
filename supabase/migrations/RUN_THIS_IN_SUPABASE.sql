-- ================================================
-- 일용할묵상 — Supabase SQL Editor에 전체 붙여넣기
-- ================================================

-- 1. profiles: 닉네임 필드
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name      text,
  ADD COLUMN IF NOT EXISTS handle            text,
  ADD COLUMN IF NOT EXISTS handle_changed_at timestamptz;

-- 2. profiles: 온보딩 완료 추적
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- 기존 사용자는 온보딩 완료로 처리 (새 사용자만 온보딩 화면 보도록)
UPDATE public.profiles
  SET onboarded_at = now()
  WHERE onboarded_at IS NULL;

-- 3. profiles: 폰트 크기
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium'
  CHECK (font_size IN ('small', 'medium', 'large'));

-- 4. profiles: 레퍼럴
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by   text;

-- 기존 사용자에게 레퍼럴 코드 부여
UPDATE public.profiles
  SET referral_code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 6))
  WHERE referral_code IS NULL;

-- referral_code 유니크 제약
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_referral_code_unique') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_referral_code_unique UNIQUE (referral_code);
  END IF;
END $$;

-- 5. reflections: 공유 관련 필드
ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden    boolean DEFAULT false;

-- 6. 스티커 반응 테이블
CREATE TABLE IF NOT EXISTS public.reflection_reactions (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  reflection_id uuid        NOT NULL REFERENCES public.reflections(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id),
  sticker       text        NOT NULL CHECK (sticker IN ('pray', 'sprout', 'heart')),
  created_at    timestamptz DEFAULT now(),
  UNIQUE(reflection_id, user_id)
);

ALTER TABLE public.reflection_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reflection_reactions' AND policyname='Authenticated users read reactions') THEN
    CREATE POLICY "Authenticated users read reactions"
      ON public.reflection_reactions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reflection_reactions' AND policyname='Users insert own reactions') THEN
    CREATE POLICY "Users insert own reactions"
      ON public.reflection_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reflection_reactions' AND policyname='Users delete own reactions') THEN
    CREATE POLICY "Users delete own reactions"
      ON public.reflection_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. reflections 공개 묵상 RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reflections' AND policyname='Public reflections visible to authenticated') THEN
    EXECUTE $p$
      CREATE POLICY "Public reflections visible to authenticated"
        ON public.reflections FOR SELECT TO authenticated
        USING (is_public = true AND is_hidden = false OR auth.uid() = user_id)
    $p$;
  END IF;
END $$;

-- 8. Stripe 테이블
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_id  text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='stripe_customers' AND policyname='Users read own stripe customer') THEN
    CREATE POLICY "Users read own stripe customer"
      ON public.stripe_customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id         text PRIMARY KEY,
  type       text NOT NULL,
  payload    jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 9. 레퍼럴 이벤트 로그
CREATE TABLE IF NOT EXISTS public.referral_events (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_code text NOT NULL,
  referred_user uuid REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
