-- 긴급 fix: reflections.reading_id는 daily_readings 또는 lectionary_readings 중
-- 하나를 가리킬 수 있어야 함. 현재 FK가 daily_readings로만 잡혀 있어
-- 성서정과(lectionary) 트랙 사용자의 묵상 저장이 silent fail.
--
-- 해결: FK 제거 (어차피 두 테이블 union을 단일 FK로 표현 불가)
-- reading_id는 그냥 uuid로 두고, 애플리케이션 레벨에서 정합성 관리.

ALTER TABLE public.reflections
  DROP CONSTRAINT IF EXISTS reflections_reading_id_fkey;
