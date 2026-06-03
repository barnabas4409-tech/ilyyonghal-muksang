'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getTodayDateString } from '@/utils/date';
import type { JournalBlock as Props } from '@/types/blocks';
import Link from 'next/link';
import CheckInSheet from '@/components/group/CheckInSheet';

export default function JournalBlock({ readingId, reflectionQuestion, existingReflection, userId, isAnonymous, groupId }: Props) {
  const [title, setTitle] = useState(existingReflection?.title ?? '');
  const [content, setContent] = useState(existingReflection?.content ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existingReflection?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reflectionId, setReflectionId] = useState(existingReflection?.id ?? null);
  const [error, setError] = useState<string | null>(null);

  function addTag(raw: string) {
    const tag = raw.replace(/^#/, '').trim();
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    setTags(prev => [...prev, tag]);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  async function handleSave() {
    if (!content.trim() || !userId) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { data, error: err } = await supabase
      .from('reflections')
      .upsert(
        {
          user_id: userId,
          reading_id: readingId,
          title: title.trim() || null,
          content,
          tags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,reading_id' },
      )
      .select()
      .single();

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) setReflectionId(data.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleShare() {
    if (!content.trim() || sharing) return;
    setSharing(true);
    try {
      const text = title ? `📖 ${title}\n\n✍️ ${content}` : `✍️ ${content}`;
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) console.error(err);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      {reflectionQuestion && (
        <div className="px-5 mb-5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-2">묵상 질문</p>
          <p className="text-sm text-foreground leading-relaxed font-serif-kr">{reflectionQuestion}</p>
        </div>
      )}

      <div className="px-5 mb-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-3">나의 묵상</p>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 focus-within:border-primary/40 liquid-transition">
          {/* 제목 */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="제목 (선택)"
            maxLength={60}
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none border-b border-border/40 pb-2"
          />

          {/* 본문 */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="오늘 말씀을 읽으며 마음에 떠오른 것, 느낀 것, 떠오른 질문을 자유롭게 적어보세요."
            className="w-full min-h-[140px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
            rows={6}
          />

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setTags(prev => prev.filter(x => x !== t))}
                className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full"
              >
                #{t} ✕
              </button>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "#태그 추가 (Enter)" : "+태그"}
                className="text-[11px] text-muted-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/40 min-w-[80px]"
              />
            )}
          </div>

          {/* 글자 수 */}
          <p className="text-[10px] text-muted-foreground/50 text-right">{content.length}자</p>
        </div>
      </div>

      <div className="px-5 pb-2 flex gap-3">
        <button
          onClick={handleShare}
          disabled={!content.trim() || sharing}
          className="flex-1 py-3.5 border border-primary/30 text-primary rounded-2xl text-sm font-medium disabled:opacity-30 active:scale-[0.98] liquid-transition"
        >
          {sharing ? '공유 중...' : '공유하기'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !content.trim()}
          className="flex-[2] py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
        >
          {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장하기'}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-orange-600 dark:text-orange-400 px-5 pb-3">
          저장 실패: {error}
        </p>
      )}

      {/* 저장 후: 소그룹 인증 or 참여 유도 */}
      {reflectionId && (
        <div className="px-5 pb-2">
          {groupId && userId ? (
            <CheckInSheet groupId={groupId} userId={userId} date={getTodayDateString()} />
          ) : userId && !isAnonymous ? (
            <div className="p-4 bg-muted/50 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">소그룹과 함께하기</p>
                <p className="text-xs text-muted-foreground mt-0.5">묵상 인증으로 서로 격려해요</p>
              </div>
              <Link href="/group" className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-full liquid-transition shrink-0 ml-3">
                참여하기 →
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {/* 묵상 완료 카드 */}
      {reflectionId && (
        <div className="mx-5 mb-10 mt-6 p-6 rounded-3xl border border-primary/20 bg-primary/5 text-center space-y-4">
          <p className="text-3xl">🙏</p>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">오늘의 묵상을 마쳤어요</p>
            <p className="text-xs text-muted-foreground">말씀 앞에 충실히 머물렀어요</p>
          </div>
          <div className="flex gap-2 justify-center pt-1">
            {!isAnonymous && (
              <Link
                href="/companions"
                className="text-xs text-primary border border-primary/30 px-4 py-2 rounded-full liquid-transition active:scale-[0.98]"
              >
                동행자 말씀 보기
              </Link>
            )}
            <Link
              href="/"
              className="text-xs font-medium btn-gold px-5 py-2 rounded-full liquid-transition active:scale-[0.98]"
            >
              홈으로 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
