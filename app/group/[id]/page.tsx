import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GroupFeedClient from './GroupFeedClient';
import { getTodayDateString } from '@/utils/date';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupFeedPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const today = getTodayDateString();

  // 그룹 정보 + 멤버 여부 확인
  const [groupResult, memberResult] = await Promise.all([
    supabase.from('groups').select('id, name, invite_code').eq('id', id).single(),
    supabase.from('group_members').select('id').eq('group_id', id).eq('user_id', user.id).single(),
  ]);

  if (!groupResult.data || !memberResult.data) notFound();

  const group = groupResult.data;

  // 공지 목록 (최신 3개)
  const { data: posts } = await supabase
    .from('group_posts')
    .select('id, content, created_at, author_id')
    .eq('group_id', id)
    .order('created_at', { ascending: false })
    .limit(3);

  // 내 역할 (리더 여부)
  const { data: myMembership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single();

  const isLeader = myMembership?.role === 'leader';

  // 오늘 인증 목록 + 반응
  const { data: rawChecks } = await supabase
    .from('devotion_checks')
    .select(`
      id, user_id, photo_url, caption,
      check_reactions(id, sticker, user_id)
    `)
    .eq('group_id', id)
    .eq('date', today);

  // 사용자 이름 조회
  const userIds = [...new Set((rawChecks ?? []).map(c => c.user_id))];
  let nameMap: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);
    for (const p of profiles ?? []) nameMap[p.id] = p.name;
  }

  const checks = (rawChecks ?? []).map(c => ({
    id: c.id,
    user_id: c.user_id,
    photo_url: c.photo_url,
    caption: c.caption,
    userName: nameMap[c.user_id] ?? null,
    reactions: (c.check_reactions ?? []) as { id: string; sticker: string; user_id: string }[],
  }));

  return (
    <GroupFeedClient
      groupId={id}
      groupName={group.name}
      inviteCode={group.invite_code}
      userId={user.id}
      isLeader={isLeader}
      posts={posts ?? []}
      checks={checks}
    />
  );
}
