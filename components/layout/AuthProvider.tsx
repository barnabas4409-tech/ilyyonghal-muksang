'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function ensureSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        // 익명 세션이 새로 생긴 후엔 RSC를 갱신해 user.id가 페이지에 흐르게 한다.
        // 이걸 안 하면 첫 방문 시 모든 페이지가 user=null로 렌더된 채로 남고,
        // 그 후 블록 저장 등이 silent fail.
        if (!error) router.refresh();
      }
    }

    ensureSession();
  }, [router]);

  return <>{children}</>;
}
