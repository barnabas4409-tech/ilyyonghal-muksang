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
