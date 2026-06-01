'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Challenge, ChallengeLog } from '@/types';
import { sortChallenges } from '@/lib/challenges';
import ChallengeCard from './ChallengeCard';
import ChallengeEditor from './ChallengeEditor';

interface Props {
  challenges: Challenge[];
  logs: ChallengeLog[];           // 오늘의 logs
  streaks: Record<string, number>; // challenge_id → current streak
  userId: string;
  todayKst: string;
}

export default function ChallengeList({ challenges, logs, streaks, userId, todayKst }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  const sorted = sortChallenges(challenges);
  const logsByChallenge = new Map(logs.map((l) => [l.challenge_id, l]));

  function refresh() {
    startTransition(() => router.refresh());
  }

  if (sorted.length === 0 && !adding) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setAdding(true)}
          className="w-full py-3 text-xs text-primary border border-dashed border-primary/40 rounded-xl liquid-transition-fast hover:bg-primary/5"
        >
          + 첫 훈련 추가하기
        </button>
        <p className="text-[10px] text-muted-foreground/60 text-center px-4 leading-relaxed">
          묵상 옆에서 함께 길러가고 싶은 훈련을 더해보세요.<br />
          운동, 공부, 기도, 감사 — 무엇이든.
        </p>
      </div>
    );
  }

  return (
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
            onCreated={() => {
              setAdding(false);
              refresh();
            }}
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
  );
}
