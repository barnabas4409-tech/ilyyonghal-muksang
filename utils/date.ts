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

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
