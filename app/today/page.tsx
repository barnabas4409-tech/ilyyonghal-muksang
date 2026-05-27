import { createClient } from '@/lib/supabase/server';
import TodayClient from './TodayClient';
import LectionaryTodayClient from './LectionaryTodayClient';
import type { DailyReading, Reflection, BibleVersion, LectionaryReading } from '@/types';
import { getTodayDateString } from '@/utils/date';
import { getSundayOf } from '@/utils/lectionary';

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = getTodayDateString();
  let bibleVersion: BibleVersion = 'gaeyeok';
  let readingTrack = 'lectionary';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('bible_version, reading_track')
      .eq('id', user.id)
      .single();

    if (profile?.bible_version) bibleVersion = profile.bible_version;
    if (profile?.reading_track) readingTrack = profile.reading_track;
  }

  // 성서정과 트랙
  if (readingTrack === 'lectionary') {
    const sundayDate = getSundayOf(new Date(today));

    // 이번 주 일요일 기준, 없으면 가장 최근 주일
    const { data: lectionary } = await supabase
      .from('lectionary_readings')
      .select('*')
      .lte('sunday_date', today)
      .order('sunday_date', { ascending: false })
      .limit(1)
      .single<LectionaryReading>();

    let existingReflection: Reflection | null = null;
    if (lectionary && user) {
      const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('reading_id', lectionary.id)
        .single<Reflection>();
      existingReflection = data;
    }

    return (
      <LectionaryTodayClient
        user={user}
        lectionary={lectionary}
        existingReflection={existingReflection}
        bibleVersion={bibleVersion}
      />
    );
  }

  // 큐레이션 / 통독 트랙
  const { data: reading } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', today)
    .single<DailyReading>();

  let existingReflection: Reflection | null = null;
  if (reading && user) {
    const { data } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .eq('reading_id', reading.id)
      .single<Reflection>();
    existingReflection = data;
  }

  return (
    <TodayClient
      user={user}
      reading={reading}
      existingReflection={existingReflection}
      bibleVersion={bibleVersion}
    />
  );
}
