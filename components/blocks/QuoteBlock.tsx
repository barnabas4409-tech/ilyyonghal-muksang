'use client';

import { useState } from 'react';
import { getDailyQuote } from '@/lib/quotes';

export default function QuoteBlock() {
  const quote = getDailyQuote();
  const [showBio, setShowBio] = useState(false);

  return (
    <div className="px-5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-5">
        신앙고전 한 문장
      </p>

      {/* 인용문 — 좌측 라인 + 큰 세리프 */}
      <blockquote className="border-l-2 border-primary/30 pl-5 py-1 mb-6">
        <p className="font-serif-kr text-lg leading-[1.9] text-foreground">
          {quote.text}
        </p>
      </blockquote>

      {/* 저자와 출처 */}
      <div className="pl-5 space-y-1.5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{quote.author}</p>
          <p className="text-[11px] text-muted-foreground">{quote.years}</p>
          {quote.tradition && (
            <span className="text-[10px] text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full">
              {quote.tradition}
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium text-primary">{quote.source}</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono">{quote.sourceOriginal}</p>
      </div>

      {/* 해설 */}
      <p className="mt-5 px-1 text-xs text-muted-foreground leading-relaxed">
        {quote.context}
      </p>

      {/* 저자 소개 — 토글 */}
      {quote.bio && (
        <div className="mt-4 px-1">
          <button
            onClick={() => setShowBio(v => !v)}
            className="text-[11px] text-primary/70 flex items-center gap-1 liquid-transition"
          >
            {showBio ? '▲' : '▼'} 저자 소개
          </button>
          {showBio && (
            <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-3 py-1">
              {quote.bio}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
