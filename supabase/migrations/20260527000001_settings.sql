-- profiles에 설정 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bible_version text DEFAULT 'gaeyeok'
    CHECK (bible_version IN ('gaeyeok', 'gongdong', 'catholic')),
  ADD COLUMN IF NOT EXISTS reading_track text DEFAULT 'curated'
    CHECK (reading_track IN ('curated', 'lectionary', 'chronological'));

-- daily_readings에 역본별 본문 컬럼 추가
ALTER TABLE public.daily_readings
  ADD COLUMN IF NOT EXISTS content_gaeyeok text,
  ADD COLUMN IF NOT EXISTS content_gongdong text,
  ADD COLUMN IF NOT EXISTS content_catholic text;

-- 기존 content를 개역개정으로 복사
UPDATE public.daily_readings
  SET content_gaeyeok = content
  WHERE content_gaeyeok IS NULL;
