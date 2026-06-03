'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { OneLineBlock as Props } from '@/types/blocks';
import { josaRo } from '@/utils/korean';
import { generateShareImage } from '@/utils/shareImage';

export default function OneLineBlock({ readingId, existingReflection, userId, displayName, handle }: Props) {
  const [value, setValue] = useState(existingReflection?.one_line_word ?? '');
  const [editing, setEditing] = useState(!existingReflection?.one_line_word);
  const [saved, setSaved] = useState<boolean>(!!existingReflection?.one_line_word);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isShared, setIsShared] = useState(existingReflection?.is_public ?? false);
  const [isAnonymousShare, setIsAnonymousShare] = useState(existingReflection?.is_anonymous ?? false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing, value]);

  async function save() {
    if (!userId || !value.trim() || saving) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: err } = await supabase
      .from('reflections')
      .upsert(
        {
          user_id: userId,
          reading_id: readingId,
          one_line_word: value.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,reading_id' },
      );

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    setEditing(false);
  }

  async function share(anonymous: boolean) {
    if (!userId || sharing) return;
    setSharing(true);
    const supabase = createClient();
    await supabase
      .from('reflections')
      .update({
        is_public: true,
        is_anonymous: anonymous,
      })
      .eq('user_id', userId)
      .eq('reading_id', readingId);
    setSharing(false);
    setIsShared(true);
    setIsAnonymousShare(anonymous);
    setShowShareOptions(false);
  }

  async function unshare() {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from('reflections')
      .update({ is_public: false })
      .eq('user_id', userId)
      .eq('reading_id', readingId);
    setIsShared(false);
    setShowShareOptions(false);
  }

  async function handleShareImage() {
    if (generatingImage || !value.trim()) return;
    setGeneratingImage(true);
    try {
      const blob = await generateShareImage({ text: value.trim(), displayName });
      if (!blob) return;
      const file = new File([blob], '말씀카드.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '오늘의 한 줄 말씀' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '말씀카드.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) console.error(err);
    } finally {
      setGeneratingImage(false);
    }
  }

  return (
    <div className="px-5 py-10">
      <div className="text-center mb-6">
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-1">
          한 줄 말씀
        </p>
        <p className="text-xs text-muted-foreground">오늘 말씀에서 가장 마음에 남은 한 문장</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1 px-4 leading-relaxed">
          성경 구절이어도 좋고, 내 언어로 풀어 써도 좋아요
        </p>
      </div>

      {!editing && saved ? (
        <div className="w-full text-center">
          <button
            onClick={() => setEditing(true)}
            className="w-full text-center group"
            aria-label="한 줄 말씀 편집"
          >
            <p className="font-serif-kr text-2xl leading-relaxed text-foreground px-4 py-6 border-y border-primary/20 group-hover:border-primary/40 liquid-transition">
              &ldquo;{value}&rdquo;
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">탭하여 수정</p>
          </button>
          <button
            onClick={handleShareImage}
            disabled={generatingImage}
            className="mt-3 text-[11px] text-primary/60 border border-primary/20 px-4 py-1.5 rounded-full liquid-transition disabled:opacity-40"
          >
            {generatingImage ? '이미지 생성 중...' : '카드로 저장하기'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="오늘 말씀 중 마음에 남은 한 문장..."
            maxLength={140}
            rows={1}
            className="w-full font-serif-kr text-2xl leading-relaxed text-foreground bg-transparent text-center placeholder:text-muted-foreground/30 focus:outline-none border-y border-primary/20 focus:border-primary/40 py-6 px-4 resize-none overflow-hidden liquid-transition"
            autoFocus={!saved}
          />
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-muted-foreground/60">{value.length}/140</p>
            <button
              onClick={save}
              disabled={!value.trim() || saving || !userId}
              className="text-xs font-medium text-primary disabled:text-muted-foreground/40 liquid-transition px-3 py-1.5 rounded-full border border-primary/30 disabled:border-border"
            >
              {saving ? '받는 중...' : saved ? '다시 받기' : '받았습니다'}
            </button>
          </div>
          {error && (
            <p className="text-[10px] text-orange-600 dark:text-orange-400 text-center px-2">
              저장 실패: {error}
            </p>
          )}
        </div>
      )}

      {/* 공유 섹션 — 저장 완료 후에만 표시 */}
      {saved && userId && (
        <div className="mt-8 border-t border-border/40 pt-6">
          {!displayName ? (
            /* 닉네임 미설정 */
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                닉네임을 설정하면 동행자들과 말씀을 나눌 수 있어요
              </p>
              <Link
                href="/profile"
                className="inline-block text-xs text-primary font-medium border border-primary/30 px-4 py-1.5 rounded-full liquid-transition"
              >
                닉네임 설정하기 →
              </Link>
            </div>
          ) : isShared ? (
            /* 이미 나눔 상태 */
            <div className="text-center space-y-3">
              <p className="text-[10px] text-primary uppercase tracking-[0.2em]">
                {isAnonymousShare ? '익명으로' : `${displayName}${josaRo(displayName!)}`} 나누고 있어요
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/companions"
                  className="text-xs font-medium text-primary border border-primary/30 px-4 py-2 rounded-full liquid-transition"
                >
                  동행자 말씀 보기 →
                </Link>
                <button
                  onClick={unshare}
                  className="text-xs text-muted-foreground/60"
                >
                  나눔 취소
                </button>
              </div>
            </div>
          ) : showShareOptions ? (
            /* 나눔 방법 선택 */
            <div className="space-y-3">
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.18em]">
                어떻게 나눌까요
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => share(false)}
                  disabled={sharing}
                  className="py-3 bg-primary/10 text-primary text-xs font-medium rounded-2xl disabled:opacity-40 liquid-transition active:scale-[0.98]"
                >
                  {displayName}{josaRo(displayName!)}
                </button>
                <button
                  onClick={() => share(true)}
                  disabled={sharing}
                  className="py-3 bg-muted/60 text-foreground text-xs font-medium rounded-2xl disabled:opacity-40 liquid-transition active:scale-[0.98]"
                >
                  익명으로
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                같은 말씀을 읽은 분들과 한 문장을 조용히 나눠요.<br />
                댓글 없이 스티커로만 응답해요.
              </p>
              <button
                onClick={() => setShowShareOptions(false)}
                className="w-full text-xs text-muted-foreground/60 py-1"
              >
                취소
              </button>
            </div>
          ) : (
            /* 나눔 시작 유도 */
            <div className="text-center space-y-2">
              <button
                onClick={() => setShowShareOptions(true)}
                className="text-xs font-medium text-primary border border-primary/30 px-5 py-2 rounded-full liquid-transition active:scale-[0.98]"
              >
                동행자들과 나누기
              </button>
              <p className="text-[10px] text-muted-foreground/50">
                같은 말씀을 읽은 분들의 한 문장도 볼 수 있어요
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
