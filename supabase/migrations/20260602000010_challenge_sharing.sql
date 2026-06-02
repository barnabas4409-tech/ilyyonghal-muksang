-- Phase 9: 함께 시작하기 (챌린지 공유)
-- 카테고리별 인기 + 영감 공유. 비교/경쟁은 절대 X.

-- ============================================================
-- 1) challenges 컬럼 추가
-- ============================================================
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS copied_from uuid REFERENCES public.challenges(id) ON DELETE SET NULL;

-- 공개 챌린지 빠른 조회용
CREATE INDEX IF NOT EXISTS challenges_public_category_idx
  ON public.challenges (category, is_public, created_at DESC)
  WHERE is_public = true AND ended_at IS NULL;

-- 복사본 카운트용
CREATE INDEX IF NOT EXISTS challenges_copied_from_idx
  ON public.challenges (copied_from)
  WHERE copied_from IS NOT NULL;

-- ============================================================
-- 2) RLS: 공개 챌린지는 누구나 조회 가능
-- ============================================================
DROP POLICY IF EXISTS "challenges_select_own" ON public.challenges;
CREATE POLICY "challenges_select_visible"
  ON public.challenges FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- ============================================================
-- 3) profiles SELECT 정책 확장
-- 다른 사용자도 닉네임/아바타 조회 가능해야 "봄길님이 시작" 표시 가능.
-- 클라이언트는 명시적으로 공개 컬럼만 select.
-- ============================================================
CREATE POLICY "profiles_select_for_authenticated"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
-- 기존 "Users can view own profile"은 그대로 유지 (own은 모든 컬럼 가능)
-- 새 정책으로 다른 사용자도 SELECT 가능. 단 email 등 민감 컬럼은
-- 클라이언트가 select하지 않음으로 보호.

-- ============================================================
-- 4) 공개 챌린지 집계 view
-- 같은 (name, category) 조합을 묶고, 시작한 사람 수와 가장 오래 살아남은
-- 원본을 추적. copied_from이 있으면 그 트리의 루트로 묶고, 없으면 자체가 루트.
-- ============================================================
CREATE OR REPLACE VIEW public.challenge_templates AS
WITH roots AS (
  SELECT
    COALESCE(copied_from, id) AS root_id,
    id,
    name,
    category,
    emoji,
    target_value,
    target_unit,
    user_id,
    created_at
  FROM public.challenges
  WHERE is_public = true AND ended_at IS NULL
)
SELECT
  root_id,
  -- 대표 정보 (가장 오래된 = 원본)
  (array_agg(name ORDER BY created_at))[1] AS name,
  (array_agg(category ORDER BY created_at))[1] AS category,
  (array_agg(emoji ORDER BY created_at))[1] AS emoji,
  (array_agg(target_value ORDER BY created_at))[1] AS target_value,
  (array_agg(target_unit ORDER BY created_at))[1] AS target_unit,
  (array_agg(user_id ORDER BY created_at))[1] AS originator_id,
  COUNT(*) AS participant_count,
  MAX(created_at) AS latest_join_at
FROM roots
GROUP BY root_id;

GRANT SELECT ON public.challenge_templates TO authenticated, anon;

-- ============================================================
-- 5) "최근 시작한 분들" 조회용 view (격려용, 진행 상황 미노출)
-- 최근 7일 내 시작된 공개 챌린지 + 시작자 닉네임만
-- ============================================================
CREATE OR REPLACE VIEW public.recent_challenge_starts AS
SELECT
  c.id,
  c.name,
  c.emoji,
  c.category,
  c.user_id,
  c.created_at,
  p.display_name,
  p.handle,
  p.avatar_seed
FROM public.challenges c
JOIN public.profiles p ON p.id = c.user_id
WHERE c.is_public = true
  AND c.ended_at IS NULL
  AND c.created_at >= (now() - interval '7 days')
ORDER BY c.created_at DESC;

GRANT SELECT ON public.recent_challenge_starts TO authenticated;
