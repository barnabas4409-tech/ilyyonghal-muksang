'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile, Streak, BibleVersion, ReadingTrack } from '@/types';
import { BIBLE_VERSION_LABELS, READING_TRACK_LABELS } from '@/types';
import SettingRow from '@/components/ui/SettingRow';

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
  const [bibleVersion, setBibleVersion] = useState<BibleVersion>(
    profile?.bible_version ?? 'gaeyeok'
  );
  const [readingTrack, setReadingTrack] = useState<ReadingTrack>(
    profile?.reading_track ?? 'lectionary'
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveSettings() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase
      .from('profiles')
      .upsert({ id: user.id, bible_version: bibleVersion, reading_track: readingTrack })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      badge: value !== 'lectionary' ? '준비중' : undefined,
    })
  );

  return (
    <div className="flex flex-col min-h-dvh">
      {/* 헤더 */}
      <div className="px-5 pt-10 pb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EDE7DC] dark:bg-[#1E1B14] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">
            {profile?.name ? profile.name[0] : '✝'}
          </span>
        </div>
        <h1 className="text-lg font-medium text-[#2C2416] dark:text-[#E8DCC8]">
          {profile?.name ?? '나의 묵상'}
        </h1>
        {profile?.created_at && (
          <p className="text-xs text-[#C4A882] mt-1">
            {formatJoinDate(profile.created_at)} 시작
          </p>
        )}
      </div>

      {/* 통계 */}
      <div className="mx-5 grid grid-cols-3 gap-3 mb-6">
        {stats.map(({ label, value, unit }) => (
          <div key={label} className="bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-[#8B7355]">{value}</p>
            <p className="text-[10px] text-[#C4A882] mt-0.5">{unit}</p>
            <p className="text-[10px] text-[#C4A882]">{label}</p>
          </div>
        ))}
      </div>

      {/* 설정 */}
      <div className="mx-5 bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl px-5 mb-4 divide-y divide-[#C4A882]/20">
        <p className="text-xs font-semibold text-[#8B7355] tracking-widest uppercase pt-4 pb-2">
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
          description="교회력 성서정과: 교회력에 따른 본문을 따라가요"
          options={trackOptions}
          value={readingTrack}
          onChange={val => {
            if (val !== 'lectionary') return; // 준비중 항목 클릭 방지
            setReadingTrack(val);
          }}
        />

        <div className="py-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full py-3 bg-[#8B7355] text-[#F7F4EF] rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {saving ? '저장 중...' : saved ? '저장됨 ✓' : '설정 저장'}
          </button>
        </div>
      </div>

      {/* 구독 */}
      <div className="mx-5 bg-[#EDE7DC] dark:bg-[#1E1B14] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#2C2416] dark:text-[#E8DCC8]">구독</p>
            <p className="text-xs text-[#C4A882] mt-0.5">
              {profile?.subscription_tier === 'premium' ? '프리미엄' : '무료 플랜'}
            </p>
          </div>
          {profile?.subscription_tier !== 'premium' && (
            <button className="text-xs text-[#8B7355] font-medium border border-[#8B7355] px-3 py-1.5 rounded-full">
              업그레이드
            </button>
          )}
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="mx-5">
        <button
          onClick={handleSignOut}
          className="w-full py-4 text-sm text-[#C4A882] hover:text-[#8B7355] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
