'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FreenoteBlock as Props } from '@/types/blocks';

export default function FreenoteBlock({ readingId, existingReflection, userId }: Props) {
  const [value, setValue] = useState(existingReflection?.extras?.freenote ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!userId || !value.trim() || saving) return;
    setSaving(true);
    const supabase = createClient();

    const { data: current } = await supabase
      .from('reflections')
      .select('extras')
      .eq('user_id', userId)
      .eq('reading_id', readingId)
      .single();

    const merged = {
      ...((current?.extras as object) ?? {}),
      freenote: value.trim(),
    };

    await supabase.from('reflections').upsert(
      {
        user_id: userId,
        reading_id: readingId,
        extras: merged,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,reading_id' },
    );

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-5 py-6">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-3">
        자유 기록
      </p>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        placeholder="떠오른 메모, 인용, 떠오른 생각"
        rows={4}
        className="w-full text-sm leading-relaxed text-foreground bg-transparent border border-dashed border-border rounded-2xl p-4 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 liquid-transition resize-none"
      />

      <div className="flex items-center justify-end mt-2 h-4">
        {saving && <p className="text-[10px] text-muted-foreground/60">저장 중...</p>}
        {saved && !saving && <p className="text-[10px] text-primary">기록되었어요</p>}
      </div>
    </div>
  );
}
