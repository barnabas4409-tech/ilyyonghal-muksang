'use client';

import { getDailyQuote } from '@/lib/quotes';

export default function QuoteBlock() {
  const quote = getDailyQuote();

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

      {/* 저자와 출처 — 부드러운 흐름 */}
      <div className="pl-5 space-y-1.5">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-foreground">{quote.author}</p>
          <p className="text-[11px] text-muted-foreground">{quote.years}</p>
        </div>
        <p className="text-[11px] font-medium text-primary">{quote.source}</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono">{quote.sourceOriginal}</p>
      </div>

      {/* 해설 */}
      <p className="mt-5 px-1 text-xs text-muted-foreground leading-relaxed">
        {quote.context}
      </p>
    </div>
  );
}
