'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Reflection } from '@/types';

export function useReflection(userId: string | undefined, readingId: string | undefined) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !readingId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchReflection() {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('reading_id', readingId)
        .single();

      if (data) setReflection(data);
      setLoading(false);
    }

    fetchReflection();
  }, [userId, readingId]);

  async function saveReflection(content: string, highlightedSentence?: string) {
    if (!userId || !readingId) return;
    setSaving(true);

    const supabase = createClient();

    if (reflection) {
      const { data } = await supabase
        .from('reflections')
        .update({ content, highlighted_sentence: highlightedSentence, updated_at: new Date().toISOString() })
        .eq('id', reflection.id)
        .select()
        .single();

      if (data) setReflection(data);
    } else {
      const { data } = await supabase
        .from('reflections')
        .insert({ user_id: userId, reading_id: readingId, content, highlighted_sentence: highlightedSentence })
        .select()
        .single();

      if (data) {
        setReflection(data);
        await updateStreak(userId, supabase);
      }
    }

    setSaving(false);
  }

  return { reflection, saving, loading, saveReflection };
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

  const last = existing.last_reflection_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newCurrent = 1;
  if (last === yesterdayStr) {
    newCurrent = existing.current_streak + 1;
  } else if (last === today) {
    return; // 오늘 이미 기록함
  }

  const newLongest = Math.max(existing.longest_streak, newCurrent);

  await supabase
    .from('streaks')
    .update({ current_streak: newCurrent, longest_streak: newLongest, last_reflection_date: today })
    .eq('user_id', userId);
}
