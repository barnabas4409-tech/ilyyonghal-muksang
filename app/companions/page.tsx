import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTodayDateString } from '@/utils/date';
import CompanionsClient from './CompanionsClient';
import type { ReflectionReaction } from '@/types';

interface SharedEntry {
  id: string;
  one_line_word: string;
  is_anonymous: boolean;
  user_id: string;
  created_at: string;
  display_name: string | null;
  handle: string | null;
}

export default async function CompanionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const today = getTodayDateString();

  // 사용자의 오늘 묵상 reading_id 확인 (본인 먼저 게이트)
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('reading_track')
    .eq('id', user.id)
    .single();

  const readingTrack = myProfile?.reading_track ?? 'lectionary';

  // 오늘의 reading_id 결정
  let readingId: string | null = null;

  if (readingTrack === 'lectionary') {
    const { data } = await supabase
      .from('lectionary_readings')
      .select('id')
      .lte('sunday_date', today)
      .order('sunday_date', { ascending: false })
      .limit(1)
      .single();
    readingId = data?.id ?? null;
  } else {
    const { data } = await supabase
      .from('daily_readings')
      .select('id')
      .eq('date', today)
      .single();
    readingId = data?.id ?? null;
  }

  // 본인의 오늘 묵상 확인 (게이트: 묵상 완료 필수)
  let hasMyReflection = false;
  if (readingId) {
    const { data: myRef } = await supabase
      .from('reflections')
      .select('id')
      .eq('user_id', user.id)
      .eq('reading_id', readingId)
      .not('one_line_word', 'is', null)
      .single();
    hasMyReflection = !!myRef;
  }

  // 공개 한 줄 말씀 목록 (같은 reading_id, 본인 제외)
  let sharedEntries: SharedEntry[] = [];
  let myReactions: ReflectionReaction[] = [];

  if (hasMyReflection && readingId) {
    const { data: reflections } = await supabase
      .from('reflections')
      .select('id, one_line_word, is_anonymous, user_id, created_at')
      .eq('reading_id', readingId)
      .eq('is_public', true)
      .eq('is_hidden', false)
      .not('one_line_word', 'is', null)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(40);

    if (reflections && reflections.length > 0) {
      // profiles는 별도 쿼리 (reflections → auth.users FK라 direct join 불가)
      const userIds = reflections.filter((r) => !r.is_anonymous).map((r) => r.user_id);
      const profileMap = new Map<string, { display_name: string | null; handle: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, handle')
          .in('id', userIds);
        (profiles ?? []).forEach((p: any) => profileMap.set(p.id, p));
      }

      sharedEntries = reflections.map((r) => {
        const prof = r.is_anonymous ? null : (profileMap.get(r.user_id) ?? null);
        return {
          id: r.id,
          one_line_word: r.one_line_word,
          is_anonymous: r.is_anonymous,
          user_id: r.user_id,
          created_at: r.created_at,
          display_name: prof?.display_name ?? null,
          handle: prof?.handle ?? null,
        };
      });
    }

    // 내 스티커 반응
    if (sharedEntries.length > 0) {
      const reflectionIds = sharedEntries.map((e) => e.id);
      const { data: reactions } = await supabase
        .from('reflection_reactions')
        .select('*')
        .eq('user_id', user.id)
        .in('reflection_id', reflectionIds);
      myReactions = (reactions ?? []) as ReflectionReaction[];
    }
  }

  return (
    <CompanionsClient
      hasMyReflection={hasMyReflection}
      sharedEntries={sharedEntries}
      myReactions={myReactions}
      userId={user.id}
    />
  );
}
