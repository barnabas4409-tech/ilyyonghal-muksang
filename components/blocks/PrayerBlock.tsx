'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PrayerBlock as Props } from '@/types/blocks';

export default function PrayerBlock({ readingId, existingReflection, userId }: Props) {
  const [value, setValue] = useState(existingReflection?.prayer ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
          prayer: value.trim(),
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
      <div className="mb-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.18em] mb-1">
          기도
        </p>
        <p className="text-xs text-muted-foreground/70">말씀을 받아 응답하는 한 마디</p>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        placeholder="주님, ..."
        rows={3}
        className="w-full text-sm leading-relaxed text-foreground bg-card border border-border rounded-2xl p-4 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 liquid-transition resize-none"
      />

      <div className="flex items-center justify-end mt-2 h-4">
        {saving && <p className="text-[10px] text-muted-foreground/60">저장 중...</p>}
        {saved && !saving && <p className="text-[10px] text-primary">기도가 보존되었어요</p>}
      </div>
    </div>
  );
}
