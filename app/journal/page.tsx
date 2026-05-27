import { createClient } from '@/lib/supabase/server';
import JournalClient from './JournalClient';

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let reflections: object[] = [];
  if (user) {
    const { data } = await supabase
      .from('reflections')
      .select(`*, daily_readings (date, passage, title)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    reflections = data ?? [];
  }

  return <JournalClient reflections={reflections as never[]} />;
}
