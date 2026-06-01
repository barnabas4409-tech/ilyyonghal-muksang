-- Phase 1: Spiritual Formation 시그널 데이터
-- 한 줄 말씀(필수), 기도, 실천을 reflections에 추가

-- 1) 새 컬럼 (모두 nullable - 하위 호환)
ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS one_line_word text,
  ADD COLUMN IF NOT EXISTS prayer text,
  ADD COLUMN IF NOT EXISTS practice text;

-- 2) content를 nullable로 (각 블록이 독립적으로 upsert 가능하게)
ALTER TABLE public.reflections
  ALTER COLUMN content DROP NOT NULL;

-- 3) (user_id, reading_id) 유니크 — 블록별 upsert를 위해
-- 기존 중복이 있으면 첫 행만 남기고 삭제
DELETE FROM public.reflections a
  USING public.reflections b
  WHERE a.user_id = b.user_id
    AND a.reading_id = b.reading_id
    AND a.created_at > b.created_at;

ALTER TABLE public.reflections
  ADD CONSTRAINT reflections_user_reading_unique
  UNIQUE (user_id, reading_id);

-- 4) 한 줄 말씀 아카이브 조회용 인덱스
CREATE INDEX IF NOT EXISTS reflections_oneline_idx
  ON public.reflections (user_id, created_at DESC)
  WHERE one_line_word IS NOT NULL;
