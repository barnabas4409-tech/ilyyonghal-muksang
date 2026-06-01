'use client';

import { useState } from 'react';
import type { ScriptureBlock as Props } from '@/types/blocks';
import { getLiturgicalYearLabel, SEASON_LABELS } from '@/utils/lectionary';
import { BIBLE_VERSION_LABELS } from '@/types';

type Tab = 'ot' | 'psalm' | 'epistle' | 'gospel';
const TAB_LABELS: Record<Tab, string> = { ot: '구약', psalm: '시편', epistle: '서신서', gospel: '복음서' };

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function todayLabel() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
}


export default function ScriptureBlock({ lectionary, bibleVersion }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('gospel');

  const tabContent = {
    ot:      { passage: lectionary.ot_passage,      content: lectionary.ot_content },
    psalm:   { passage: lectionary.psalm_passage,   content: lectionary.psalm_content },
    epistle: { passage: lectionary.epistle_passage, content: lectionary.epistle_content },
    gospel:  { passage: lectionary.gospel_passage,  content: lectionary.gospel_content },
  };

  const current = tabContent[activeTab];

  return (
    <div>
      {/* 헤더 */}
      <div className="px-5 pt-7 pb-5">
        {/* 날짜 */}
        <p className="text-xs text-muted-foreground mb-3">{todayLabel()}</p>

        {/* 배지 줄 */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full tracking-wide">
            교회력 성서정과
          </span>
          {lectionary.liturgical_year && (
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {getLiturgicalYearLabel(lectionary.liturgical_year)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {BIBLE_VERSION_LABELS[bibleVersion]}
          </span>
        </div>

        {/* 주 이름 */}
        <h1 className="text-xl font-medium text-foreground leading-snug">
          {lectionary.week_name}
        </h1>
        {lectionary.season && (
          <p className="text-xs text-muted-foreground mt-1">
            {SEASON_LABELS[lectionary.season] ?? lectionary.season}
          </p>
        )}

        {/* 4본문 장절 */}
        <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
          <p>{[lectionary.ot_passage, lectionary.psalm_passage].filter(Boolean).join(' · ')}</p>
          <p>{[lectionary.epistle_passage, lectionary.gospel_passage].filter(Boolean).join(' · ')}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="px-5 mb-5">
        <p className="text-[10px] text-muted-foreground/60 mb-2 leading-snug">
          교회력 성서정과는 매주 구약·시편·서신서·복음서 네 본문을 함께 읽어요
        </p>
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* 본문 — 인라인 흐름, 시각적 중심은 텍스트 자체 */}
      <div className="px-5 pt-2">
        <p className="text-[11px] font-medium text-primary uppercase tracking-[0.18em] mb-5">
          {current.passage ?? '—'}
        </p>
        <p className="font-serif-kr text-[1.05rem] leading-[2.1] text-foreground whitespace-pre-line">
          {current.content ?? '본문을 준비 중입니다'}
        </p>
      </div>
    </div>
  );
}
