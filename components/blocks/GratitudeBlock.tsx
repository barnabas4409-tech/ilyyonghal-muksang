'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GratitudeBlock as Props } from '@/types/blocks';

export default function GratitudeBlock({ readingId, existingReflection, userId }: Props) {
  const [value, setValue] = useState(existingReflection?.extras?.gratitude ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!userId || !value.trim() || saving) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { data: current } = await supabase
      .from('reflections')
      .select('extras')
      .eq('user_id', userId)
      .eq('reading_id', readingId)
      .single();

    const merged = {
      ...((current?.extras as object) ?? {}),
      gratitude: value.trim(),
    };

    const { error: err } = await supabase.from('reflections').upsert(
      {
        user_id: userId,
        reading_id: readingId,
        extras: merged,
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
          감사
        </p>
        <p className="text-xs text-muted-foreground/70">오늘 감사한 것들</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        placeholder="오늘 마음에 떠오른 감사를 적어보세요"
        rows={3}
        className="w-full text-sm leading-relaxed text-foreground bg-card border border-border rounded-2xl p-4 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 liquid-transition resize-none"
      />

      <div className="flex items-center justify-end mt-2 h-4">
        {saving && <p className="text-[10px] text-muted-foreground/60">저장 중...</p>}
        {saved && !saving && <p className="text-[10px] text-primary">감사가 기록되었어요</p>}
        {error && !saving && (
          <p className="text-[10px] text-orange-600 dark:text-orange-400">저장 실패: {error}</p>
        )}
      </div>
    </div>
  );
}
