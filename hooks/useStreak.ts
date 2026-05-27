'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Streak } from '@/types';

export function useStreak(userId: string | undefined) {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [reflectionDates, setReflectionDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchStreak() {
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakData) setStreak(streakData);

      // 최근 7일 묵상 날짜
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: reflections } = await supabase
        .from('reflections')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (reflections) {
        const dates = reflections.map(r => r.created_at.split('T')[0]);
        setReflectionDates([...new Set(dates)]);
      }

      setLoading(false);
    }

    fetchStreak();
  }, [userId]);

  return { streak, reflectionDates, loading };
}
