-- P0-1: 온보딩 완료 추적
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- 기존 사용자는 이미 온보딩 완료로 처리
UPDATE public.profiles
  SET onboarded_at = now()
  WHERE onboarded_at IS NULL;

-- P1-3: 폰트 크기 설정
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium'
  CHECK (font_size IN ('small', 'medium', 'large'));
