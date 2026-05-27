import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;

  const supabase = await createClient();

  if (token_hash && type) {
    // Magic Link / OTP 방식
    const { data: { user }, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error && user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'id', ignoreDuplicates: true });
    }
  } else if (code) {
    // OAuth (Google 등) 방식
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'id', ignoreDuplicates: true });
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
