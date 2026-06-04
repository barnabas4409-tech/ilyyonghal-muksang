'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import posthog from 'posthog-js';

interface Group {
  id: string;
  name: string;
  invite_code: string;
  todayCount: number;
}

interface Props {
  userId: string;
  groups: Group[];
}

function randomCode() {
  // 헷갈리는 0/O/1/I 제외한 명확한 6자리
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function GroupClient({ userId, groups }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!groupName.trim() || loading) return;
    setLoading(true);
    setError('');
    const supabase = createClient();

    // 초대 코드 충돌 시 최대 5번 재시도
    let created: { id: string } | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomCode();
      const { data, error: err } = await supabase
        .from('groups')
        .insert({ name: groupName.trim(), invite_code: code, created_by: userId })
        .select('id')
        .single();
      if (!err && data) { created = data; break; }
      // unique 충돌(23505) 이외 에러는 중단
      if (err && err.code !== '23505') break;
    }

    if (!created) {
      setError('그룹 만들기에 실패했어요. 잠시 후 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    await supabase.from('group_members').insert({
      group_id: created.id,
      user_id: userId,
      role: 'leader',
    });
    posthog.capture('group_created');

    setLoading(false);
    router.push(`/group/${created.id}`);
    router.refresh();
  }

  async function handleJoin() {
    const code = inviteCode.trim().toUpperCase();
    if (!code || loading) return;
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', code)
      .single();

    if (!group) { setError('초대 코드를 다시 확인해주세요'); setLoading(false); return; }

    await supabase.from('group_members').upsert({
      group_id: group.id,
      user_id: userId,
    }, { onConflict: 'group_id,user_id' });
    posthog.capture('group_joined');

    setLoading(false);
    router.push(`/group/${group.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 py-7 space-y-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">소그룹</h1>
        <p className="text-xs text-muted-foreground mt-1">함께 묵상하고 인증해요</p>
      </div>

      {/* 내 그룹 목록 */}
      {groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">참여 중인 그룹</p>
          {groups.map(g => (
            <Link key={g.id} href={`/group/${g.id}`} className="card-float p-4 flex items-center justify-between block">
              <div>
                <p className="text-sm font-medium text-foreground">{g.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  오늘 {g.todayCount}명 인증
                </p>
              </div>
              <p className="text-xs text-muted-foreground/60 font-mono">{g.invite_code}</p>
            </Link>
          ))}
        </div>
      )}

      {/* 탭 */}
      <div className="space-y-4">
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          {(['create', 'join'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-xl liquid-transition-fast ${
                tab === t ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground'
              }`}
            >
              {t === 'create' ? '그룹 만들기' : '코드로 참여'}
            </button>
          ))}
        </div>

        {tab === 'create' && (
          <div className="space-y-3">
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="그룹 이름 (예: 청년부 2조)"
              maxLength={30}
              className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={!groupName.trim() || loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
            >
              {loading ? '만드는 중...' : '그룹 만들기'}
            </button>
          </div>
        )}

        {tab === 'join' && (
          <div className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="초대 코드 6자리"
              maxLength={6}
              className="w-full bg-muted/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono tracking-widest"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={inviteCode.length < 6 || loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-medium disabled:opacity-40 active:scale-[0.98] liquid-transition"
            >
              {loading ? '확인 중...' : '참여하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
