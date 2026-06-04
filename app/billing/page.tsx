import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.subscription_tier === 'premium';

  return (
    <div className="px-5 py-10 space-y-8">
      <div>
        <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em] mb-2">구독</p>
        <h1 className="text-2xl font-medium text-foreground">말씀 동행 플랜</h1>
      </div>

      {isPremium ? (
        <div className="card-float p-5 space-y-2">
          <p className="text-sm font-medium text-primary">프리미엄 구독 중</p>
          {profile?.subscription_expires_at && (
            <p className="text-xs text-muted-foreground">
              {new Date(profile.subscription_expires_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}까지
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-float p-5 border-2 border-primary/20 space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-base font-medium text-foreground">프리미엄</p>
              <p className="text-lg font-bold text-primary">₩3,900<span className="text-xs font-normal text-muted-foreground">/월</span></p>
            </div>
            <ul className="space-y-2">
              {[
                '묵상 블록 자유 조합',
                '전체 신앙 고전 명언',
                '연간 형성 리포트',
                '소그룹 리더 기능 (최대 20명)',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3.5 btn-gold rounded-2xl text-sm font-medium opacity-60 cursor-not-allowed"
            >
              준비 중 — 곧 오픈해요
            </button>
          </div>

          <div className="card-float p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-base font-medium text-foreground">무료</p>
              <p className="text-sm text-muted-foreground">현재 플랜</p>
            </div>
            <ul className="space-y-2">
              {[
                '매일 묵상 (성서정과 / 큐레이티드)',
                '한 줄 말씀 · 기도 · 실천 기록',
                '소그룹 참여 (최대 1개)',
                '동행자 나눔 피드',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary/40">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
        결제 연동 준비 중입니다.<br />
        오픈 알림을 받고 싶으시면 프로필에서 이메일 수신을 허용해 주세요.
      </p>

      <Link href="/profile" className="block text-center text-xs text-primary font-medium">
        ← 프로필로 돌아가기
      </Link>
    </div>
  );
}
