-- Phase 5: Notion화 — 블록 자유 조합 + 새 블록 타입

-- 감사/자유기록 등 새 블록 데이터를 유연하게 보관할 JSONB 컬럼
-- 예: { gratitude: "...", freenote: "...", ... }
ALTER TABLE public.reflections
  ADD COLUMN IF NOT EXISTS extras jsonb DEFAULT '{}'::jsonb;

-- profiles.custom_blocks 스키마 (참고용 주석):
-- v1 (기존): { showQuote?: bool, showSilence?: bool, silenceMins?: number }
-- v2 (신규): { v: 2, blocks: [{ type, ...config }, ...] }
-- 마이그레이션은 런타임에서 처리 (호환성 유지)
