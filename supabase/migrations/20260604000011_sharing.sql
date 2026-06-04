-- Phase 10: 같은 본문 묵상 나눔

-- profiles: 닉네임 필드
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle      text,
  ADD COLUMN IF NOT EXISTS handle_changed_at timestamptz;

-- handle 유니크 제약 (중복 없으면 추가)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_handle_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_unique UNIQUE (handle);
  END IF;
END $$;

-- reflections: 공유 관련 필드 추가
ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden    boolean DEFAULT false;

-- 스티커 반응 테이블
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

-- reflections: 공개 묵상 RLS (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reflections' AND policyname = 'Public reflections visible to authenticated'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Public reflections visible to authenticated"
        ON public.reflections FOR SELECT
        TO authenticated
        USING (is_public = true AND is_hidden = false OR auth.uid() = user_id)
    $p$;
  END IF;
END $$;
