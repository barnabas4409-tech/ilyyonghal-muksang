-- Phase 7: 함께 걷는 훈련
-- 묵상을 중심으로 다른 영성/생활 훈련을 동반시키는 챌린지 시스템.
-- 핵심: challenge_logs.reflection_id로 묵상과 연결.

-- ============================================================
-- 1) profiles에 닉네임/아바타 정체성 컬럼 (Phase 9 공유 대비)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS avatar_seed text,
  ADD COLUMN IF NOT EXISTS handle_changed_at timestamptz;

-- handle은 unique (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique
  ON public.profiles (lower(handle))
  WHERE handle IS NOT NULL;

-- 기존 사용자에게 기본 닉네임 부여 (벗-{6자리})
-- avatar_seed는 user_id 기반
UPDATE public.profiles
SET
  display_name = '벗-' || substr(id::text, 1, 6),
  handle       = 'friend-' || substr(id::text, 1, 6),
  avatar_seed  = id::text
WHERE display_name IS NULL;

-- handle_new_user 트리거 갱신: 새 사용자에게도 자동 닉네임 부여
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, display_name, handle, avatar_seed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    '벗-' || substr(NEW.id::text, 1, 6),
    'friend-' || substr(NEW.id::text, 1, 6),
    NEW.id::text
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 2) challenges 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name          text NOT NULL,
  emoji         text,                                          -- 📚 🏃 🙏 등
  category      text NOT NULL DEFAULT 'custom',                -- meditation | study | exercise | prayer | gratitude | custom
  cadence       text NOT NULL DEFAULT 'daily',                 -- daily | weekly
  target_value  numeric,                                       -- 분/횟수 등 (선택)
  target_unit   text,                                          -- '분' | '회' | '단어' (선택)
  is_pinned     boolean DEFAULT true,                          -- 홈에 표시 여부
  started_at    date DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
  ended_at      date,                                          -- null이면 진행 중
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS challenges_user_active_idx
  ON public.challenges (user_id, is_pinned, started_at DESC)
  WHERE ended_at IS NULL;

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_own"
  ON public.challenges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "challenges_insert_own"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "challenges_update_own"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "challenges_delete_own"
  ON public.challenges FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3) challenge_logs — 일별 완료 기록
-- 핵심: reflection_id로 묵상과 연결 (묵상 안에서의 훈련)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenge_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id  uuid NOT NULL REFERENCES public.challenges ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date          date NOT NULL,                  -- KST 기준
  value         numeric,                        -- 실제 수행값 (분/횟수). 단순 완료면 NULL
  note          text,
  reflection_id uuid,                           -- 같은 날 묵상과 연결 (선택)
  created_at    timestamptz DEFAULT now(),
  UNIQUE (challenge_id, date)
);

CREATE INDEX IF NOT EXISTS challenge_logs_user_date_idx
  ON public.challenge_logs (user_id, date DESC);

ALTER TABLE public.challenge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_logs_select_own"
  ON public.challenge_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "challenge_logs_insert_own"
  ON public.challenge_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "challenge_logs_update_own"
  ON public.challenge_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "challenge_logs_delete_own"
  ON public.challenge_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4) 자동 reflection_id 연결
-- 같은 날 같은 사용자의 reflection이 있으면 자동 attach
-- ============================================================
CREATE OR REPLACE FUNCTION public.link_challenge_log_to_reflection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reflection_id IS NULL THEN
    SELECT id INTO NEW.reflection_id
    FROM public.reflections
    WHERE user_id = NEW.user_id
      AND public.kst_date(created_at) = NEW.date
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS challenge_logs_link_reflection ON public.challenge_logs;
CREATE TRIGGER challenge_logs_link_reflection
  BEFORE INSERT OR UPDATE ON public.challenge_logs
  FOR EACH ROW EXECUTE FUNCTION public.link_challenge_log_to_reflection();
