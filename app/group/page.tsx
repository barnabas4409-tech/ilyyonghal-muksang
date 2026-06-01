import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GroupClient from './GroupClient';
import { getTodayDateString } from '@/utils/date';

export default async function GroupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const today = getTodayDateString();

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, invite_code)')
    .eq('user_id', user.id);

  const groupIds = memberships?.map(m => m.group_id) ?? [];
  let todayCounts: Record<string, number> = {};

  if (groupIds.length > 0) {
    const { data: checks } = await supabase
      .from('devotion_checks')
      .select('group_id')
      .in('group_id', groupIds)
      .eq('date', today);

    for (const c of checks ?? []) {
      todayCounts[c.group_id] = (todayCounts[c.group_id] ?? 0) + 1;
    }
  }

  const groups = (memberships ?? [])
    .filter(m => m.groups)
    .map(m => ({
      id: (m.groups as any).id,
      name: (m.groups as any).name,
      invite_code: (m.groups as any).invite_code,
      todayCount: todayCounts[(m.groups as any).id] ?? 0,
    }));

  return <GroupClient userId={user.id} groups={groups} />;
}
