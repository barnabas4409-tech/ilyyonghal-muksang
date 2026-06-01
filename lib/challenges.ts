import type { Challenge, ChallengeCategory, ChallengeLog } from '@/types';

/* 카테고리별 메타 — 이모지 기본값 + 한글 라벨 */
export const CATEGORY_META: Record<ChallengeCategory, { label: string; defaultEmoji: string }> = {
  meditation: { label: '묵상',   defaultEmoji: '📖' },
  study:      { label: '공부',   defaultEmoji: '📚' },
  exercise:   { label: '운동',   defaultEmoji: '🏃' },
  prayer:     { label: '기도',   defaultEmoji: '🙏' },
  gratitude:  { label: '감사',   defaultEmoji: '🌿' },
  custom:     { label: '훈련',   defaultEmoji: '✨' },
};

export const CATEGORY_ORDER: ChallengeCategory[] = [
  'meditation', 'prayer', 'gratitude', 'study', 'exercise', 'custom',
];

/* 단순 streak 계산 — daily cadence 기준 */
export function calculateStreak(
  logs: ChallengeLog[],
  todayKst: string,
): { current: number; longest: number; lastDate: string | null } {
  if (logs.length === 0) return { current: 0, longest: 0, lastDate: null };

  // 날짜만 추출하여 정렬 (UNIQUE 제약상 중복 없지만 안전하게)
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort();

  let longest = 0;
  let current = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (prev === null) {
      current = 1;
    } else {
      const diff = daysBetween(prev, d);
      current = diff === 1 ? current + 1 : 1;
    }
    if (current > longest) longest = current;
    prev = d;
  }

  // 마지막 로그가 오늘 또는 어제가 아니면 current는 0 (끊김)
  if (prev) {
    const diff = daysBetween(prev, todayKst);
    if (diff > 1) current = 0;
  }

  return { current, longest, lastDate: prev };
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z');
  const db = new Date(b + 'T00:00:00Z');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/* 회복 톤 메시지 — 정죄가 아니라 환대 */
export function streakMessage(
  current: number,
  doneToday: boolean,
  category: ChallengeCategory,
): string {
  if (doneToday && current > 1) return `${current}일 연속`;
  if (doneToday && current === 1) return '오늘 시작했어요';
  if (current === 0) return '오늘 다시 이어갈 수 있어요';
  return `${current}일 이어가는 중`;
}

/* 카테고리에 따라 챌린지 정렬 — 묵상이 항상 위 */
export function sortChallenges(challenges: Challenge[]): Challenge[] {
  const orderIndex = (c: Challenge) => {
    const i = CATEGORY_ORDER.indexOf(c.category);
    return i < 0 ? 99 : i;
  };
  return [...challenges].sort((a, b) => {
    const oa = orderIndex(a);
    const ob = orderIndex(b);
    if (oa !== ob) return oa - ob;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}
