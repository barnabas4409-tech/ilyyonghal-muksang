'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Challenge, ChallengeLog } from '@/types';
import { CATEGORY_META, sortChallenges } from '@/lib/challenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';
import ChallengeEditor from '@/components/challenges/ChallengeEditor';

interface Props {
  active: Challenge[];
  ended: Challenge[];
  todayLogs: ChallengeLog[];
  streaks: Record<string, number>;
  userId: string;
  todayKst: string;
}

function fmtKoreanDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChallengesPageClient({ active, ended, todayLogs, streaks, userId, todayKst }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [showEnded, setShowEnded] = useState(false);

  const sorted = sortChallenges(active);
  const logsByChallenge = new Map(todayLogs.map((l) => [l.challenge_id, l]));
  const doneCount = todayLogs.length;

  function refresh() {
    startTransition(() => router.refresh());
  }

  return (
    <div className="min-h-dvh pb-28 px-5 pt-8 space-y-8">
      {/* 헤더 */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">함께 걷는 훈련</p>
        <h1 className="text-xl font-medium text-foreground">
          {sorted.length === 0
            ? '오늘의 훈련을 만들어보세요'
            : doneCount === sorted.length
              ? `오늘 ${doneCount}가지 훈련 완료`
              : `오늘 ${doneCount} / ${sorted.length} 완료`}
        </h1>
        <p className="text-xs text-muted-foreground">
          {sorted.length === 0
            ? '작은 훈련 하나가 형성의 시작이에요'
            : '한 걸음씩, 매일'}
        </p>
      </div>

      {/* 진행 중인 훈련 */}
      <div className="space-y-1">
        {sorted.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            todayLog={logsByChallenge.get(c.id) ?? null}
            userId={userId}
            todayKst={todayKst}
            currentStreak={streaks[c.id] ?? 0}
            onChange={refresh}
          />
        ))}

        {adding ? (
          <div className="pt-3">
            <ChallengeEditor
              userId={userId}
              onCreated={() => { setAdding(false); refresh(); }}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full mt-3 py-2.5 text-xs text-primary/80 border border-dashed border-border rounded-xl liquid-transition-fast hover:border-primary/40 hover:text-primary"
          >
            + 훈련 추가
          </button>
        )}
      </div>

      {/* 탐색하기 */}
      <div className="bg-muted/30 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">다른 분들의 훈련 보기</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">같은 카테고리에서 영감을 얻어보세요</p>
        </div>
        <Link
          href="/challenges/explore"
          className="text-xs text-primary font-medium px-3 py-1.5 rounded-xl bg-primary/10 liquid-transition-fast hover:bg-primary/20"
        >
          탐색 →
        </Link>
      </div>

      {/* 마친 훈련 */}
      {ended.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowEnded((v) => !v)}
            className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]"
          >
            <span>마친 훈련 {ended.length}개</span>
            <span className="liquid-transition-fast">{showEnded ? '▲' : '▼'}</span>
          </button>

          {showEnded && (
            <div className="space-y-2">
              {ended.map((c) => {
                const emoji = c.emoji || CATEGORY_META[c.category].defaultEmoji;
                const targetLabel = c.target_value
                  ? `${c.target_value}${c.target_unit ?? ''}`
                  : null;
                return (
                  <Link
                    key={c.id}
                    href={`/challenges/${c.id}`}
                    className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-muted/40 liquid-transition-fast"
                  >
                    <span className="text-lg opacity-50">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground line-through truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                        {fmtKoreanDate(c.started_at)} — {fmtKoreanDate(c.ended_at!)}
                        {targetLabel && ` · ${targetLabel}`}
                      </p>
                    </div>
                    <span className="text-muted-foreground/30 text-xs">→</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
