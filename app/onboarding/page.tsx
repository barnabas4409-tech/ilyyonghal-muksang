import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, meditation_mode, display_name, handle')
    .eq('id', user.id)
    .single();

  // 이미 완료한 경우 홈으로
  if (profile?.onboarded_at) redirect('/');

  return (
    <OnboardingClient
      userId={user.id}
      defaultMode={profile?.meditation_mode ?? 'standard'}
      defaultDisplayName={profile?.display_name ?? ''}
      defaultHandle={profile?.handle ?? ''}
    />
  );
}
