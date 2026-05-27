import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let streak = null;
  let totalReflections = 0;

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: s } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    const { count } = await supabase
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    profile = p;
    streak = s;
    totalReflections = count ?? 0;
  }

  return (
    <ProfileClient
      profile={profile}
      streak={streak}
      totalReflections={totalReflections}
    />
  );
}
