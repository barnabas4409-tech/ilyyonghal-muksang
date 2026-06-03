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

  // 전체 멤버 목록 (리더 현황용)
  const { data: allMembers } = await supabase
    .from('group_members')
    .select('user_id, role')
    .eq('group_id', id);

  const allMemberIds = (allMembers ?? []).map(m => m.user_id);
  const allProfileIds = [...new Set([...userIds, ...allMemberIds])];

  let nameMap: Record<string, string | null> = {};
  if (allProfileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, display_name')
      .in('id', allProfileIds);
    for (const p of profiles ?? []) nameMap[p.id] = p.display_name ?? p.name;
  }

  // 오늘 묵상 완료 멤버 (reflection with content 기준)
  let memberReflectionSet = new Set<string>();
  if (allMemberIds.length > 0) {
    const todayStart = `${today}T00:00:00+09:00`;
    const todayEnd = `${today}T23:59:59+09:00`;
    const { data: todayReflections } = await supabase
      .from('reflections')
      .select('user_id')
      .in('user_id', allMemberIds)
      .gte('updated_at', todayStart)
      .lte('updated_at', todayEnd)
      .not('content', 'is', null);
    for (const r of todayReflections ?? []) memberReflectionSet.add(r.user_id);
  }

  const memberStatus = (allMembers ?? []).map(m => ({
    user_id: m.user_id,
    role: m.role,
    name: nameMap[m.user_id] ?? null,
    doneToday: memberReflectionSet.has(m.user_id),
  }));

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
      memberStatus={memberStatus}
    />
  );
}
