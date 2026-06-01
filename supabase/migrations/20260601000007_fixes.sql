-- Beta 테스트 결과 핵심 fix
-- 1) profiles row 자동 생성 (auth.users → public.profiles)
-- 2) streaks 자동 갱신 (reflections INSERT/UPDATE → streak 계산)
-- 3) 기존 사용자 backfill

-- ============================================================
-- 1) profiles auto-create
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  )
  ON CONFLICT (id) DO NOTHING;

  -- 빈 streak row도 함께 생성
  INSERT INTO public.streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 기존 사용자 backfill (이미 가입했지만 profiles/streaks row가 없는 경우)
INSERT INTO public.profiles (id, email)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.streaks (user_id, current_streak, longest_streak)
SELECT u.id, 0, 0
FROM auth.users u
LEFT JOIN public.streaks s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 2) streak 자동 갱신
-- KST 기준으로 "오늘"의 reflection이 있으면 streak 갱신
-- ============================================================

-- KST 날짜 (한국 시간 기준 YYYY-MM-DD)
CREATE OR REPLACE FUNCTION public.kst_date(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (ts AT TIME ZONE 'Asia/Seoul')::date;
$$;

CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := public.kst_date(now());
  v_yesterday date := v_today - 1;
  v_last date;
  v_current int;
  v_longest int;
BEGIN
  -- 이 reflection이 의미 있는 시그널(한 줄 말씀, 본문, 기도, 실천 중 하나)을 갖는지
  -- 빈 reflection은 streak 갱신 안 함
  IF (
    NEW.one_line_word IS NULL AND
    NEW.content IS NULL AND
    NEW.prayer IS NULL AND
    NEW.practice IS NULL
  ) THEN
    RETURN NEW;
  END IF;

  SELECT last_reflection_date, current_streak, longest_streak
  INTO v_last, v_current, v_longest
  FROM public.streaks
  WHERE user_id = NEW.user_id;

  IF v_last IS NULL OR v_last < v_yesterday THEN
    -- 끊김 또는 첫 묵상 → 1로 재시작
    v_current := 1;
  ELSIF v_last = v_yesterday THEN
    -- 어제 했으면 +1
    v_current := COALESCE(v_current, 0) + 1;
  -- v_last = v_today 면 그대로 유지 (오늘 이미 갱신됨)
  END IF;

  IF v_current > COALESCE(v_longest, 0) THEN
    v_longest := v_current;
  END IF;

  UPDATE public.streaks
  SET current_streak = v_current,
      longest_streak = v_longest,
      last_reflection_date = v_today
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reflections_streak_update ON public.reflections;
CREATE TRIGGER reflections_streak_update
  AFTER INSERT OR UPDATE ON public.reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ============================================================
-- 3) 기존 reflections backfill (streak 재계산)
-- ============================================================
DO $$
DECLARE
  r RECORD;
  prev_date date;
  cur int;
  longest int;
BEGIN
  FOR r IN
    SELECT user_id, public.kst_date(created_at) AS d
    FROM public.reflections
    WHERE one_line_word IS NOT NULL
       OR content IS NOT NULL
       OR prayer IS NOT NULL
       OR practice IS NOT NULL
    ORDER BY user_id, public.kst_date(created_at)
  LOOP
    -- 단순화: 각 reflection에 대해 update_streak 트리거가 처리하도록
    -- (트리거가 ORDER BY user_id, date 순으로 호출되면 정확히 계산됨)
    NULL;
  END LOOP;

  -- 더 안전: 사용자별로 distinct 날짜 정렬하여 streak 직접 재계산
  FOR r IN
    WITH user_dates AS (
      SELECT DISTINCT user_id, public.kst_date(created_at) AS d
      FROM public.reflections
      WHERE one_line_word IS NOT NULL
         OR content IS NOT NULL
         OR prayer IS NOT NULL
         OR practice IS NOT NULL
      ORDER BY user_id, d
    )
    SELECT user_id, array_agg(d ORDER BY d) AS dates
    FROM user_dates
    GROUP BY user_id
  LOOP
    prev_date := NULL;
    cur := 0;
    longest := 0;
    FOR i IN 1..array_length(r.dates, 1) LOOP
      IF prev_date IS NULL OR r.dates[i] - prev_date > 1 THEN
        cur := 1;
      ELSIF r.dates[i] - prev_date = 1 THEN
        cur := cur + 1;
      END IF;
      IF cur > longest THEN longest := cur; END IF;
      prev_date := r.dates[i];
    END LOOP;

    -- 마지막 날짜가 오늘 또는 어제가 아니면 current_streak는 0으로 (끊김)
    IF prev_date < public.kst_date(now()) - 1 THEN
      cur := 0;
    END IF;

    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_reflection_date)
    VALUES (r.user_id, cur, longest, prev_date)
    ON CONFLICT (user_id) DO UPDATE
      SET current_streak = EXCLUDED.current_streak,
          longest_streak = GREATEST(public.streaks.longest_streak, EXCLUDED.longest_streak),
          last_reflection_date = EXCLUDED.last_reflection_date;
  END LOOP;
END $$;
