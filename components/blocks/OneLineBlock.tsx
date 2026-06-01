'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { OneLineBlock as Props } from '@/types/blocks';

export default function OneLineBlock({ readingId, existingReflection, userId }: Props) {
  const [value, setValue] = useState(existingReflection?.one_line_word ?? '');
  const [editing, setEditing] = useState(!existingReflection?.one_line_word);
  const [saved, setSaved] = useState<boolean>(!!existingReflection?.one_line_word);
  const [saving, setSaving] = useState(false);
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
    const supabase = createClient();

    await supabase
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
    setSaved(true);
    setEditing(false);
  }

  return (
    <div className="px-5 py-10">
      <div className="text-center mb-6">
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.2em] mb-1">
          한 줄 말씀
        </p>
        <p className="text-xs text-muted-foreground">오늘 하나님이 내게 주신 한 문장</p>
      </div>

      {!editing && saved ? (
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
      ) : (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="한 문장으로 적어보세요"
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
        </div>
      )}
    </div>
  );
}
