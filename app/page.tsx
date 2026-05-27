import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import type { DailyReading, BibleVersion, ReadingTrack, LectionaryReading } from '@/types';
import { getTodayDateString } from '@/utils/date';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = getTodayDateString();
  let bibleVersion: BibleVersion = 'gaeyeok';
  let readingTrack: ReadingTrack = 'lectionary';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('bible_version, reading_track')
      .eq('id', user.id)
      .single();
    if (profile?.bible_version) bibleVersion = profile.bible_version;
    if (profile?.reading_track) readingTrack = profile.reading_track;
  }

  let reading: DailyReading | null = null;
  let lectionaryReading: LectionaryReading | null = null;
  let streakData = null;
  let reflectionDates: string[] = [];

  if (readingTrack === 'lectionary') {
    const { data } = await supabase
      .from('lectionary_readings')
      .select('*')
      .lte('sunday_date', today)
      .order('sunday_date', { ascending: false })
      .limit(1)
      .single<LectionaryReading>();
    lectionaryReading = data;
  } else {
    const { data } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', today)
      .single<DailyReading>();
    reading = data;
  }

  if (user) {
    const [streakRes, reflectionsRes] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase
        .from('reflections')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);

    streakData = streakRes.data;
    if (reflectionsRes.data) {
      const dates = reflectionsRes.data.map((r: { created_at: string }) => r.created_at.split('T')[0]);
      reflectionDates = [...new Set(dates)];
    }
  }

  return (
    <HomeClient
      user={user}
      reading={reading}
      lectionaryReading={lectionaryReading}
      readingTrack={readingTrack}
      streak={streakData}
      reflectionDates={reflectionDates}
      bibleVersion={bibleVersion}
    />
  );
}
