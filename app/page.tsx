import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import type { DailyReading, BibleVersion, ReadingTrack, LectionaryReading } from '@/types';
import { getTodayDateString } from '@/utils/date';
import { extractKeyVerse, getContent } from '@/utils/bible';

function getThisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = getTodayDateString();
  let bibleVersion: BibleVersion = 'gaeyeok';
  let readingTrack: ReadingTrack = 'lectionary';
  let userName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('bible_version, reading_track, name')
      .eq('id', user.id)
      .single();
    if (profile?.bible_version) bibleVersion = profile.bible_version;
    if (profile?.reading_track) readingTrack = profile.reading_track;
    if (profile?.name) userName = profile.name;
  }

  let reading: DailyReading | null = null;
  let lectionaryReading: LectionaryReading | null = null;

  const [scriptureRes] = await Promise.all([
    readingTrack === 'lectionary'
      ? supabase
          .from('lectionary_readings')
          .select('*')
          .lte('sunday_date', today)
          .order('sunday_date', { ascending: false })
          .limit(1)
          .single<LectionaryReading>()
      : supabase
          .from('daily_readings')
          .select('*')
          .eq('date', today)
          .single<DailyReading>(),
  ]);

  if (readingTrack === 'lectionary') {
    lectionaryReading = (scriptureRes as any).data;
  } else {
    reading = (scriptureRes as any).data;
  }

  let hasReflectionToday = false;
  let hasCheckInToday = false;
  let streakCount = 0;
  let weeklyCount = 0;
  let userGroup: { id: string; name: string; todayCount: number } | null = null;
  let recentWords: { id: string; one_line_word: string; created_at: string }[] = [];

  if (user) {
    const readingId = lectionaryReading?.id ?? reading?.id;

    const [streakRes, groupRes, reflectionRes, wordsRes] = await Promise.all([
      supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
      !user.is_anonymous
        ? supabase
            .from('group_members')
            .select('group_id, groups(id, name)')
            .eq('user_id', user.id)
            .limit(1)
            .single()
        : Promise.resolve({ data: null, error: null }),
      readingId
        ? supabase
            .from('reflections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('reading_id', readingId)
        : Promise.resolve({ count: 0, error: null }),
      supabase
        .from('reflections')
        .select('id, one_line_word, created_at')
        .eq('user_id', user.id)
        .not('one_line_word', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    streakCount = streakRes.data?.current_streak ?? 0;
    hasReflectionToday = ((reflectionRes as any).count ?? 0) > 0;
    recentWords = (wordsRes.data ?? []) as typeof recentWords;

    const monday = getThisMonday();
    const { count: wCount } = await supabase
      .from('reflections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monday + 'T00:00:00.000Z');
    weeklyCount = wCount ?? 0;

    const groupData = groupRes.data as any;
    if (groupData?.groups) {
      const g = groupData.groups;
      const [countRes, checkRes] = await Promise.all([
        supabase
          .from('devotion_checks')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', g.id)
          .eq('date', today),
        supabase
          .from('devotion_checks')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', g.id)
          .eq('user_id', user.id)
          .eq('date', today),
      ]);
      userGroup = { id: g.id, name: g.name, todayCount: countRes.count ?? 0 };
      hasCheckInToday = (checkRes.count ?? 0) > 0;
    }
  }

  const todayLabel = readingTrack === 'lectionary'
    ? lectionaryReading?.week_name ?? null
    : reading?.passage ?? null;

  // 오늘의 한 구절 — 홈 입구에 표시할 인용
  let todayVerse: { passage: string; text: string } | null = null;
  if (lectionaryReading) {
    // 성서정과: 복음서 본문 우선, 없으면 서신/시편/구약 순
    const text =
      lectionaryReading.gospel_content ||
      lectionaryReading.epistle_content ||
      lectionaryReading.psalm_content ||
      lectionaryReading.ot_content || '';
    const passage =
      lectionaryReading.gospel_passage ||
      lectionaryReading.epistle_passage ||
      lectionaryReading.psalm_passage ||
      lectionaryReading.ot_passage || lectionaryReading.week_name;
    const verse = extractKeyVerse(text, 100);
    if (verse) todayVerse = { passage, text: verse };
  } else if (reading) {
    const text = getContent(reading, bibleVersion);
    const verse = extractKeyVerse(text, 100);
    if (verse) todayVerse = { passage: reading.passage, text: verse };
  }

  return (
    <HomeClient
      user={user}
      userName={userName}
      readingTrack={readingTrack}
      todayLabel={todayLabel}
      bibleVersion={bibleVersion}
      hasReflectionToday={hasReflectionToday}
      hasCheckInToday={hasCheckInToday}
      streakCount={streakCount}
      weeklyCount={weeklyCount}
      userGroup={userGroup}
      recentWords={recentWords}
      todayVerse={todayVerse}
    />
  );
}
