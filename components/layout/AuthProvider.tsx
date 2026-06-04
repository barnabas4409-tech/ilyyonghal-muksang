'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import posthog from 'posthog-js';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function ensureSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (!error) router.refresh();
      } else if (session.user && !session.user.is_anonymous) {
        posthog.identify(session.user.id, {
          created_at: session.user.created_at,
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('font_size')
          .eq('id', session.user.id)
          .single();
        if (profile?.font_size) {
          document.documentElement.setAttribute('data-font-size', profile.font_size);
        }
      }
    }

    ensureSession();
  }, [router]);

  return <>{children}</>;
}
