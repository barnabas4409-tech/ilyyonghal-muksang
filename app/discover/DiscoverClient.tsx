'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const STICKERS = [
  { key: 'pray', emoji: '🙏' },
  { key: 'sprout', emoji: '🌱' },
  { key: 'heart', emoji: '❤️' },
] as const;

interface Reaction {
  id: string;
  sticker: string;
  user_id: string;
}

interface Item {
  id: string;
  one_line_word: string | null;
  user_id: string;
  created_at: string;
  displayName: string | null;
  reactionCount: number;
  reactions: Reaction[];
  myReaction: string | null;
}

function WordCard({ item, userId }: { item: Item; userId: string }) {
  const [reactions, setReactions] = useState<Reaction[]>(item.reactions);
  const [myReaction, setMyReaction] = useState<string | null>(item.myReaction);
  const [loading, setLoading] = useState(false);

  async function toggle(sticker: string) {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();

    if (myReaction === sticker) {
      const r = reactions.find(r => r.user_id === userId && r.sticker === sticker);
      if (r) await supabase.from('reflection_reactions').delete().eq('id', r.id);
      setReactions(prev => prev.filter(r => !(r.user_id === userId)));
      setMyReaction(null);
    } else {
      const existing = reactions.find(r => r.user_id === userId);
      if (existing) await supabase.from('reflection_reactions').delete().eq('id', existing.id);

      const { data } = await supabase
        .from('reflection_reactions')
        .upsert(
          { reflection_id: item.id, user_id: userId, sticker },
          { onConflict: 'reflection_id,user_id' },
        )
        .select()
        .single();
      if (data) {
        setReactions(prev => [...prev.filter(r => r.user_id !== userId), data]);
        setMyReaction(sticker);
      }
    }
    setLoading(false);
  }

  const counts = STICKERS.reduce((acc, s) => {
    acc[s.key] = reactions.filter(r => r.sticker === s.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="card-float p-5 space-y-3">
      <p className="font-serif-kr text-lg leading-[1.8] text-foreground">
        &ldquo;{item.one_line_word}&rdquo;
      </p>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/60">
          {item.displayName ?? '익명의 벗'}
        </p>
        <p className="text-[11px] text-muted-foreground/40">
          {new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        {STICKERS.map(({ key, emoji }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs liquid-transition ${
              myReaction === key
                ? 'bg-primary/15 text-primary font-medium'
                : 'bg-muted/60 text-muted-foreground'
            }`}
          >
            <span>{emoji}</span>
            {counts[key] > 0 && <span>{counts[key]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DiscoverClient({
  items,
  userId,
}: {
  items: Item[];
  userId: string;
  today: string;
}) {
  return (
    <div className="px-5 py-8 space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">좋은 묵상 발견</p>
        <h1 className="text-xl font-medium text-foreground">이번 주 동행자들의 말씀</h1>
        <p className="text-xs text-muted-foreground">스티커 반응이 많은 나눔을 모았어요</p>
      </div>

      <p className="text-[11px] text-muted-foreground/50">
        진행 상황이나 연속 일수는 일부러 표시하지 않아요.<br />
        말씀 자체에 머물기 위해서요.
      </p>

      {items.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-sm text-muted-foreground">아직 나눔이 없어요</p>
          <p className="text-xs text-muted-foreground/60">오늘 묵상 후 한 줄 말씀을 나눠보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <WordCard key={item.id} item={item} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
