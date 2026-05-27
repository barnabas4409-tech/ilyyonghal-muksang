'use client';

import { useState } from 'react';
import type { Reflection, DailyReading } from '@/types';

type ReflectionWithReading = Omit<Reflection, 'daily_readings'> & {
  daily_readings?: Pick<DailyReading, 'date' | 'passage' | 'title'>;
};

interface Props {
  reflections: ReflectionWithReading[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function JournalClient({ reflections }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (reflections.length === 0) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-5 text-center">
        <div className="text-4xl mb-4">📖</div>
        <p className="text-[#2C2416] dark:text-[#E8DCC8] font-medium mb-2">아직 묵상 기록이 없어요</p>
        <p className="text-sm text-[#C4A882]">첫 묵상을 시작해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-medium text-[#2C2416] dark:text-[#E8DCC8]">내 기록</h1>
        <p className="text-xs text-[#C4A882] mt-1">총 {reflections.length}개의 묵상</p>
      </div>

      {/* 목록 */}
      <div className="px-5 space-y-3 pb-4">
        {reflections.map((reflection) => {
          const isExpanded = expanded === reflection.id;
          const firstLine = reflection.content.split('\n')[0];

          return (
            <button
              key={reflection.id}
              onClick={() => setExpanded(isExpanded ? null : reflection.id)}
              className="w-full text-left bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-5 transition-all active:scale-[0.99]"
            >
              {/* 날짜 + 말씀 */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-[#8B7355] font-medium">
                    {reflection.daily_readings?.passage ?? '—'}
                  </p>
                  <p className="text-xs text-[#C4A882] mt-0.5">
                    {formatDate(reflection.created_at)}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-[#C4A882] mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              {/* 내용 미리보기 */}
              <p className="text-sm text-[#2C2416] dark:text-[#E8DCC8] leading-relaxed">
                {isExpanded ? reflection.content : (firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine)}
              </p>

              {/* 하이라이트 */}
              {isExpanded && reflection.highlighted_sentence && (
                <div className="mt-3 pl-3 border-l-2 border-[#8B7355]">
                  <p className="text-xs text-[#8B7355] font-serif-kr leading-relaxed">
                    {reflection.highlighted_sentence}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
