'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { MeditationMode } from '@/types';
import posthog from 'posthog-js';

interface Props {
  userId: string;
  defaultMode: MeditationMode;
  defaultDisplayName: string;
  defaultHandle: string;
}

const MODE_OPTIONS: { value: MeditationMode; label: string; desc: string; time: string }[] = [
  {
    value: 'simple',
    label: '간단히',
    desc: '성경 본문과 묵상 기록만',
    time: '5–10분',
  },
  {
    value: 'standard',
    label: '기본',
    desc: '본문 + 한 줄 말씀 + 침묵 + 묵상',
    time: '15–20분',
  },
  {
    value: 'deep',
    label: '깊이',
    desc: '본문 + 한 줄 말씀 + 10분 침묵 + 기도 + 묵상',
    time: '30분 이상',
  },
];

export default function OnboardingClient({ userId, defaultMode, defaultDisplayName, defaultHandle }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<MeditationMode>(defaultMode);
  const [notifHour, setNotifHour] = useState<number | null>(7);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [handle, setHandle] = useState(defaultHandle);
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (saving) return;
    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, unknown> = {
      meditation_mode: mode,
      onboarded_at: new Date().toISOString(),
    };
    if (displayName.trim()) updates.display_name = displayName.trim();
    if (handle.trim()) updates.handle = handle.trim().replace(/^@/, '');

    await supabase.from('profiles').update(updates).eq('id', userId);
    posthog.capture('onboarding_completed', {
      meditation_mode: mode,
      notification_enabled: notifEnabled,
      has_display_name: !!displayName.trim(),
    });
    router.push('/today');
  }

  return (
    <div className="min-h-dvh flex flex-col px-5 py-10">
      {/* 진행 표시 */}
      <div className="flex gap-1.5 mb-10">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="flex-1">
        {/* Step 1: 묵상 깊이 */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">묵상 시작하기</p>
              <h1 className="text-2xl font-medium text-foreground leading-snug">
                어떤 깊이로<br />묵상하고 싶으신가요?
              </h1>
              <p className="text-sm text-muted-foreground">나중에 프로필에서 바꿀 수 있어요</p>
            </div>

            <div className="space-y-3">
              {MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border liquid-transition ${
                    mode === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 알림 시간 */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">묵상 루틴</p>
              <h1 className="text-2xl font-medium text-foreground leading-snug">
                매일 말씀 앞에<br />머물 시간을 정해요
              </h1>
              <p className="text-sm text-muted-foreground">알림은 언제든 끌 수 있어요</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-foreground">매일 알림 받기</p>
                  <p className="text-xs text-muted-foreground mt-0.5">홈 화면에 추가 후 사용 가능</p>
                </div>
                <button
                  onClick={() => setNotifEnabled((v) => !v)}
                  className={`w-12 h-6 rounded-full liquid-transition relative ${
                    notifEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow liquid-transition ${
                      notifEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {notifEnabled && (
                <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">알림 시간</p>
                  <div className="flex gap-2 flex-wrap">
                    {[6, 7, 8, 9, 21, 22].map((h) => (
                      <button
                        key={h}
                        onClick={() => setNotifHour(h)}
                        className={`px-4 py-2 rounded-full text-sm liquid-transition ${
                          notifHour === h
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {h < 12 ? `오전 ${h}시` : h === 12 ? '낮 12시' : `오후 ${h - 12}시`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 닉네임 */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-primary uppercase tracking-[0.25em]">동행자와 함께</p>
              <h1 className="text-2xl font-medium text-foreground leading-snug">
                어떻게 불리고<br />싶으신가요?
              </h1>
              <p className="text-sm text-muted-foreground">닉네임은 동행자에게 표시돼요. 나중에 설정해도 돼요.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-card border border-border rounded-2xl p-4 focus-within:border-primary/40 liquid-transition">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mb-2">닉네임</p>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 말씀의 벗"
                  maxLength={20}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
              </div>

              <div className="bg-card border border-border rounded-2xl p-4 focus-within:border-primary/40 liquid-transition">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mb-2">핸들 (선택)</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_가-힣]/g, ''))}
                    placeholder="비워두면 자동 설정돼요"
                    maxLength={20}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/60 px-1">
                닉네임은 한 달에 한 번 바꿀 수 있어요
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="pt-8 space-y-3">
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full py-4 btn-gold rounded-2xl text-sm font-medium liquid-transition active:scale-[0.98]"
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-4 btn-gold rounded-2xl text-sm font-medium liquid-transition active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? '저장 중...' : '묵상 시작하기 →'}
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full py-2 text-xs text-muted-foreground/60"
          >
            건너뛰기
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-2 text-xs text-muted-foreground/60 disabled:opacity-40"
          >
            닉네임 없이 시작하기
          </button>
        )}
      </div>
    </div>
  );
}
