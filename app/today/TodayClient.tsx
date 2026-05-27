'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { DailyReading, Reflection, BibleVersion } from '@/types';
import { BIBLE_VERSION_LABELS } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getContent } from '@/utils/bible';

interface Props {
  user: User | null;
  reading: DailyReading | null;
  existingReflection: Reflection | null;
  bibleVersion: BibleVersion;
}

const LOCAL_KEY = 'draft_reflection';

export default function TodayClient({ user, reading, existingReflection, bibleVersion }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(existingReflection?.content ?? '');
  const [highlighted, setHighlighted] = useState(existingReflection?.highlighted_sentence ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reflectionId, setReflectionId] = useState(existingReflection?.id ?? null);

  // 로컬 임시 저장 불러오기 (비로그인)
  useEffect(() => {
    if (!user && !existingReflection) {
      const draft = localStorage.getItem(LOCAL_KEY);
      if (draft) {
        try {
          const { content: c, highlighted: h } = JSON.parse(draft);
          setContent(c ?? '');
          setHighlighted(h ?? '');
        } catch { /* 무시 */ }
      }
    }
  }, [user, existingReflection]);

  async function handleSave() {
    if (!reading || !content.trim() || !user) return;


    setSaving(true);
    const supabase = createClient();

    if (reflectionId) {
      await supabase
        .from('reflections')
        .update({
          content,
          highlighted_sentence: highlighted || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reflectionId);
    } else {
      const { data } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          reading_id: reading.id,
          content,
          highlighted_sentence: highlighted || null,
        })
        .select()
        .single();

      if (data) {
        setReflectionId(data.id);
        localStorage.removeItem(LOCAL_KEY);
        await updateStreak(user.id, supabase);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleShare() {
    const text = `📖 ${reading?.passage}\n\n${reading?.content}\n\n✍️ ${content}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('묵상이 클립보드에 복사되었습니다.');
    }
  }

  if (!reading) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center px-5 text-center">
        <p className="text-[#C4A882] text-sm">오늘의 말씀을 준비 중입니다</p>
        <p className="text-xs text-[#C4A882] mt-2 opacity-60">잠시 후 다시 확인해주세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-xs text-[#C4A882] tracking-widest mb-1">오늘의 묵상</p>
        <h1 className="text-lg font-medium text-[#2C2416] dark:text-[#E8DCC8]">
          {reading.title}
        </h1>
      </div>

      {/* 말씀 본문 */}
      <div className="mx-5 bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-[#8B7355] font-medium">{reading.passage}</p>
          <span className="text-[10px] text-[#C4A882] bg-[#F7F4EF] dark:bg-[#16140F] px-2 py-0.5 rounded-full">
            {BIBLE_VERSION_LABELS[bibleVersion]}
          </span>
        </div>
        <p className="font-serif-kr text-base leading-loose text-[#2C2416] dark:text-[#E8DCC8]">
          {getContent(reading, bibleVersion)}
        </p>
      </div>

      {/* 묵상 질문 */}
      <div className="px-5 mb-5">
        <p className="text-xs text-[#8B7355] font-medium mb-2">묵상 질문</p>
        <p className="text-sm text-[#2C2416] dark:text-[#E8DCC8] leading-relaxed">
          {reading.reflection_question}
        </p>
      </div>

      {/* 내 마음에 남은 구절 */}
      <div className="px-5 mb-4">
        <label className="block text-xs text-[#C4A882] mb-2">마음에 남은 구절 (선택)</label>
        <input
          type="text"
          value={highlighted}
          onChange={e => setHighlighted(e.target.value)}
          placeholder="말씀 중 마음에 와닿은 구절..."
          className="w-full bg-transparent border-b border-[#EDE7DC] dark:border-[#1E1B14] py-2 text-sm text-[#2C2416] dark:text-[#E8DCC8] placeholder-[#C4A882] focus:outline-none focus:border-[#8B7355] transition-colors"
        />
      </div>

      {/* 묵상 작성 */}
      <div className="flex-1 px-5 mb-4">
        <label className="block text-xs text-[#C4A882] mb-2">나의 묵상</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="하나님이 오늘 내게 말씀하신 것을 기록해보세요..."
          className="w-full min-h-[180px] bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-4 text-sm text-[#2C2416] dark:text-[#E8DCC8] placeholder-[#C4A882] focus:outline-none focus:ring-1 focus:ring-[#8B7355] transition-all"
          rows={8}
        />
      </div>

      {/* 익명 유저 안내 — 기록 연동 권유 */}
      {user?.is_anonymous && (
        <div className="mx-5 mb-3 bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-[#C4A882]">로그인하면 기기 간 동기화돼요</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-xs text-[#8B7355] font-medium"
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
          className="flex-1 py-3.5 border border-[#8B7355] text-[#8B7355] rounded-2xl text-sm font-medium disabled:opacity-30 active:scale-[0.98] transition-all"
        >
          공유하기
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="flex-[2] py-3.5 bg-[#8B7355] text-[#F7F4EF] rounded-2xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
        </button>
      </div>
    </div>
  );
}

async function updateStreak(userId: string, supabase: ReturnType<typeof createClient>) {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_reflection_date: today,
    });
    return;
  }

  if (existing.last_reflection_date === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCurrent = existing.last_reflection_date === yesterdayStr
    ? existing.current_streak + 1
    : 1;
  const newLongest = Math.max(existing.longest_streak, newCurrent);

  await supabase
    .from('streaks')
    .update({ current_streak: newCurrent, longest_streak: newLongest, last_reflection_date: today })
    .eq('user_id', userId);
}
