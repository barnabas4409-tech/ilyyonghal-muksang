import type { MeditationMode } from '@/types';

/* 사용자가 자유롭게 조합할 수 있는 블록 종류
   (scripture는 시스템 블록 — 항상 자동으로 첫 번째 추가) */
export type BlockKind =
  | 'quote'
  | 'silence'
  | 'journal'
  | 'oneline'
  | 'prayer'
  | 'practice'
  | 'gratitude'
  | 'freenote';

export type BlockConfig =
  | { type: 'quote' }
  | { type: 'silence'; mins?: number }
  | { type: 'journal' }
  | { type: 'oneline' }
  | { type: 'prayer' }
  | { type: 'practice' }
  | { type: 'gratitude' }
  | { type: 'freenote' };

export interface BlockMeta {
  label: string;
  description: string;
  /* 한 흐름에 중복 가능 (자유기록, 침묵 등) */
  allowMultiple?: boolean;
}

export const BLOCK_META: Record<BlockKind, BlockMeta> = {
  quote:     { label: '신앙고전', description: '교회 전통의 한 문장과 함께' },
  silence:   { label: '침묵',     description: '말씀과 함께 머무는 시간', allowMultiple: true },
  journal:   { label: '묵상 기록', description: '자유로운 사유와 느낌' },
  oneline:   { label: '한 줄 말씀', description: '오늘 하나님이 주신 한 문장' },
  prayer:    { label: '기도',     description: '말씀에 응답하는 한 마디' },
  practice:  { label: '실천',     description: '오늘 살아낼 작은 한 가지' },
  gratitude: { label: '감사',     description: '오늘 감사한 것들' },
  freenote:  { label: '자유 기록', description: '떠오른 메모, 인용', allowMultiple: true },
};

export const SILENCE_PRESETS = [1, 3, 5, 10, 15, 20];

/* 모드별 기본 흐름 */
export const DEFAULT_FLOWS: Record<MeditationMode, BlockConfig[]> = {
  simple:   [{ type: 'journal' }, { type: 'oneline' }],
  standard: [
    { type: 'quote' },
    { type: 'silence', mins: 5 },
    { type: 'journal' },
    { type: 'oneline' },
    { type: 'prayer' },
    { type: 'practice' },
  ],
  deep: [
    { type: 'quote' },
    { type: 'silence', mins: 10 },
    { type: 'journal' },
    { type: 'oneline' },
    { type: 'prayer' },
    { type: 'practice' },
  ],
};

interface CustomBlocksV1 {
  showQuote?: boolean;
  showSilence?: boolean;
  silenceMins?: number;
}

interface CustomBlocksV2 {
  v: 2;
  blocks: BlockConfig[];
}

type StoredCustom = CustomBlocksV1 | CustomBlocksV2 | null | undefined;

function isV2(c: unknown): c is CustomBlocksV2 {
  if (typeof c !== 'object' || c === null) return false;
  const obj = c as Record<string, unknown>;
  return obj.v === 2 && Array.isArray(obj.blocks);
}

function isValidConfig(b: unknown): b is BlockConfig {
  return (
    typeof b === 'object' &&
    b !== null &&
    'type' in b &&
    typeof (b as { type: unknown }).type === 'string' &&
    (b as { type: string }).type in BLOCK_META
  );
}

/* 저장된 데이터(v1 or v2 or null) → BlockConfig[] */
export function normalizeBlocks(raw: StoredCustom, mode: MeditationMode): BlockConfig[] {
  if (!raw) return DEFAULT_FLOWS[mode];

  if (isV2(raw)) {
    const valid = raw.blocks.filter(isValidConfig);
    return valid.length > 0 ? valid : DEFAULT_FLOWS[mode];
  }

  // v1 → v2 변환
  const v1 = raw as CustomBlocksV1;
  const flow: BlockConfig[] = [];
  if (v1.showQuote !== false) flow.push({ type: 'quote' });
  if (v1.showSilence !== false) flow.push({ type: 'silence', mins: v1.silenceMins ?? 5 });
  flow.push(
    { type: 'journal' },
    { type: 'oneline' },
    { type: 'prayer' },
    { type: 'practice' },
  );
  return flow;
}

export function serializeBlocks(flow: BlockConfig[]): CustomBlocksV2 {
  return { v: 2, blocks: flow };
}
