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
      <div className="flex flex-col min-h-dvh items-center justify-center px-5 text-center space-y-2">
        <p className="text-foreground font-medium">아직 묵상 기록이 없어요</p>
        <p className="text-sm text-muted-foreground">첫 묵상을 시작해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-7 pb-5">
        <h1 className="text-xl font-medium text-foreground">내 기록</h1>
        <p className="text-xs text-muted-foreground mt-1">총 {reflections.length}개의 묵상</p>
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
              className="w-full text-left card-float p-5 liquid-transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wide">
                    {reflection.daily_readings?.passage ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(reflection.created_at)}
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-muted-foreground mt-1 liquid-transition-fast ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <p className="text-sm text-foreground leading-relaxed">
                {isExpanded ? reflection.content : (firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine)}
              </p>

              {isExpanded && reflection.highlighted_sentence && (
                <div className="mt-4 pl-3 border-l-2 border-primary/40">
                  <p className="text-xs text-primary font-serif-kr leading-relaxed">
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
