// 오늘이 속한 주의 일요일 날짜 반환
export function getSundayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=일, 1=월 ... 6=토
  d.setDate(d.getDate() - day);
  return d.toISOString().split('T')[0];
}

export function getLiturgicalYearLabel(year: 'A' | 'B' | 'C'): string {
  return { A: '가해', B: '나해', C: '다해' }[year];
}

export const SEASON_LABELS: Record<string, string> = {
  advent: '대강절',
  christmas: '성탄절',
  epiphany: '주현절',
  lent: '사순절',
  easter: '부활절',
  pentecost: '성령강림절',
  trinity: '성삼위일체',
  ordinary: '성령강림절 후',
};
