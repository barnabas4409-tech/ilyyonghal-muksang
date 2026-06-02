'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { ChallengeCategory } from '@/types';
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/challenges';

interface Template {
  root_id: string;
  name: string;
  category: string;
  emoji: string | null;
  target_value: number | null;
  target_unit: string | null;
  participant_count: number;
}

interface RecentStart {
  id: string;
  name: string;
  emoji: string | null;
  category: string;
  user_id: string;
  created_at: string;
  display_name: string | null;
  handle: string | null;
  avatar_seed: string | null;
}

interface Props {
  userId: string;
  templates: Template[];
  recent: RecentStart[];
}

const EXPLORE_CATEGORIES = CATEGORY_ORDER.filter((c) => c !== 'meditation');

function daysAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
}

export default function ExploreClient({ userId, templates, recent }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory>('study');
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const filteredTemplates = useMemo(
    () => templates.filter((t) => t.category === activeCategory),
    [templates, activeCategory],
  );

  const filteredRecent = useMemo(
    () => recent.filter((r) => r.category === activeCategory).slice(0, 8),
    [recent, activeCategory],
  );

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates) {
      map[t.category] = (map[t.category] ?? 0) + t.participant_count;
    }
    return map;
  }, [templates]);

  async function copyAndStart(template: Template) {
    if (copyingId) return;
    setCopyingId(template.root_id);
    const supabase = createClient();
    const { error } = await supabase.from('challenges').insert({
      user_id: userId,
      name: template.name,
      emoji: template.emoji,
      category: template.category,
      cadence: 'daily',
      target_value: template.target_value,
      target_unit: template.target_unit,
      is_pinned: true,
      is_public: false,           // 복사본은 기본 비공개 — 사용자가 원하면 다시 공개로
      copied_from: template.root_id,
    });
    setCopyingId(null);

    if (!error) {
      startTransition(() => {
        router.push('/');
        router.refresh();
      });
    }
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-4 pb-10 space-y-8">

      <header className="space-y-2">
        <Link
          href="/"
          className="inline-block -ml-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground liquid-transition-fast"
        >
          ← 홈
        </Link>
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-foreground">함께 시작하기</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            같은 카테고리에서 다른 분들이 어떤 훈련을 이어가고 있는지 둘러보세요.
            마음에 닿는 훈련을 내 것으로 시작할 수 있어요.
          </p>
        </div>
      </header>

      {/* 카테고리 탭 */}
      <div className="-mx-5 px-5 overflow-x-auto">
        <div className="flex gap-1.5 pb-1">
          {EXPLORE_CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const count = categoryCounts[c] ?? 0;
            const active = activeCategory === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium liquid-transition-fast ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                {meta.defaultEmoji} {meta.label}
                {count > 0 && (
                  <span className={`ml-1.5 ${active ? 'opacity-80' : 'opacity-50'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 자주 시작하는 훈련 (집계, 비교 X) */}
      <section className="space-y-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
          자주 시작하는 훈련
        </p>

        {filteredTemplates.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 py-6 text-center">
            아직 이 카테고리에 공개된 훈련이 없어요.
            <br />
            첫 번째가 되어보세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTemplates.map((t) => {
              const emoji = t.emoji || CATEGORY_META[t.category as ChallengeCategory].defaultEmoji;
              const target = t.target_value
                ? `${t.target_value}${t.target_unit ?? ''}`
                : null;
              return (
                <li
                  key={t.root_id}
                  className="card-float p-4 flex items-center gap-3"
                >
                  <span className="text-lg shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                      {target && (
                        <p className="text-[11px] text-muted-foreground/70 shrink-0">{target}</p>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      {t.participant_count}명이 함께 걷는 중
                    </p>
                  </div>
                  <button
                    onClick={() => copyAndStart(t)}
                    disabled={copyingId === t.root_id}
                    className="shrink-0 text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-full liquid-transition-fast hover:bg-primary/5 disabled:opacity-40"
                  >
                    {copyingId === t.root_id ? '시작 중...' : '나도 시작'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 이번 주 새로 시작한 분들 (격려용, 진행 상황 미노출) */}
      {filteredRecent.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em]">
            이번 주 새로 시작한 분들
          </p>
          <ul className="space-y-3">
            {filteredRecent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 text-sm">
                <span className="text-base">🌱</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">
                    <span className="text-primary">{r.display_name ?? '벗'}</span>
                    <span className="text-muted-foreground"> 님이 </span>
                    <span>{r.emoji ?? ''} {r.name}</span>
                    <span className="text-muted-foreground"> 시작</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {daysAgo(r.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 따뜻한 안내 */}
      <section className="text-center text-[11px] text-muted-foreground/70 leading-relaxed border-t border-border/40 pt-6">
        진행 상황이나 연속 일수는 일부러 표시하지 않아요.<br />
        함께 걸어간다는 것만으로 충분해요.
      </section>
    </div>
  );
}
