'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Challenge, ChallengeLog } from '@/types';
import { CATEGORY_META, streakMessage } from '@/lib/challenges';

interface Props {
  challenge: Challenge;
  todayLog: ChallengeLog | null;
  userId: string;
  todayKst: string;
  currentStreak: number;
  onChange: () => void;
}

export default function ChallengeCard({
  challenge, todayLog, userId, todayKst, currentStreak, onChange,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const done = !!todayLog;
  const emoji = challenge.emoji || CATEGORY_META[challenge.category].defaultEmoji;
  const targetLabel = challenge.target_value
    ? `${challenge.target_value}${challenge.target_unit ?? ''}`
    : null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (done) {
      const { error: err } = await supabase
        .from('challenge_logs')
        .delete()
        .eq('id', todayLog!.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase
        .from('challenge_logs')
        .insert({
          challenge_id: challenge.id,
          user_id: userId,
          date: todayKst,
          value: challenge.target_value,
        });
      if (err) setError(err.message);
    }

    setBusy(false);
    if (!error) onChange();
  }

  const message = streakMessage(currentStreak, done, challenge.category);

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl liquid-transition-fast hover:bg-muted/40 active:bg-muted/60"
    >
      {/* 토글 원 — 클릭 시 토글만 (상세 진입 X) */}
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={done ? '완료 취소' : '완료 표시'}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 liquid-transition-fast disabled:opacity-50 ${
          done ? 'bg-primary border-primary' : 'border-border hover:border-primary/60'
        }`}
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* 이모지 */}
      <span className="text-lg shrink-0">{emoji}</span>

      {/* 이름 + 메시지 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p
            className={`text-sm font-medium truncate liquid-transition-fast ${
              done ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}
          >
            {challenge.name}
          </p>
          {targetLabel && (
            <p className="text-[11px] text-muted-foreground/70 shrink-0">{targetLabel}</p>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
          {message}
          {error && <span className="text-orange-600 dark:text-orange-400 ml-2">· {error}</span>}
        </p>
      </div>

      {/* streak */}
      {currentStreak > 0 && (
        <div className="flex items-center gap-0.5 text-[11px] text-primary shrink-0">
          <span>🔥</span>
          <span className="font-medium">{currentStreak}</span>
        </div>
      )}

      {/* chevron — 상세 진입 힌트 */}
      <span className="text-muted-foreground/30 text-xs shrink-0">→</span>
    </Link>
  );
}
