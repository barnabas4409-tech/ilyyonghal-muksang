export function getIllustrationByHour(): 'dawn' | 'spring' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'dawn';
  if (hour >= 11 && hour < 20) return 'spring';
  return 'night';
}

export function formatKoreanDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

/**
 * KST (Asia/Seoul) 기준 YYYY-MM-DD.
 * DB 트리거(public.kst_date)와 클라이언트 모두 같은 "오늘" 개념을 공유.
 */
export function getTodayDateString(): string {
  const now = new Date();
  // KST = UTC+9
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

/** ISO timestamptz → KST 날짜 (YYYY-MM-DD) */
export function toKstDateString(iso: string): string {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}
