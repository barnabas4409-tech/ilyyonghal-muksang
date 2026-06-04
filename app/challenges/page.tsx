import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Challenge, ChallengeLog } from '@/types';
import { calculateStreak } from '@/lib/challenges';
import { getTodayDateString } from '@/utils/date';
import ChallengesPageClient from './ChallengesPageClient';

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const todayKst = getTodayDateString();

  const [activeRes, endedRes] = await Promise.all([
    supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .is('ended_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .not('ended_at', 'is', null)
      .order('ended_at', { ascending: false }),
  ]);

  const active = (activeRes.data ?? []) as Challenge[];
  const ended = (endedRes.data ?? []) as Challenge[];

  let todayLogs: ChallengeLog[] = [];
  const streaks: Record<string, number> = {};

  if (active.length > 0) {
    const ids = active.map((c) => c.id);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const since = ninetyDaysAgo.toISOString().split('T')[0];

    const { data: logs } = await supabase
      .from('challenge_logs')
      .select('*')
      .in('challenge_id', ids)
      .gte('date', since)
      .order('date', { ascending: true });

    const allLogs = (logs ?? []) as ChallengeLog[];
    todayLogs = allLogs.filter((l) => l.date === todayKst);

    for (const c of active) {
      const cLogs = allLogs.filter((l) => l.challenge_id === c.id);
      streaks[c.id] = calculateStreak(cLogs, todayKst).current;
    }
  }

  return (
    <ChallengesPageClient
      active={active}
      ended={ended}
      todayLogs={todayLogs}
      streaks={streaks}
      userId={user.id}
      todayKst={todayKst}
    />
  );
}
