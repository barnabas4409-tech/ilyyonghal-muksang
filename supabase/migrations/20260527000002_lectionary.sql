-- 성서정과 테이블 (주일 단위)
CREATE TABLE IF NOT EXISTS public.lectionary_readings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sunday_date date UNIQUE NOT NULL,
  liturgical_year char(1) CHECK (liturgical_year IN ('A', 'B', 'C')),
  season text,
  week_name text NOT NULL,
  -- 구약
  ot_passage text,
  ot_content text,
  -- 시편
  psalm_passage text,
  psalm_content text,
  -- 서신서
  epistle_passage text,
  epistle_content text,
  -- 복음서
  gospel_passage text,
  gospel_content text,
  reflection_question text,
  illustration_type text DEFAULT 'spring' CHECK (illustration_type IN ('dawn', 'night', 'spring')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lectionary_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectionary readings are public"
  ON public.lectionary_readings FOR SELECT USING (true);
