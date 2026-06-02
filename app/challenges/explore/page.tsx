import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExploreClient from './ExploreClient';

interface Template {
  root_id: string;
  name: string;
  category: string;
  emoji: string | null;
  target_value: number | null;
  target_unit: string | null;
  participant_count: number;
}

interface RecentStart {
  id: string;
  name: string;
  emoji: string | null;
  category: string;
  user_id: string;
  created_at: string;
  display_name: string | null;
  handle: string | null;
  avatar_seed: string | null;
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const [templatesRes, recentRes] = await Promise.all([
    supabase
      .from('challenge_templates')
      .select('*')
      .order('participant_count', { ascending: false })
      .limit(60),
    supabase
      .from('recent_challenge_starts')
      .select('*')
      .limit(20),
  ]);

  const templates = (templatesRes.data ?? []) as Template[];
  const recent = (recentRes.data ?? []) as RecentStart[];

  return (
    <ExploreClient
      userId={user.id}
      templates={templates}
      recent={recent}
    />
  );
}
