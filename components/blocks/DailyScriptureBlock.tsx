'use client';

import type { DailyScriptureBlock as Props } from '@/types/blocks';
import { BIBLE_VERSION_LABELS } from '@/types';
import { getContent } from '@/utils/bible';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
}

export default function DailyScriptureBlock({ reading, bibleVersion }: Props) {
  const text = getContent(reading, bibleVersion);

  return (
    <div>
      {/* 헤더 */}
      <div className="px-5 pt-7 pb-5">
        {/* 날짜 */}
        <p className="text-xs text-muted-foreground mb-3">{todayLabel()}</p>

        {/* 배지 줄 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full tracking-wide">
            일용할 묵상
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {BIBLE_VERSION_LABELS[bibleVersion]}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-medium text-foreground leading-snug">
          {reading.title}
        </h1>
      </div>

      {/* 본문 — 인라인 흐름 */}
      <div className="px-5 pt-2">
        <p className="text-[11px] font-medium text-primary uppercase tracking-[0.18em] mb-5">
          {reading.passage}
        </p>
        <p className="font-serif-kr text-[1.05rem] leading-[2.1] text-foreground whitespace-pre-line">
          {text}
        </p>
      </div>
    </div>
  );
}
