import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DiscoverClient from './DiscoverClient';
import { getTodayDateString } from '@/utils/date';

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const today = getTodayDateString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const since = sevenDaysAgo.toISOString();

  // 최근 7일 공개 나눔 중 반응 많은 순
  const { data: reflections } = await supabase
    .from('reflections')
    .select(`
      id, one_line_word, user_id, created_at,
      reflection_reactions(id, sticker, user_id)
    `)
    .eq('is_public', true)
    .eq('is_hidden', false)
    .not('one_line_word', 'is', null)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(50);

  // 반응 수 기준 정렬
  const sorted = (reflections ?? [])
    .map(r => ({
      ...r,
      reactionCount: (r.reflection_reactions ?? []).length,
    }))
    .sort((a, b) => b.reactionCount - a.reactionCount)
    .slice(0, 20);

  // 프로필 조회
  const userIds = [...new Set(sorted.map(r => r.user_id))];
  let profileMap: Record<string, { display_name: string | null; is_anonymous?: boolean }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);
    for (const p of profiles ?? []) profileMap[p.id] = { display_name: p.display_name };
  }

  // 내 반응 상태
  const myReactionMap: Record<string, string> = {};
  const myReflectionIds = sorted.map(r => r.id);
  if (myReflectionIds.length > 0) {
    const { data: myReactions } = await supabase
      .from('reflection_reactions')
      .select('reflection_id, sticker')
      .in('reflection_id', myReflectionIds)
      .eq('user_id', user.id);
    for (const mr of myReactions ?? []) myReactionMap[mr.reflection_id] = mr.sticker;
  }

  const items = sorted.map(r => {
    const isAnon = (reflections?.find(x => x.id === r.id) as any)?.is_anonymous ?? false;
    return {
      id: r.id,
      one_line_word: r.one_line_word,
      user_id: r.user_id,
      created_at: r.created_at,
      displayName: isAnon ? null : (profileMap[r.user_id]?.display_name ?? null),
      reactionCount: r.reactionCount,
      reactions: (r.reflection_reactions ?? []) as { id: string; sticker: string; user_id: string }[],
      myReaction: myReactionMap[r.id] ?? null,
    };
  });

  return (
    <DiscoverClient items={items} userId={user.id} today={today} />
  );
}
