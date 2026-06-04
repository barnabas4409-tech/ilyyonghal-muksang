'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import posthog from 'posthog-js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    posthog.capture('login_started', { method: 'magic_link' });
    setLoading(false);
    setSent(true);
  }

  async function handleGoogleLogin() {
    posthog.capture('login_google_clicked');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center px-8">
      <div className="text-center mb-12">
        <h1 className="font-serif-kr text-3xl font-light text-foreground mb-3">
          일용할묵상
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          매일 말씀을 읽고<br />
          묵상을 기록하며<br />
          영적 루틴을 만들어가세요
        </p>
      </div>

      {sent ? (
        <div className="w-full text-center card-float p-6">
          <p className="text-2xl mb-3">✉️</p>
          <p className="text-sm font-medium text-foreground mb-1">이메일을 확인해주세요</p>
          <p className="text-xs text-muted-foreground">{email}로 로그인 링크를 보냈어요</p>
        </div>
      ) : (
        <div className="w-full space-y-3">
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
              className="w-full px-4 py-4 bg-card text-foreground placeholder:text-muted-foreground rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-ring liquid-transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-medium disabled:opacity-50 active:scale-[0.98] liquid-transition"
            >
              {loading ? '전송 중...' : '이메일로 시작하기'}
            </button>
          </form>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-background border border-border rounded-2xl text-sm font-medium text-foreground hover:bg-muted active:scale-[0.98] liquid-transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-8 text-center leading-relaxed">
        시작하면 서비스 이용약관 및<br />개인정보 처리방침에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
