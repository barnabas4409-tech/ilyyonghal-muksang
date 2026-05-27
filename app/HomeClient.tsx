'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { DailyReading, LectionaryReading, Streak, BibleVersion, ReadingTrack } from '@/types';
import { BIBLE_VERSION_LABELS } from '@/types';
import IllustrationBanner from '@/components/illustration/IllustrationBanner';
import StreakDots from '@/components/ui/StreakDots';
import { formatKoreanDate, getTodayDateString } from '@/utils/date';
import { getContent } from '@/utils/bible';
import { getLiturgicalYearLabel, SEASON_LABELS } from '@/utils/lectionary';

interface Props {
  user: User | null;
  reading: DailyReading | null;
  lectionaryReading: LectionaryReading | null;
  readingTrack: ReadingTrack;
  streak: Streak | null;
  reflectionDates: string[];
  bibleVersion: BibleVersion;
}

export default function HomeClient({
  user, reading, lectionaryReading, readingTrack, streak, reflectionDates, bibleVersion,
}: Props) {
  const today = getTodayDateString();
  const illustrationType = readingTrack === 'lectionary'
    ? lectionaryReading?.illustration_type
    : reading?.illustration_type;

  return (
    <div className="flex flex-col min-h-dvh">
      <IllustrationBanner type={illustrationType} />

      <div className="flex-1 px-5 py-6 space-y-6">
        {/* 날짜 */}
        <p className="text-xs text-[#C4A882] tracking-widest uppercase">
          {formatKoreanDate(today)}
        </p>

        {/* 성서정과 트랙 */}
        {readingTrack === 'lectionary' && lectionaryReading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[#8B7355] bg-[#EDE7DC] dark:bg-[#1E1B14] px-2 py-0.5 rounded-full font-medium">
                교회력 성서정과
              </span>
              {lectionaryReading.liturgical_year && (
                <span className="text-[10px] text-[#C4A882]">
                  {getLiturgicalYearLabel(lectionaryReading.liturgical_year)}
                </span>
              )}
              <span className="text-[10px] text-[#C4A882]">
                {BIBLE_VERSION_LABELS[bibleVersion]}
              </span>
            </div>
            <p className="text-base font-medium text-[#2C2416] dark:text-[#E8DCC8]">
              {lectionaryReading.week_name}
            </p>
            <p className="text-xs text-[#8B7355]">
              {SEASON_LABELS[lectionaryReading.season] ?? lectionaryReading.season}
            </p>
            {/* 복음서 본문 요약 */}
            <div className="space-y-1">
              <p className="text-xs text-[#C4A882]">복음서 · {lectionaryReading.gospel_passage}</p>
              <p className="font-serif-kr text-lg leading-relaxed text-[#2C2416] dark:text-[#E8DCC8]">
                {lectionaryReading.gospel_content
                  ? lectionaryReading.gospel_content.slice(0, 80) + '...'
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* 큐레이션 트랙 */}
        {readingTrack !== 'lectionary' && (
          reading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-[#8B7355] tracking-wide uppercase">
                  {reading.passage}
                </p>
                <span className="text-[10px] text-[#C4A882] bg-[#EDE7DC] dark:bg-[#1E1B14] px-2 py-0.5 rounded-full">
                  {BIBLE_VERSION_LABELS[bibleVersion]}
                </span>
              </div>
              <p className="font-serif-kr text-xl leading-relaxed text-[#2C2416] dark:text-[#E8DCC8]">
                {getContent(reading, bibleVersion)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[#C4A882]">오늘의 말씀을 준비 중입니다</p>
          )
        )}

        {/* 묵상 질문 미리보기 */}
        {(() => {
          const q = readingTrack === 'lectionary'
            ? lectionaryReading?.reflection_question
            : reading?.reflection_question;
          return q ? (
            <div className="bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-5">
              <p className="text-xs text-[#8B7355] font-medium mb-2">오늘의 묵상 질문</p>
              <p className="text-sm text-[#2C2416] dark:text-[#E8DCC8] leading-relaxed line-clamp-3">
                {q}
              </p>
            </div>
          ) : null;
        })()}

        {/* 스트릭 */}
        {user && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#C4A882]">
                {streak?.current_streak
                  ? `${streak.current_streak}일 연속 묵상 중`
                  : '오늘 첫 묵상을 시작해보세요'}
              </p>
              {streak?.current_streak && streak.current_streak > 1 && (
                <span className="text-xs text-[#8B7355] font-medium">🔥 {streak.current_streak}</span>
              )}
            </div>
            <StreakDots reflectionDates={reflectionDates} />
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/today"
            className="block w-full text-center py-4 bg-[#8B7355] text-[#F7F4EF] rounded-2xl font-medium text-sm tracking-wide hover:bg-[#7A6245] active:scale-[0.98] transition-all"
          >
            {reflectionDates.includes(today) ? '오늘 묵상 이어가기' : '묵상 시작하기'}
          </Link>
        </div>
      </div>
    </div>
  );
}
