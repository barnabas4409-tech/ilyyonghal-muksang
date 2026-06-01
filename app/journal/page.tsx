import { createClient } from '@/lib/supabase/server';
import JournalClient from './JournalClient';

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <JournalClient reflections={[]} />;

  // 1) 본인 reflections (FK 없으므로 자동 임베딩 X → 단순 SELECT)
  const { data: rawReflections } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const reflections = rawReflections ?? [];

  // 2) reading_id를 모아 daily/lectionary 두 테이블 각각 조회 (manual join)
  const readingIds = Array.from(new Set(reflections.map(r => r.reading_id).filter(Boolean)));

  let dailyMap: Record<string, { date: string; passage: string; title: string }> = {};
  let lectionaryMap: Record<string, { sunday_date: string; week_name: string; gospel_passage: string | null }> = {};

  if (readingIds.length > 0) {
    const [dailyRes, lectionaryRes] = await Promise.all([
      supabase
        .from('daily_readings')
        .select('id, date, passage, title')
        .in('id', readingIds),
      supabase
        .from('lectionary_readings')
        .select('id, sunday_date, week_name, gospel_passage')
        .in('id', readingIds),
    ]);

    for (const d of dailyRes.data ?? []) {
      dailyMap[d.id] = { date: d.date, passage: d.passage, title: d.title };
    }
    for (const l of lectionaryRes.data ?? []) {
      lectionaryMap[l.id] = {
        sunday_date: l.sunday_date,
        week_name: l.week_name,
        gospel_passage: l.gospel_passage,
      };
    }
  }

  // 3) reflection에 reading 정보 attach (기존 JournalClient 형식 유지)
  const enriched = reflections.map(r => ({
    ...r,
    daily_readings: r.reading_id ? dailyMap[r.reading_id] ?? null : null,
    lectionary_readings: r.reading_id ? lectionaryMap[r.reading_id] ?? null : null,
  }));

  return <JournalClient reflections={enriched as never[]} />;
}
