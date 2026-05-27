'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { LectionaryReading, Reflection, BibleVersion } from '@/types';
import { BIBLE_VERSION_LABELS } from '@/types';
import { getLiturgicalYearLabel, SEASON_LABELS } from '@/utils/lectionary';
import { createClient } from '@/lib/supabase/client';

interface Props {
  user: User | null;
  lectionary: LectionaryReading | null;
  existingReflection: Reflection | null;
  bibleVersion: BibleVersion;
}

type Tab = 'ot' | 'psalm' | 'epistle' | 'gospel';

const TAB_LABELS: Record<Tab, string> = {
  ot: '구약',
  psalm: '시편',
  epistle: '서신서',
  gospel: '복음서',
};

export default function LectionaryTodayClient({ user, lectionary, existingReflection, bibleVersion }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('gospel');
  const [content, setContent] = useState(existingReflection?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reflectionId, setReflectionId] = useState(existingReflection?.id ?? null);

  async function handleSave() {
    if (!lectionary || !content.trim() || !user) return;
    setSaving(true);
    const supabase = createClient();

    if (reflectionId) {
      await supabase
        .from('reflections')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', reflectionId);
    } else {
      const { data } = await supabase
        .from('reflections')
        .insert({ user_id: user.id, reading_id: lectionary.id, content })
        .select()
        .single();
      if (data) setReflectionId(data.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleShare() {
    const passage = lectionary ? {
      ot: lectionary.ot_passage,
      psalm: lectionary.psalm_passage,
      epistle: lectionary.epistle_passage,
      gospel: lectionary.gospel_passage,
    }[activeTab] : '';
    const text = `📖 ${passage}\n\n✍️ ${content}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('묵상이 클립보드에 복사되었습니다.');
    }
  }

  if (!lectionary) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-5 text-center space-y-2">
        <p className="text-sm text-muted-foreground">이번 주 성서정과를 준비 중입니다</p>
        <p className="text-xs text-muted-foreground/60">잠시 후 다시 확인해주세요</p>
      </div>
    );
  }

  const tabContent: Record<Tab, { passage: string | null; content: string | null }> = {
    ot:      { passage: lectionary.ot_passage,      content: lectionary.ot_content },
    psalm:   { passage: lectionary.psalm_passage,   content: lectionary.psalm_content },
    epistle: { passage: lectionary.epistle_passage, content: lectionary.epistle_content },
    gospel:  { passage: lectionary.gospel_passage,  content: lectionary.gospel_content },
  };

  const current = tabContent[activeTab];

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-7 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            교회력 성서정과
          </span>
          {lectionary.liturgical_year && (
            <span className="text-[10px] text-muted-foreground">
              {getLiturgicalYearLabel(lectionary.liturgical_year)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {BIBLE_VERSION_LABELS[bibleVersion]}
          </span>
        </div>
        <h1 className="text-lg font-medium text-foreground">
          {lectionary.week_name}
        </h1>
        {lectionary.season && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {SEASON_LABELS[lectionary.season] ?? lectionary.season}
          </p>
        )}
      </div>

      {/* 탭 */}
      <div className="px-5 mb-5">
        <div className="flex bg-muted/50 rounded-2xl p-1 gap-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div className="mx-5 card-float p-5 mb-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-3">
          {current.passage ?? '—'}
        </p>
        <p className="font-serif-kr text-base leading-loose text-foreground">
          {current.content ?? '본문을 준비 중입니다'}
        </p>
      </div>

      {/* 묵상 질문 */}
      {lectionary.reflection_question && (
        <div className="px-5 mb-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">묵상 질문</p>
          <p className="text-sm text-foreground leading-relaxed">
            {lectionary.reflection_question}
          </p>
        </div>
      )}

      {/* 묵상 작성 */}
      <div className="flex-1 px-5 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">나의 묵상</p>
        <div className="card-float p-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="하나님이 오늘 내게 말씀하신 것을 기록해보세요..."
            className="w-full min-h-[160px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            rows={6}
          />
        </div>
      </div>

      {/* 비로그인/익명 안내 */}
      {user?.is_anonymous && (
        <div className="mx-5 mb-3 card-float px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">로그인하면 기기 간 동기화돼요</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-xs text-primary font-medium"
          >
            로그인 →
          </button>
        </div>
      )}

      {/* 버튼 */}
      <div className="px-5 pb-4 flex gap-3">
        <button
          onClick={handleShare}
          disabled={!content.trim()}
          className="flex-1 py-3.5 border border-primary/30 text-primary rounded-2xl text-sm font-medium disabled:opacity-30 active:scale-[0.98] liquid-transition"
        >
          공유하기
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="flex-[2] py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
