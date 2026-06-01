import type { DailyReading, BibleVersion } from '@/types';

export function getContent(reading: DailyReading, version: BibleVersion): string {
  switch (version) {
    case 'gongdong':
      return reading.content_gongdong ?? reading.content_gaeyeok ?? reading.content;
    case 'catholic':
      return reading.content_catholic ?? reading.content_gaeyeok ?? reading.content;
    case 'gaeyeok':
    default:
      return reading.content_gaeyeok ?? reading.content;
  }
}

// 홈 미리보기용: 본문에서 처음 등장하는 짧은 문장 1~2개 추출
// 절 번호(1, 2, 3...)와 빈 줄 제거 후 마침표 단위로 자름
export function extractKeyVerse(text: string, maxChars = 120): string {
  if (!text) return '';

  // 절 번호 제거: "1 처음에 하나님이..." → "처음에 하나님이..."
  // 줄 시작의 숫자(절 번호) + 공백 제거
  const cleaned = text
    .split('\n')
    .map(line => line.replace(/^\s*\d+\s+/, '').trim())
    .filter(Boolean)
    .join(' ');

  // 첫 마침표/물음표/느낌표 단위로 자르기
  const match = cleaned.match(/^[^.!?。]+[.!?。]?/);
  let verse = match ? match[0].trim() : cleaned.slice(0, maxChars);

  // 너무 길면 잘라내기
  if (verse.length > maxChars) {
    verse = verse.slice(0, maxChars).trim() + '...';
  }

  return verse;
}
