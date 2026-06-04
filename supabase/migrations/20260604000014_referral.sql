-- P2-4: 교역자/사용자 레퍼럴 추적

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by   text;

-- 기존 사용자에게 레퍼럴 코드 자동 부여
UPDATE public.profiles
  SET referral_code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 6))
  WHERE referral_code IS NULL;

-- 레퍼럴 이벤트 로그
CREATE TABLE IF NOT EXISTS public.referral_events (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_code text        NOT NULL,
  referred_user uuid        REFERENCES auth.users(id),
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
