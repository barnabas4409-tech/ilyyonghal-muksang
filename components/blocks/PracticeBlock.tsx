'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PracticeBlock as Props } from '@/types/blocks';

export default function PracticeBlock({ readingId, existingReflection, userId }: Props) {
  const [value, setValue] = useState(existingReflection?.practice ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!userId || value.trim().length < 3 || saving) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: err } = await supabase
      .from('reflections')
      .upsert(
        {
          user_id: userId,
          reading_id: readingId,
          practice: value.trim(),
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
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-5 py-6">
      <div className="mb-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-1">
          오늘의 실천
        </p>
        <p className="text-xs text-muted-foreground/70">말씀을 살아낼 작은 한 가지</p>
      </div>

      <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4 focus-within:border-primary/40 liquid-transition">
        <span className="text-primary text-lg leading-none mt-0.5">✓</span>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          placeholder="오늘 하루, ..."
          rows={2}
          className="flex-1 text-sm leading-relaxed text-foreground bg-transparent placeholder:text-muted-foreground/40 focus:outline-none resize-none"
        />
      </div>

      <div className="flex items-center justify-end mt-2 h-4">
        {saving && <p className="text-[10px] text-muted-foreground/60">저장 중...</p>}
        {saved && !saving && <p className="text-[10px] text-primary">실천이 기록되었어요</p>}
        {error && !saving && (
          <p className="text-[10px] text-orange-600 dark:text-orange-400">저장 실패: {error}</p>
        )}
      </div>
    </div>
  );
}
