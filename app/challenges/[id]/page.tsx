import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Challenge, ChallengeLog } from '@/types';
import { calculateStreak } from '@/lib/challenges';
import { getTodayDateString } from '@/utils/date';
import ChallengeDetailClient from './ChallengeDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LinkedReflection {
  id: string;
  one_line_word: string | null;
  reading_id: string | null;
  passage: string | null;
  date: string;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  // 챌린지 본인 데이터
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single<Challenge>();

  if (!challenge) notFound();

  // 모든 logs
  const { data: rawLogs } = await supabase
    .from('challenge_logs')
    .select('*')
    .eq('challenge_id', id)
    .order('date', { ascending: true });

  const logs = (rawLogs ?? []) as ChallengeLog[];
  const todayKst = getTodayDateString();
  const streakInfo = calculateStreak(logs, todayKst);

  // 연결된 reflections 정보 (manual join — daily_readings + lectionary_readings)
  const reflectionIds = Array.from(
    new Set(logs.map((l) => l.reflection_id).filter((x): x is string => !!x)),
  );

  let linkedReflections: LinkedReflection[] = [];

  if (reflectionIds.length > 0) {
    const { data: refls } = await supabase
      .from('reflections')
      .select('id, one_line_word, reading_id, created_at')
      .in('id', reflectionIds);

    const readingIds = Array.from(
      new Set((refls ?? []).map((r) => r.reading_id).filter((x): x is string => !!x)),
    );

    let passageMap: Record<string, string> = {};
    if (readingIds.length > 0) {
      const [dailyRes, lectionaryRes] = await Promise.all([
        supabase.from('daily_readings').select('id, passage, title').in('id', readingIds),
        supabase.from('lectionary_readings').select('id, gospel_passage, week_name').in('id', readingIds),
      ]);
      for (const d of dailyRes.data ?? []) passageMap[d.id] = d.passage || d.title;
      for (const l of lectionaryRes.data ?? []) passageMap[l.id] = l.gospel_passage || l.week_name;
    }

    linkedReflections = (refls ?? [])
      .map((r) => ({
        id: r.id,
        one_line_word: r.one_line_word,
        reading_id: r.reading_id,
        passage: r.reading_id ? passageMap[r.reading_id] ?? null : null,
        date: r.created_at,
      }))
      .filter((r) => r.one_line_word) // 한 줄 말씀이 있는 것만
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }

  return (
    <ChallengeDetailClient
      challenge={challenge}
      logs={logs}
      streakInfo={streakInfo}
      linkedReflections={linkedReflections}
      todayKst={todayKst}
      userId={user.id}
    />
  );
}
