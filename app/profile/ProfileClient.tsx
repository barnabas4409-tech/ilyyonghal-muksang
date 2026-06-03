'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile, Streak, BibleVersion, ReadingTrack, MeditationMode } from '@/types';
import { BIBLE_VERSION_LABELS, READING_TRACK_LABELS, MEDITATION_MODE_LABELS } from '@/types';
import SettingRow from '@/components/ui/SettingRow';
import BlockFlowEditor from '@/components/profile/BlockFlowEditor';
import { subscribePush, unsubscribePush, isPushSubscribed } from '@/utils/push';

type ThemeOption = 'light' | 'dark' | 'system';
const THEME_LABELS: Record<ThemeOption, string> = { light: '라이트', dark: '다크', system: '시스템' };

const PUSH_TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00',
  '12:00', '18:00', '20:00', '21:00',
] as const;
const PUSH_TIME_LABELS: Record<string, string> = {
  '06:00': '오전 6시', '07:00': '오전 7시', '08:00': '오전 8시', '09:00': '오전 9시',
  '12:00': '점심 12시', '18:00': '저녁 6시', '20:00': '저녁 8시', '21:00': '밤 9시',
};

interface Props {
  profile: Profile | null;
  streak: Streak | null;
  totalReflections: number;
}

function formatJoinDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export default function ProfileClient({ profile, streak, totalReflections }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [bibleVersion, setBibleVersion] = useState<BibleVersion>(profile?.bible_version ?? 'gaeyeok');
  const [readingTrack, setReadingTrack] = useState<ReadingTrack>(profile?.reading_track ?? 'lectionary');
  const [meditationMode, setMeditationMode] = useState<MeditationMode>(profile?.meditation_mode ?? 'standard');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 닉네임
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [handle, setHandle] = useState(profile?.handle ?? '');
  const [nickSaving, setNickSaving] = useState(false);
  const [nickSaved, setNickSaved] = useState(false);
  const [nickError, setNickError] = useState<string | null>(null);

  // 블록 조립 (초기값은 Phase 5 BlockFlowEditor가 normalizeBlocks로 처리)
  const initBlocks = (profile as { custom_blocks?: unknown })?.custom_blocks ?? null;

  // 푸시 알림 상태
  const [pushEnabled, setPushEnabled] = useState(profile?.push_enabled ?? false);
  const [pushTime, setPushTime] = useState((profile as any)?.push_time ?? '07:00');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    setPushSupported('serviceWorker' in navigator && 'PushManager' in window);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      isPushSubscribed().then(setPushEnabled);
    }
  }, []);

  async function handlePushToggle() {
    if (!profile?.id || pushLoading) return;
    setPushLoading(true);
    if (pushEnabled) {
      await unsubscribePush(profile.id);
      setPushEnabled(false);
    } else {
      const ok = await subscribePush(profile.id);
      setPushEnabled(ok);
    }
    setPushLoading(false);
  }

  async function handleSavePushTime() {
    if (!profile?.id) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ push_time: pushTime }).eq('id', profile.id);
  }

  async function handleSaveSettings() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase
      .from('profiles')
      .upsert({ id: user.id, bible_version: bibleVersion, reading_track: readingTrack, meditation_mode: meditationMode })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleSaveNickname() {
    if (!displayName.trim() || !handle.trim() || nickSaving) return;
    setNickSaving(true);
    setNickError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNickSaving(false); return; }

    const cleanHandle = handle.trim().toLowerCase().replace(/\s+/g, '_');
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), handle: cleanHandle, handle_changed_at: new Date().toISOString() })
      .eq('id', user.id);

    setNickSaving(false);
    if (error) {
      setNickError(error.code === '23505' ? '이미 사용 중인 아이디예요' : error.message);
      return;
    }
    setHandle(cleanHandle);
    setNickSaved(true);
    setTimeout(() => setNickSaved(false), 2000);
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const stats = [
    { label: '전체 묵상', value: totalReflections, unit: '회' },
    { label: '현재 스트릭', value: streak?.current_streak ?? 0, unit: '일' },
    { label: '최장 스트릭', value: streak?.longest_streak ?? 0, unit: '일' },
  ];

  const bibleOptions = (Object.entries(BIBLE_VERSION_LABELS) as [BibleVersion, string][]).map(
    ([value, label]) => ({ value, label })
  );

  const trackOptions = (Object.entries(READING_TRACK_LABELS) as [ReadingTrack, string][]).map(
    ([value, label]) => ({
      value,
      label,
      badge: value === 'chronological' ? '준비중' : undefined,
    })
  );

  const modeOptions = (Object.entries(MEDITATION_MODE_LABELS) as [MeditationMode, string][]).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-10 pb-7 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{profile?.name ? profile.name[0] : '✝'}</span>
        </div>
        <h1 className="text-lg font-medium text-foreground">
          {profile?.name ?? '나의 묵상'}
        </h1>
        {profile?.created_at && (
          <p className="text-xs text-muted-foreground mt-1">{formatJoinDate(profile.created_at)} 시작</p>
        )}
      </div>

      {/* 닉네임 설정 */}
      <div className="mx-5 card-float px-5 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4 pb-3">닉네임</p>
        <div className="space-y-2 pb-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 16))}
                placeholder="표시 이름"
                className="w-full h-10 px-3 text-sm bg-muted/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <p className="text-[10px] text-muted-foreground/60 px-1">공개 시 표시되는 이름</p>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.slice(0, 20).replace(/[^a-z0-9_\-가-힣]/gi, ''))}
                  placeholder="아이디"
                  className="w-full h-10 pl-7 pr-3 text-sm bg-muted/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 px-1">고유 식별자</p>
            </div>
          </div>
          {nickError && (
            <p className="text-[11px] text-orange-600 dark:text-orange-400">{nickError}</p>
          )}
          <button
            onClick={handleSaveNickname}
            disabled={!displayName.trim() || !handle.trim() || nickSaving}
            className="w-full py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
          >
            {nickSaving ? '저장 중...' : nickSaved ? '저장됨 ✓' : '닉네임 저장'}
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="mx-5 grid grid-cols-3 gap-2 mb-6">
        {stats.map(({ label, value, unit }) => (
          <div key={label} className="card-float p-4 text-center">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{unit}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* 화면 설정 */}
      <div className="mx-5 card-float px-5 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4 pb-3">화면</p>
        <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 mb-4">
          {(['light', 'dark', 'system'] as ThemeOption[]).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                theme === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* 묵상 설정 */}
      <div className="mx-5 card-float px-5 mb-4 divide-y divide-border/50">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4 pb-2">
          묵상 설정
        </p>

        <SettingRow<BibleVersion>
          label="성경 역본"
          options={bibleOptions}
          value={bibleVersion}
          onChange={setBibleVersion}
        />

        <SettingRow<ReadingTrack>
          label="묵상 트랙"
          description={
            readingTrack === 'lectionary'
              ? '교회력에 따라 구약·시편·서신서·복음서를 함께 읽어요'
              : readingTrack === 'curated'
              ? '모세오경부터 서신서까지 하루 한 단락씩 읽어요'
              : '성경 전체를 1년 안에 통독해요'
          }
          options={trackOptions}
          value={readingTrack}
          onChange={val => {
            if (val === 'chronological') return;
            setReadingTrack(val);
          }}
        />

        <SettingRow<MeditationMode>
          label="묵상 깊이"
          description={
            meditationMode === 'simple'
              ? '본문 읽기와 묵상 기록만 해요'
              : meditationMode === 'deep'
              ? '신앙고전 + 10분 기도 + 묵상 기록으로 깊이 머물러요'
              : '신앙고전 + 5분 기도 + 묵상 기록으로 묵상해요'
          }
          options={modeOptions}
          value={meditationMode}
          onChange={setMeditationMode}
        />

        {/* 블록 흐름 편집기 — Notion 스타일 */}
        {profile?.id && (
          <div className="py-4">
            <BlockFlowEditor
              userId={profile.id}
              mode={meditationMode}
              initial={initBlocks}
            />
          </div>
        )}

        <div className="py-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98] liquid-transition"
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : '설정 저장'}
          </button>
        </div>
      </div>

      {/* 알림 설정 */}
      {pushSupported && (
        <div className="mx-5 card-float px-5 mb-4 divide-y divide-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-4 pb-2">알림</p>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">묵상 알림</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pushEnabled ? '알림이 켜져 있어요' : '매일 말씀을 상기시켜 드려요'}
              </p>
            </div>
            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`relative w-12 h-6 rounded-full liquid-transition-fast ${
                pushEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {pushEnabled && (
            <div className="py-3.5">
              <p className="text-sm font-medium text-foreground mb-3">알림 시간</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PUSH_TIME_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setPushTime(t); handleSavePushTime(); }}
                    className={`py-2 text-[11px] font-medium rounded-xl liquid-transition-fast ${
                      pushTime === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    {PUSH_TIME_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 구독 */}
      <div className="mx-5 card-float p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">구독</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {profile?.subscription_tier === 'premium' ? '프리미엄' : '무료 플랜'}
            </p>
          </div>
          {profile?.subscription_tier !== 'premium' && (
            <button className="text-xs text-primary font-medium border border-primary/30 px-3 py-1.5 rounded-full liquid-transition">
              업그레이드
            </button>
          )}
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="mx-5 mb-4">
        <button
          onClick={handleSignOut}
          className="w-full py-4 text-sm text-muted-foreground hover:text-foreground liquid-transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
