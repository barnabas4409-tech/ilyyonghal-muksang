'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ReflectionReaction } from '@/types';
import posthog from 'posthog-js';

interface SharedEntry {
  id: string;
  one_line_word: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  display_name: string | null;
  handle: string | null;
}

const STICKERS: { key: ReflectionReaction['sticker']; emoji: string; label: string }[] = [
  { key: 'pray',    emoji: '🙏', label: '아멘' },
  { key: 'sprout',  emoji: '🌱', label: '은혜' },
  { key: 'heart',   emoji: '❤️', label: '사랑' },
];

interface Props {
  hasMyReflection: boolean;
  sharedEntries: SharedEntry[];
  myReactions: ReflectionReaction[];
  userId: string;
}

function StickerButton({
  sticker,
  active,
  onToggle,
}: {
  sticker: typeof STICKERS[number];
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium liquid-transition-fast active:scale-[0.95] ${
        active
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-muted/50 text-muted-foreground border border-transparent'
      }`}
    >
      <span>{sticker.emoji}</span>
      <span>{sticker.label}</span>
    </button>
  );
}

export default function CompanionsClient({ hasMyReflection, sharedEntries, myReactions, userId }: Props) {
  const [reactions, setReactions] = useState<Record<string, ReflectionReaction['sticker'] | null>>(
    Object.fromEntries(myReactions.map((r) => [r.reflection_id, r.sticker])),
  );

  async function toggleReaction(reflectionId: string, sticker: ReflectionReaction['sticker']) {
    const current = reactions[reflectionId];
    const supabase = createClient();

    if (current === sticker) {
      // 같은 스티커 → 취소
      await supabase
        .from('reflection_reactions')
        .delete()
        .eq('reflection_id', reflectionId)
        .eq('user_id', userId);
      setReactions((prev) => ({ ...prev, [reflectionId]: null }));
    } else {
      // 다른 스티커 or 없음 → upsert
      await supabase
        .from('reflection_reactions')
        .upsert({ reflection_id: reflectionId, user_id: userId, sticker }, { onConflict: 'reflection_id,user_id' });
      posthog.capture('companion_reaction_sent', { sticker });
      setReactions((prev) => ({ ...prev, [reflectionId]: sticker }));
    }
  }

  if (!hasMyReflection) {
    return (
      <div className="flex flex-col min-h-dvh px-5 pt-4 pb-10">
        <header className="flex items-center justify-between -mx-2 mb-8">
          <Link href="/today" className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground liquid-transition-fast">
            ← 오늘
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
          <p className="text-lg font-medium text-foreground">오늘의 묵상을 먼저 마치고 오세요</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            같은 말씀을 읽고 한 줄 말씀을 받은 후에<br />동행자들의 말씀을 볼 수 있어요.
          </p>
          <Link
            href="/today"
            className="mt-2 inline-block px-6 py-3 btn-gold rounded-2xl text-sm font-medium liquid-transition"
          >
            묵상 시작하기 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-4 pb-10">
      <header className="flex items-center justify-between -mx-2 mb-6">
        <Link href="/today" className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground liquid-transition-fast">
          ← 오늘
        </Link>
      </header>

      <div className="text-center mb-8 space-y-1">
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">
          오늘 함께 머문 말씀
        </p>
        <p className="text-xs text-muted-foreground">
          같은 말씀을 읽고 받은 한 문장이에요
        </p>
      </div>

      {sharedEntries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 px-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            아직 나눈 분이 없어요.<br />
            오늘의 묵상에서 첫 번째로 나눠보세요.
          </p>
          <Link href="/today" className="text-xs text-primary font-medium">
            묵상으로 돌아가기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-8">
          {sharedEntries.map((entry) => (
            <li key={entry.id} className="space-y-3">
              <blockquote>
                <p className="font-serif-kr text-xl leading-relaxed text-foreground px-2">
                  &ldquo;{entry.one_line_word}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2 px-2">
                  {entry.is_anonymous ? '익명' : (entry.display_name ?? '벗')}
                </p>
              </blockquote>
              <div className="flex gap-2 px-2">
                {STICKERS.map((s) => (
                  <StickerButton
                    key={s.key}
                    sticker={s}
                    active={reactions[entry.id] === s.key}
                    onToggle={() => toggleReaction(entry.id, s.key)}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-muted-foreground/40 text-center mt-10 leading-relaxed px-4">
        진행 상황이나 연속 일수는 일부러 표시하지 않아요.<br />
        함께 말씀 앞에 머물렀다는 것만으로 충분해요.
      </p>
    </div>
  );
}
