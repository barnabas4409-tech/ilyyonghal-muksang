-- P2-1: Stripe 결제 연동 준비

-- stripe_customers: Stripe Customer ID 저장
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_id     text        UNIQUE NOT NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users read own stripe customer"
  ON public.stripe_customers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- stripe_events: 웹훅 이벤트 로그 (멱등성)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id         text PRIMARY KEY,  -- Stripe event ID
  type       text NOT NULL,
  payload    jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 프리미엄 구독: profiles에 이미 subscription_tier 있음
-- subscription_tier = 'premium', subscription_expires_at으로 관리
